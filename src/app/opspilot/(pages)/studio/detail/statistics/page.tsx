'use client';

import React, { useEffect, useState } from 'react';
import { Card, Tooltip, Spin, message } from 'antd';
import { useSearchParams } from 'next/navigation';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Line, LineConfig } from '@ant-design/charts';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import styles from './index.module.scss';
import TimeSelector from '@/components/time-selector';

type DataField = 'tokenOverviewData' | 'conversationsData' | 'activeUsersData';

const ChartComponent: React.FC = () => {
  const { get } = useApiClient();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const getLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    return [start.getTime(), end.getTime()];
  };
  const [dates, setDates] = useState<number[]>(getLast7Days());

  // 独立状态和 loading 标识
  const [tokenConsumption, setTokenConsumption] = useState(0);
  const [loadingTokenConsumption, setLoadingTokenConsumption] = useState(true);

  const [tokenOverviewData, setTokenOverviewData] = useState<any[]>([]);
  const [loadingTokenOverview, setLoadingTokenOverview] = useState(true);

  const [conversationsData, setConversationsData] = useState<any[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const [activeUsersData, setActiveUsersData] = useState<any[]>([]);
  const [loadingActiveUsers, setLoadingActiveUsers] = useState(true);

  // 分别请求各卡片数据
  const fetchTokenConsumption = async (params: any) => {
    setLoadingTokenConsumption(true);
    try {
      const res = await get('/bot_mgmt/get_total_token_consumption/', { params });
      setTokenConsumption(res);
    } catch (error) {
      message.error('Failed to fetch tokenConsumption data');
      console.error(error);
    }
    setLoadingTokenConsumption(false);
  };

  const fetchTokenOverview = async (params: any) => {
    setLoadingTokenOverview(true);
    try {
      const res = await get('/bot_mgmt/get_token_consumption_overview/', { params });
      setTokenOverviewData(res);
    } catch (error) {
      message.error('Failed to fetch tokenOverview data');
      console.error(error);
    }
    setLoadingTokenOverview(false);
  };

  const fetchConversations = async (params: any) => {
    setLoadingConversations(true);
    try {
      const dataResponse = await get('/bot_mgmt/get_conversations_line_data/', { params });
      const combinedData: any[] = [];
      const totalData: any[] = [];
      for (const [key, values] of Object.entries(dataResponse)) {
        (values as any[]).forEach(item => {
          if (key === 'total') {
            totalData.push({ ...item, category: key });
          } else {
            combinedData.push({ ...item, category: key });
          }
        });
      }
      const sortedData = [...totalData, ...combinedData];
      setConversationsData(sortedData);
    } catch (error) {
      message.error('Failed to fetch conversations data');
      console.error(error);
    }
    setLoadingConversations(false);
  };

  const fetchActiveUsers = async (params: any) => {
    setLoadingActiveUsers(true);
    try {
      const dataResponse = await get('/bot_mgmt/get_active_users_line_data/', { params });
      const combinedData: any[] = [];
      const totalData: any[] = [];
      for (const [key, values] of Object.entries(dataResponse)) {
        (values as any[]).forEach(item => {
          if (key === 'total') {
            totalData.push({ ...item, category: key });
          } else {
            combinedData.push({ ...item, category: key });
          }
        });
      }
      const sortedData = [...totalData, ...combinedData];
      setActiveUsersData(sortedData);
    } catch (error) {
      message.error('Failed to fetch activeUsers data');
      console.error(error);
    }
    setLoadingActiveUsers(false);
  };

  const fetchAllData = async () => {
    const dateParams: any = {};
    if (dates && dates[0] && dates[1]) {
      dateParams.start_time = new Date(dates[0]).toISOString();
      dateParams.end_time = new Date(dates[1]).toISOString();
    }
    const params = { bot_id: id, ...dateParams };

    fetchTokenConsumption(params);
    fetchTokenOverview(params);
    fetchConversations(params);
    fetchActiveUsers(params);
  };

  useEffect(() => {
    if (id) {
      fetchAllData();
    }
  }, [dates, id]);

  const handleDateChange = (value: number[]) => {
    setDates(value);
    // 移除了 fetchAllData(value) 调用，依靠 useEffect 响应日期更新
  };

  // 根据数据状态生成图表配置
  const lineConfig = (dataField: DataField): LineConfig => {
    let chartData: any[] = [];
    if (dataField === 'tokenOverviewData') chartData = tokenOverviewData;
    if (dataField === 'conversationsData') chartData = conversationsData;
    if (dataField === 'activeUsersData') chartData = activeUsersData;
    const isTokenOverview = dataField === 'tokenOverviewData';
    return {
      data: chartData,
      xField: 'time',
      yField: 'count',
      seriesField: !isTokenOverview ? 'category' : undefined,
      smooth: !isTokenOverview,
      height: 250,
      autoFit: true,
      colorField: !isTokenOverview ? 'category' : undefined,
      scale: { color: { range: ['#155AEF', '#30BF78', '#FAAD14', '#b842ff'] } },
      tooltip: {
        items: [{ channel: 'y' }],
      },
    };
  };

  const renderCard = (titleKey: string, tooltipKey: string, children: React.ReactNode, key: string) => (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span>{t(titleKey)}</span>
          <Tooltip title={t(tooltipKey)}>
            <InfoCircleOutlined className={`${styles.tipIcon}`} />
          </Tooltip>
        </div>
      }
      key={key}
    >
      {children}
    </Card>
  );

  return (
    <div className={`h-full flex flex-col ${styles.statisticsContainer}`}>
      <div className="flex justify-end mb-4">
        <TimeSelector
          onlyTimeSelect
          defaultValue={{
            selectValue: 10080,
            rangePickerVaule: null
          }}
          onChange={handleDateChange}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {renderCard(
          'studio.statistics.totalConsumption',
          'studio.statistics.totalConsumptionDesc',
          loadingTokenConsumption ? (
            <div className="flex justify-center items-center h-[250px]">
              <Spin size="large" />
            </div>
          ) : (
            <div className="flex justify-center items-center text-8xl font-bold h-[250px]">
              {tokenConsumption}
            </div>
          ),
          'totalConsumption'
        )}
        {renderCard(
          'studio.statistics.totalConsumptionOverview',
          'studio.statistics.totalConsumptionOverviewDesc',
          loadingTokenOverview ? (
            <div className="flex justify-center items-center h-[250px]">
              <Spin size="large" />
            </div>
          ) : (
            <Line {...lineConfig('tokenOverviewData')} />
          ),
          'totalConsumptionOverview'
        )}
        {renderCard(
          'studio.statistics.totalConversation',
          'studio.statistics.totalConversationDesc',
          loadingConversations ? (
            <div className="flex justify-center items-center h-[250px]">
              <Spin size="large" />
            </div>
          ) : (
            <Line {...lineConfig('conversationsData')} />
          ),
          'totalConversation'
        )}
        {renderCard(
          'studio.statistics.totalActiveUser',
          'studio.statistics.totalActiveUserDesc',
          loadingActiveUsers ? (
            <div className="flex justify-center items-center h-[250px]">
              <Spin size="large" />
            </div>
          ) : (
            <Line {...lineConfig('activeUsersData')} />
          ),
          'totalActiveUser'
        )}
      </div>
    </div>
  );
};

export default ChartComponent;
