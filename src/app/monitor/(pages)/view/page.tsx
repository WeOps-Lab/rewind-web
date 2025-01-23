'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Spin, Input, Button, Segmented, Tabs, Progress } from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { deepClone, getEnumValueUnit } from '@/app/monitor/utils/common';
import { useRouter } from 'next/navigation';
import {
  IntergrationItem,
  ObectItem,
  MetricItem,
} from '@/app/monitor/types/monitor';
import ViewModal from './viewModal';
import {
  TabItem,
  ColumnItem,
  ModalRef,
  Pagination,
  TableDataItem,
} from '@/app/monitor/types';
import {
  useKeyMetricLabelMap,
  COLLECT_TYPE_MAP,
} from '@/app/monitor/constants/monitor';
import CustomTable from '@/components/custom-table';
import TimeSelector from '@/components/time-selector';
import { INDEX_CONFIG } from '@/app/monitor/constants/monitor';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import viewStyle from './index.module.scss';

const Intergration = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const KEY_METRIC_LABEL_MAP = useKeyMetricLabelMap();
  const router = useRouter();
  const { convertToLocalizedTime } = useLocalizedTime();
  const viewRef = useRef<ModalRef>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [items, setItems] = useState<IntergrationItem[]>([]);
  const [apps, setApps] = useState<TabItem[]>([]);
  const [objectId, setObjectId] = useState<string>('');
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [frequence, setFrequence] = useState<number>(0);
  const [plugins, setPlugins] = useState<IntergrationItem[]>([]);
  const columns: ColumnItem[] = [
    {
      title: t('common.name'),
      dataIndex: 'instance_name',
      width: 140,
      key: 'instance_name',
    },
    {
      title: t('monitor.views.reportTime'),
      dataIndex: 'time',
      key: 'time',
      width: 160,
      render: (_, { time }) => (
        <>{time ? convertToLocalizedTime(new Date(time * 1000) + '') : '--'}</>
      ),
    },
    {
      title: t('common.action'),
      key: 'action',
      dataIndex: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button
            className="mr-[10px]"
            type="link"
            onClick={() => openViewModal(record)}
          >
            {t('monitor.view')}
          </Button>
          <Button type="link" onClick={() => linkToDetial(record)}>
            {t('common.detail')}
          </Button>
        </>
      ),
    },
  ];
  const [tableColumn, setTableColumn] = useState<ColumnItem[]>(columns);

  useEffect(() => {
    if (activeTab) {
      const target = items.find((item) => item.value === activeTab);
      if (target?.list) {
        const list = deepClone(target.list);
        setObjectId(list[0].key);
        setApps(list);
      }
    }
  }, [activeTab, items]);

  useEffect(() => {
    if (isLoading) return;
    getObjects();
  }, [isLoading]);

  useEffect(() => {
    if (objectId) {
      setTableData([]);
      setPagination((prev: Pagination) => ({
        ...prev,
        current: 1,
      }));
      getColoumnAndData();
    }
  }, [objectId]);

  useEffect(() => {
    if (objectId) {
      onRefresh();
    }
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (!frequence) {
      clearTimer();
      return;
    }
    timerRef.current = setInterval(() => {
      getAssetInsts(objectId, 'timer');
    }, frequence);
    return () => {
      clearTimer();
    };
  }, [
    frequence,
    objectId,
    pagination.current,
    pagination.pageSize,
    searchText,
  ]);

  const getColoumnAndData = async () => {
    const params = {
      page: pagination.current,
      page_size: pagination.pageSize,
      add_metrics: true,
      name: searchText,
    };
    const objParams = {
      monitor_object_id: objectId,
    };

    const getInstList = get(`/monitor/api/monitor_instance/${objectId}/list/`, {
      params,
    });
    const getMetrics = get('/monitor/api/metrics/', {
      params: objParams,
    });
    const getPlugins = get('/monitor/api/monitor_plugin/', {
      params: objParams,
    });
    setTableLoading(true);
    try {
      const res = await Promise.all([getInstList, getMetrics, getPlugins]);
      const _plugins = res[2].map((item: IntergrationItem) => ({
        label: COLLECT_TYPE_MAP[item.name || ''],
        value: item.id,
      }));
      setPlugins(_plugins);
      setTableData(res[0]?.results || []);
      setPagination((prev: Pagination) => ({
        ...prev,
        total: res[0]?.count || 0,
      }));
      const _objectName = apps.find((item) => item.key === objectId)?.name;
      if (_objectName) {
        const filterMetrics =
          INDEX_CONFIG.find((item) => item.name === _objectName)
            ?.tableDiaplay || [];
        const _columns = filterMetrics.map((item: any) => {
          const target = (res[1] || []).find(
            (tex: MetricItem) => tex.name === item.key
          );
          if (item.type === 'progress') {
            return {
              title:
                KEY_METRIC_LABEL_MAP[target?.name] ||
                target?.display_name ||
                '--',
              dataIndex: target?.name,
              key: target?.name,
              width: 300,
              render: (_: unknown, record: TableDataItem) => (
                <Progress
                  className="flex"
                  strokeLinecap="butt"
                  showInfo={!!record[target?.name]}
                  format={(percent) => `${percent?.toFixed(2)}%`}
                  percent={getPercent(record[target?.name] || 0)}
                  percentPosition={{ align: 'start', type: 'outer' }}
                  size={[260, 20]}
                />
              ),
            };
          }
          return {
            title:
              KEY_METRIC_LABEL_MAP[target?.name] ||
              target?.display_name ||
              '--',
            dataIndex: target?.name,
            key: target?.name,
            width: 200,
            render: (_: unknown, record: TableDataItem) => (
              <>{getEnumValueUnit(target, record[target?.name])}</>
            ),
          };
        });
        const originColumns = deepClone(columns);
        const indexToInsert = originColumns.length - 1;
        originColumns.splice(indexToInsert, 0, ..._columns);
        setTableColumn(originColumns);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
    }
  };

  const getPercent = (value: number) => {
    return +(+value).toFixed(2);
  };
  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  const changeTab = (val: string) => {
    setObjectId(val);
  };

  const getObjects = async (text?: string) => {
    try {
      setPageLoading(true);
      const data = await get(`/monitor/api/monitor_object/`, {
        params: {
          name: text || '',
        },
      });
      const _items = getAppsByType(data);
      setItems(_items);
      setActiveTab(_items[0]?.value || '');
    } finally {
      setPageLoading(false);
    }
  };

  const getAssetInsts = async (objectId: React.Key, type?: string) => {
    const params = {
      page: pagination.current,
      page_size: pagination.pageSize,
      add_metrics: true,
      name: searchText,
    };
    if (type === 'clear') {
      params.name = '';
    }
    try {
      setTableLoading(type !== 'timer');
      const data = await get(
        `/monitor/api/monitor_instance/${objectId}/list/`,
        {
          params,
        }
      );
      setTableData(data.results || []);
      setPagination((prev: Pagination) => ({
        ...prev,
        total: data.count || 0,
      }));
    } finally {
      setTableLoading(false);
    }
  };

  const getAppsByType = (data: ObectItem[]): IntergrationItem[] => {
    const groupedData = data.reduce(
      (acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = {
            label: item.display_type,
            value: item.type,
            list: [],
          };
        }
        acc[item.type].list.push({
          label: item.display_name,
          name: item.name,
          key: item.id,
        });
        return acc;
      },
      {} as Record<string, any>
    );
    return Object.values(groupedData).filter((item) => item.value !== 'Other');
  };

  const onTabChange = (val: string) => {
    setActiveTab(val);
  };

  const linkToDetial = (app: ObectItem) => {
    const row = deepClone(app);
    row.name = apps.find((item) => item.key === objectId)?.name;
    row.monitorObjId = apps.find((item) => item.key === objectId)?.key || '';
    const params = new URLSearchParams(row);
    const targetUrl = `/monitor/view/detail/overview?${params.toString()}`;
    router.push(targetUrl);
  };

  const onFrequenceChange = (val: number) => {
    setFrequence(val);
  };

  const onRefresh = () => {
    getAssetInsts(objectId);
  };

  const clearText = () => {
    setSearchText('');
    getAssetInsts(objectId, 'clear');
  };

  const openViewModal = (row: TableDataItem) => {
    viewRef.current?.showModal({
      title: t('monitor.views.indexView'),
      type: 'add',
      form: row,
    });
  };

  return (
    <div className={`${viewStyle.view} w-full`}>
      <Spin spinning={pageLoading}>
        <Segmented
          className="mb-[20px] custom-tabs"
          value={activeTab}
          options={items}
          onChange={onTabChange}
        />
        <div
          className={`${viewStyle.table} w-full bg-[var(--color-bg-1)] px-[20px] pb-[20px]`}
        >
          <Tabs activeKey={objectId} items={apps} onChange={changeTab} />
          <div>
            <div className="flex justify-between mb-[10px]">
              <div className="flex items-center">
                <Input
                  allowClear
                  className="w-[320px]"
                  placeholder={t('common.searchPlaceHolder')}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={onRefresh}
                  onClear={clearText}
                ></Input>
              </div>
              <TimeSelector
                onlyRefresh
                onFrequenceChange={onFrequenceChange}
                onRefresh={onRefresh}
              />
            </div>
            <CustomTable
              scroll={{ y: 'calc(100vh - 370px)', x: 'calc(100vw - 90px)' }}
              columns={tableColumn}
              dataSource={tableData}
              pagination={pagination}
              loading={tableLoading}
              rowKey="instance_id"
              onChange={handleTableChange}
            ></CustomTable>
          </div>
        </div>
      </Spin>
      <ViewModal
        ref={viewRef}
        plugins={plugins}
        monitorObject={objectId}
        monitorName={apps.find((item) => item.key === objectId)?.name || ''}
        monitorId={apps.find((item) => item.key === objectId)?.key || ''}
      />
    </div>
  );
};
export default Intergration;
