'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  Input,
  Button,
  Checkbox,
  Space,
  Tag,
  Modal,
  message,
  Tabs,
} from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import {
  deepClone,
  getRandomColor,
  getEnumValueUnit,
} from '@/app/monitor/utils/common';
import {
  ColumnItem,
  ModalRef,
  Pagination,
  TableDataItem,
  UserItem,
  TabItem,
  TimeSelectorDefaultValue,
} from '@/app/monitor/types';
import { AlertProps } from '@/app/monitor/types/monitor';
import { AlertOutlined } from '@ant-design/icons';
import { FiltersConfig } from '@/app/monitor/types/monitor';
import CustomTable from '@/components/custom-table';
import TimeSelector from '@/components/time-selector';
import AlertDetail from './alertDetail';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import dayjs from 'dayjs';
import { useCommon } from '@/app/monitor/context/common';
import alertStyle from './index.module.scss';
import {
  LEVEL_MAP,
  useLevelList,
  useStateMap,
} from '@/app/monitor/constants/monitor';

const INIT_HISTORY_FILTERS = {
  level: [],
  state: [],
  notify: [],
};

const INIT_ACTIVE_FILTERS = {
  level: [],
  state: ['new'],
  notify: [],
};

const Alert: React.FC<AlertProps> = ({ objects, metrics }) => {
  const { get, patch, isLoading } = useApiClient();
  const { t } = useTranslation();
  const STATE_MAP = useStateMap();
  const LEVEL_LIST = useLevelList();
  const { confirm } = Modal;
  const { convertToLocalizedTime } = useLocalizedTime();
  const commonContext = useCommon();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const detailRef = useRef<ModalRef>(null);
  const users = useRef(commonContext?.userList || []);
  const userList: UserItem[] = users.current;
  const [searchText, setSearchText] = useState<string>('');
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [frequence, setFrequence] = useState<number>(0);
  const beginTime: number = dayjs().subtract(1440, 'minute').valueOf();
  const lastTime: number = dayjs().valueOf();
  const [timeRange, setTimeRange] = useState<number[]>([beginTime, lastTime]);
  const timeDefaultValue =
    useRef<TimeSelectorDefaultValue>({
      selectValue: 1440,
      rangePickerVaule: null,
    })?.current || {};
  const [filters, setFilters] = useState<FiltersConfig>(INIT_ACTIVE_FILTERS);
  const [activeTab, setActiveTab] = useState<string>('activeAlarms');

  const tabs: TabItem[] = [
    {
      label: t('monitor.events.activeAlarms'),
      key: 'activeAlarms',
    },
    {
      label: t('monitor.events.historicalAlarms'),
      key: 'historicalAlarms',
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
      dataIndex: 'updated_at',
      key: 'updated_at',
      sorter: (a: any, b: any) => a.id - b.id,
      render: (_, { updated_at }) => (
        <>{updated_at ? convertToLocalizedTime(updated_at) : '--'}</>
      ),
    },
    {
      title: t('monitor.events.strategyName'),
      dataIndex: 'title',
      key: 'title',
      render: (_, record) => <>{record.policy?.name || '--'}</>,
    },
    {
      title: t('monitor.asset'),
      dataIndex: 'asset',
      key: 'asset',
      render: (_, record) => <>{record.monitor_instance?.name || '--'}</>,
    },
    {
      title: t('monitor.events.assetType'),
      dataIndex: 'assetType',
      key: 'assetType',
      render: (_, record) => <>{showObjName(record)}</>,
    },
    {
      title: t('monitor.metric'),
      dataIndex: 'index',
      key: 'index',
      render: (_, record) => <>{record.metric?.display_name || '--'}</>,
    },
    {
      title: t('monitor.value'),
      dataIndex: 'value',
      key: 'value',
      render: (_, record) => (
        <>{getEnumValueUnit(record.metric, record.value)}</>
      ),
    },
    {
      title: t('monitor.events.state'),
      dataIndex: 'status',
      key: 'status',
      render: (_, { status }) => (
        <Tag color={status === 'new' ? 'blue' : 'var(--color-text-4)'}>
          {STATE_MAP[status]}
        </Tag>
      ),
    },
    {
      title: t('monitor.events.notify'),
      dataIndex: 'notify',
      key: 'notify',
      render: (_, record) => (
        <>
          {t(
            `monitor.events.${
              record.policy?.notice ? 'notified' : 'unnotified'
            }`
          )}
        </>
      ),
    },
    {
      title: t('common.operator'),
      dataIndex: 'operator',
      key: 'operator',
      render: (_, { operator }) => {
        return operator ? (
          <div className="column-user" title={operator}>
            <span
              className="user-avatar"
              style={{ background: getRandomColor() }}
            >
              {operator.slice(0, 1).toLocaleUpperCase()}
            </span>
            <span className="user-name">{operator}</span>
          </div>
        ) : (
          <>--</>
        );
      },
    },
    {
      title: t('common.action'),
      key: 'action',
      dataIndex: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button
            className="mr-[10px]"
            type="link"
            onClick={() => openAlertDetail(record)}
          >
            {t('common.detail')}
          </Button>
          <Button
            type="link"
            disabled={record.status !== 'new'}
            onClick={() => showAlertCloseConfirm(record)}
          >
            {t('common.close')}
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (!frequence) {
      clearTimer();
      return;
    }
    timerRef.current = setInterval(() => {
      getAssetInsts('timer');
    }, frequence);
    return () => {
      clearTimer();
    };
  }, [
    frequence,
    timeRange,
    filters.level,
    filters.state,
    pagination.current,
    pagination.pageSize,
  ]);

  useEffect(() => {
    if (isLoading) return;
    getAssetInsts('refresh');
  }, [
    isLoading,
    timeRange,
    filters.level,
    filters.state,
    pagination.current,
    pagination.pageSize,
  ]);

  const changeTab = (val: string) => {
    setActiveTab(val);
    if (val === 'activeAlarms') {
      setFilters(INIT_ACTIVE_FILTERS);
      return;
    }
    setTimeRange([beginTime, lastTime]);
    setFilters(INIT_HISTORY_FILTERS);
  };

  const showAlertCloseConfirm = (row: TableDataItem) => {
    confirm({
      title: t('monitor.events.closeTitle'),
      content: t('monitor.events.closeContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await patch(`/monitor/api/monitor_alert/${row.id}/`, {
              status: 'closed',
            });
            message.success(t('monitor.events.successfullyClosed'));
            getAssetInsts('refresh');
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const getParams = () => {
    const params = {
      status_in: filters.state.join(',') || 'recovered,closed',
      level_in: filters.level.join(','),
      content: searchText,
      page: pagination.current,
      page_size: pagination.pageSize,
      created_at_after: '',
      created_at_before: '',
    };
    if (activeTab === 'historicalAlarms') {
      params.created_at_after = dayjs(timeRange[0]).toISOString();
      params.created_at_before = dayjs(timeRange[1]).toISOString();
    }
    return params;
  };

  const showObjName = (row: TableDataItem) => {
    return (
      objects.find((item) => item.id === row.monitor_instance?.monitor_object)
        ?.display_name || '--'
    );
  };

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  const getAssetInsts = async (type: string, text?: string) => {
    const params = getParams();
    if (text) {
      params.content = '';
    }
    try {
      setTableLoading(type !== 'timer');
      const data = await get('/monitor/api/monitor_alert/', { params });
      setTableData(data.results);
      setPagination((pre) => ({
        ...pre,
        total: data.count,
      }));
    } finally {
      setTableLoading(false);
    }
  };

  const onFrequenceChange = (val: number) => {
    setFrequence(val);
  };

  const onRefresh = () => {
    getAssetInsts('refresh');
  };

  const openAlertDetail = (row: TableDataItem) => {
    detailRef.current?.showModal({
      title: t('monitor.events.alertDetail'),
      type: 'add',
      form: {
        ...row,
        alertTitle: showObjName(row),
        alertValue: getEnumValueUnit(row.metric, row.value),
      },
    });
  };

  const onTimeChange = (val: number[]) => {
    setTimeRange(val);
  };

  const onFilterChange = (
    checkedValues: string[],
    field: keyof FiltersConfig
  ) => {
    const _filters = deepClone(filters);
    _filters[field] = checkedValues;
    setFilters(_filters);
  };

  const enterText = () => {
    getAssetInsts('refresh');
  };

  const clearText = () => {
    setSearchText('');
    getAssetInsts('refresh', 'clear');
  };

  return (
    <div className="w-full">
      <div className={alertStyle.alert}>
        <div className={alertStyle.filters}>
          <h3 className="font-[800] mb-[15px] text-[15px]">
            {t('monitor.events.filterItems')}
          </h3>
          <div className="mb-[15px]">
            <h4 className="font-[600] text-[14px] text-[var(--color-text-3)] mb-[10px]">
              {t('monitor.events.level')}
            </h4>
            <Checkbox.Group
              className="ml-[20px]"
              value={filters.level}
              onChange={(checkeds) => onFilterChange(checkeds, 'level')}
            >
              <Space direction="vertical">
                <Checkbox value="critical">
                  <div className={alertStyle.level}>
                    {t('monitor.events.critical')}
                  </div>
                </Checkbox>
                <Checkbox value="error">
                  <div
                    className={alertStyle.level}
                    style={{
                      borderLeft: `4px solid ${LEVEL_MAP.error}`,
                    }}
                  >
                    {t('monitor.events.error')}
                  </div>
                </Checkbox>
                <Checkbox value="warning">
                  <div
                    className={alertStyle.level}
                    style={{
                      borderLeft: `4px solid ${LEVEL_MAP.warning}`,
                    }}
                  >
                    {t('monitor.events.warning')}
                  </div>
                </Checkbox>
              </Space>
            </Checkbox.Group>
          </div>
          {activeTab === 'historicalAlarms' && (
            <div className="mb-[15px]">
              <h4 className="font-[600] text-[var(--color-text-3)] text-[14px] mb-[10px]">
                {t('monitor.events.state')}
              </h4>
              <Checkbox.Group
                value={filters.state}
                className="ml-[20px]"
                onChange={(checkeds) => onFilterChange(checkeds, 'state')}
              >
                <Space direction="vertical">
                  {/* <Checkbox value="new">{t('monitor.events.new')}</Checkbox> */}
                  <Checkbox value="recovered">
                    {t('monitor.events.recovery')}
                  </Checkbox>
                  <Checkbox value="closed">
                    {t('monitor.events.closed')}
                  </Checkbox>
                </Space>
              </Checkbox.Group>
            </div>
          )}
        </div>
        <div className={alertStyle.table}>
          <Tabs activeKey={activeTab} items={tabs} onChange={changeTab} />
          <div className="flex justify-between mb-[10px]">
            <Input
              allowClear
              className="w-[350px]"
              placeholder={t('common.searchPlaceHolder')}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={enterText}
              onClear={clearText}
            />
            <TimeSelector
              defaultValue={timeDefaultValue}
              onlyRefresh={activeTab === 'activeAlarms'}
              onChange={(value) => onTimeChange(value)}
              onFrequenceChange={onFrequenceChange}
              onRefresh={onRefresh}
            />
          </div>
          <CustomTable
            scroll={{ y: 'calc(100vh - 380px)', x: 'calc(100vw - 300px)' }}
            columns={columns}
            dataSource={tableData}
            pagination={pagination}
            loading={tableLoading}
            rowKey="id"
            onChange={handleTableChange}
          />
        </div>
      </div>
      <AlertDetail
        ref={detailRef}
        objects={objects}
        metrics={metrics}
        userList={userList}
        onSuccess={() => getAssetInsts('refresh')}
      />
    </div>
  );
};

export default Alert;
