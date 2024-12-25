'use client';

import React, { useEffect, useState } from 'react';
import { Card, Tooltip, Spin, message, Select } from 'antd';
import { useSearchParams } from 'next/navigation';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Line, LineConfig } from '@ant-design/charts';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import styles from './index.module.scss';

dayjs.extend(utc);

const { Option } = Select;

const getDefaultRange = (): { start: Dayjs; end: Dayjs } => {
  const end = dayjs().utc();
  const start = dayjs().utc().subtract(6, 'days');
  return { start, end };
};

enum ChartType {
  TOKEN_CONSUMPTION = 'tokenConsumption',
  TOKEN_OVERVIEW = 'tokenOverview',
  CONVERSATIONS = 'conversations',
  ACTIVE_USERS = 'activeUsers',
}

type DataField = 'tokenOverviewData' | 'conversationsData' | 'activeUsersData';

const ChartComponent: React.FC = () => {
  const { get } = useApiClient();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [data, setData] = useState({
    tokenConsumption: 0,
    tokenOverviewData: [],
    conversationsData: [],
    activeUsersData: [],
    loading: true,
  });
  const [dateRange, setDateRange] = useState<{ start: Dayjs; end: Dayjs }>(getDefaultRange());

  const fetchData = async (type: ChartType, params: any) => {
    const endpoints = {
      [ChartType.TOKEN_CONSUMPTION]: '/bot_mgmt/get_total_token_consumption/',
      [ChartType.TOKEN_OVERVIEW]: '/bot_mgmt/get_token_consumption_overview/',
      [ChartType.CONVERSATIONS]: '/bot_mgmt/get_conversations_line_data/',
      [ChartType.ACTIVE_USERS]: '/bot_mgmt/get_active_users_line_data/',
    };

    try {
      const dataResponse = await get(endpoints[type], { params });

      switch (type) {
        case ChartType.TOKEN_CONSUMPTION:
          setData(prevData => ({
            ...prevData,
            tokenConsumption: dataResponse,
          }));
          break;
        case ChartType.TOKEN_OVERVIEW:
          setData(prevData => ({
            ...prevData,
            [`${type}Data`]: dataResponse,
          }));
          break;
        case ChartType.CONVERSATIONS:
        case ChartType.ACTIVE_USERS:
          const combinedData: any[] = [];
          const totalData: any[] = [];
          // total data is always the first element in the response
          for (const [key, values] of Object.entries(dataResponse)) {
            (values as any[]).forEach((item: any) => {
              if (key === 'total') {
                totalData.push({ ...item, category: key });
              } else {
                combinedData.push({ ...item, category: key });
              }
            });
          }
          const sortedData = [...totalData, ...combinedData];
          setData(prevData => ({
            ...prevData,
            [`${type}Data`]: sortedData,
          }));
          break;
        default:
          break;
      }
    } catch (error) {
      message.error(`Failed to fetch ${type} data`);
      console.error(error);
    }
  };

  const fetchAllData = async (start: Dayjs, end: Dayjs) => {
    setData(prevData => ({ ...prevData, loading: true }));
    const params = {
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      bot_id: id,
    };

    await Promise.all([
      fetchData(ChartType.TOKEN_CONSUMPTION, params),
      fetchData(ChartType.TOKEN_OVERVIEW, params),
      fetchData(ChartType.CONVERSATIONS, params),
      fetchData(ChartType.ACTIVE_USERS, params),
    ]);
    setData(prevData => ({ ...prevData, loading: false }));
  };

  useEffect(() => {
    fetchAllData(dateRange.start, dateRange.end);
  }, [dateRange]);

  const handleDateRangeChange = (value: string) => {
    let start, end;
    switch (value) {
      case '7d':
        start = dayjs().utc().subtract(6, 'days');
        end = dayjs().utc();
        break;
      default:
        ({ start, end } = getDefaultRange());
    }
    setDateRange({ start, end });
  };

  const lineConfig = (dataField: DataField): LineConfig => {
    const isTokenOverview = dataField === 'tokenOverviewData';
    return {
      data: data[dataField],
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
      }
    };
  };

  if (data.loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  }

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
        <Select defaultValue="7d" onChange={handleDateRangeChange} className="w-32">
          <Option value="7d">{t('studio.statistics.last7Days')}</Option>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {renderCard('studio.statistics.totalConsumption', 'studio.statistics.totalConsumptionDesc', (
          <div className="flex justify-center items-center text-8xl font-bold h-[250px]">{data.tokenConsumption}</div>
        ), 'totalConsumption')}
        {renderCard('studio.statistics.totalConsumptionOverview', 'studio.statistics.totalConsumptionOverviewDesc', (
          <Line {...lineConfig('tokenOverviewData')} />
        ), 'totalConsumptionOverview')}
        {renderCard('studio.statistics.totalConversation', 'studio.statistics.totalConversationDesc', (
          <Line {...lineConfig('conversationsData')} />
        ), 'totalConversation')}
        {renderCard('studio.statistics.totalActiveUser', 'studio.statistics.totalActiveUserDesc', (
          <Line {...lineConfig('activeUsersData')} />
        ), 'totalActiveUser')}
      </div>
    </div>
  );
};

export default ChartComponent;
