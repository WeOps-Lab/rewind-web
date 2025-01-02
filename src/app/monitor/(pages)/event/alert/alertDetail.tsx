'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Button, Tag, Tabs, Spin } from 'antd';
import OperateModal from '@/app/monitor/components/operate-drawer';
import { useTranslation } from '@/utils/i18n';
import {
  ModalRef,
  ModalConfig,
  TableDataItem,
  TabItem,
  ChartData,
  ColumnItem,
  Pagination,
} from '@/app/monitor/types';
import {
  ChartDataItem,
  SearchParams,
  MetricItem,
  ObectItem,
} from '@/app/monitor/types/monitor';
import { AlertOutlined } from '@ant-design/icons';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import useApiClient from '@/utils/request';
import Information from './information';
import CustomTable from '@/components/custom-table';
import { getEnumValueUnit } from '@/app/monitor/utils/common';
import {
  LEVEL_MAP,
  useLevelList,
  useStateMap,
} from '@/app/monitor/constants/monitor';

const AlertDetail = forwardRef<ModalRef, ModalConfig>(
  ({ objects, metrics, userList, onSuccess }, ref) => {
    const { t } = useTranslation();
    const { get } = useApiClient();
    const { convertToLocalizedTime } = useLocalizedTime();
    const STATE_MAP = useStateMap();
    const LEVEL_LIST = useLevelList();
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [formData, setFormData] = useState<TableDataItem>({});
    const [title, setTitle] = useState<string>('');
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [activeTab, setActiveTab] = useState<string>('information');
    const [loading, setLoading] = useState<boolean>(false);
    const [tableData, setTableData] = useState<TableDataItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
      current: 1,
      total: 0,
      pageSize: 20,
    });
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const isInformation = activeTab === 'information';
    const tabs: TabItem[] = [
      {
        label: t('common.detail'),
        key: 'information',
      },
      {
        label: t('monitor.events.event'),
        key: 'event',
      },
    ];
    const columns: ColumnItem[] = [
      {
        title: t('monitor.events.level'),
        dataIndex: 'level',
        key: 'level',
        render: (_, { level }) => (
          <Tag icon={<AlertOutlined />} color={LEVEL_MAP[level] as string}>
            {LEVEL_LIST.find((item) => item.value === level)?.label || '--'}
          </Tag>
        ),
      },
      {
        title: t('common.time'),
        dataIndex: 'created_at',
        key: 'created_at',
        sorter: (a: any, b: any) => a.id - b.id,
        render: (_, { created_at }) => (
          <>{created_at ? convertToLocalizedTime(created_at) : '--'}</>
        ),
      },
      {
        title: t('monitor.events.eventName'),
        dataIndex: 'content',
        key: 'content',
        render: () => <>{formData.policy?.name || '--'}</>,
      },
      {
        title: t('monitor.events.index'),
        dataIndex: 'index',
        key: 'index',
        render: () => <>{formData.metric?.display_name || '--'}</>,
      },
      {
        title: t('monitor.value'),
        dataIndex: 'value',
        key: 'value',
        render: (_, record) => (
          <>{getEnumValueUnit(formData.metric, record.value)}</>
        ),
      },
    ];

    useImperativeHandle(ref, () => ({
      showModal: ({ title, form }) => {
        // 开启弹窗的交互
        setGroupVisible(true);
        setTitle(title);
        setFormData(form);
      },
    }));

    useEffect(() => {
      if (groupVisible) {
        if (isInformation) {
          getChartData();
          return;
        }
        getTableData();
      }
    }, [formData, groupVisible, activeTab]);

    useEffect(() => {
      if (formData?.id) {
        getTableData();
      }
    }, [pagination.current, pagination.pageSize]);

    const getParams = () => {
      const target =
        metrics.find((item: MetricItem) => item.id === formData.policy?.metric)
          ?.query || '';
      const _query: string = target;
      const instId = formData.monitor_instance?.id;
      const objName =
        objects.find(
          (item: ObectItem) =>
            item.id === formData.monitor_instance?.monitor_object
        )?.name || '';
      const params: SearchParams = {
        query: _query.replace(
          /__\$labels__/g,
          objName === 'Pod'
            ? `uid="${instId}"`
            : objName === 'Node'
              ? `node="${instId}"`
              : `instance_id="${instId}"`
        ),
      };
      const startTime = new Date(formData.start_event_time).getTime();
      const endTime = formData.end_event_time
        ? new Date(formData.end_event_time).getTime()
        : new Date().getTime();
      const MAX_POINTS = 100; // 最大数据点数
      const DEFAULT_STEP = 360; // 默认步长
      if (startTime && endTime) {
        params.start = startTime;
        params.end = endTime;
        params.step = Math.max(
          Math.ceil(
            (params.end / MAX_POINTS - params.start / MAX_POINTS) / DEFAULT_STEP
          ),
          1
        );
      }
      return params;
    };

    const getTableData = async () => {
      setTableLoading(true);
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
      };
      try {
        const data = await get(
          `/monitor/api/monitor_event/query/${formData.id}/`,
          {
            params,
          }
        );
        setTableData(data.results);
        setPagination((prev: Pagination) => ({
          ...prev,
          total: data.count,
        }));
      } finally {
        setTableLoading(false);
      }
    };

    const getChartData = async () => {
      setLoading(true);
      try {
        const responseData = await get(
          `/monitor/api/metrics_instance/query_range/`,
          {
            params: getParams(),
          }
        );
        const data = responseData.data?.result || [];
        setChartData(data);
      } finally {
        setLoading(false);
      }
    };

    const processData = (data: ChartDataItem[]): ChartData[] => {
      const result: any[] = [];
      const target =
        metrics.find((item: MetricItem) => item.id === formData.policy?.metric)
          ?.dimensions || [];
      data.forEach((item, index) => {
        item.values.forEach(([timestamp, value]) => {
          const existing = result.find((entry) => entry.time === timestamp);
          const detailValue = Object.entries(item.metric)
            .map(([key, dimenValue]) => ({
              name: key,
              label:
                key === 'instance_name'
                  ? 'Instance Name'
                  : target.find((sec: MetricItem) => sec.name === key)
                    ?.description || key,
              value: dimenValue,
            }))
            .filter(
              (item) =>
                item.name === 'instance_name' ||
                target.find((tex: MetricItem) => tex.name === item.name)
            );
          if (existing) {
            existing[`value${index + 1}`] = parseFloat(value);
            if (!existing.details[`value${index + 1}`]) {
              existing.details[`value${index + 1}`] = [];
            }
            existing.details[`value${index + 1}`].push(...detailValue);
          } else {
            const details = {
              [`value${index + 1}`]: detailValue,
            };
            result.push({
              time: timestamp,
              title:
                metrics.find(
                  (sec: MetricItem) => sec.id === formData.policy?.metric
                )?.display_name || '--',
              [`value${index + 1}`]: parseFloat(value),
              details,
            });
          }
        });
      });
      return result;
    };

    const handleCancel = () => {
      setGroupVisible(false);
      setActiveTab('information');
      setChartData([]);
      setTableData([]);
    };
    const changeTab = (val: string) => {
      setActiveTab(val);
    };

    const closeModal = () => {
      handleCancel();
      onSuccess();
    };

    const handleTableChange = (pagination: any) => {
      setPagination(pagination);
    };

    return (
      <div>
        <OperateModal
          title={title}
          visible={groupVisible}
          width={800}
          onClose={handleCancel}
          footer={
            <div>
              <Button onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          }
        >
          <div>
            <div>
              <div>
                <Tag
                  icon={<AlertOutlined />}
                  color={LEVEL_MAP[formData.level] as string}
                >
                  {LEVEL_LIST.find((item) => item.value === formData.level)
                    ?.label || '--'}
                </Tag>
                <b>{formData.policy?.name || '--'}</b>
              </div>
              <ul className="flex mt-[10px]">
                <li className="mr-[20px]">
                  <span>{t('common.time')}：</span>
                  <span>
                    {formData.updated_at
                      ? convertToLocalizedTime(formData.updated_at)
                      : '--'}
                  </span>
                </li>
                <li>
                  <span>{t('monitor.events.state')}：</span>
                  <Tag
                    color={
                      formData.status === 'new' ? 'blue' : 'var(--color-text-4)'
                    }
                  >
                    {STATE_MAP[formData.status]}
                  </Tag>
                </li>
              </ul>
            </div>
            <Tabs activeKey={activeTab} items={tabs} onChange={changeTab} />
            <Spin className="w-full" spinning={loading}>
              {isInformation ? (
                <Information
                  formData={formData}
                  objects={objects}
                  metrics={metrics}
                  userList={userList}
                  onClose={closeModal}
                  chartData={processData(chartData || [])}
                />
              ) : (
                <CustomTable
                  scroll={{ y: 'calc(100vh - 390px)' }}
                  columns={columns}
                  dataSource={tableData}
                  pagination={pagination}
                  loading={tableLoading}
                  rowKey="id"
                  onChange={handleTableChange}
                />
              )}
            </Spin>
          </div>
        </OperateModal>
      </div>
    );
  }
);

AlertDetail.displayName = 'alertDetail';
export default AlertDetail;
