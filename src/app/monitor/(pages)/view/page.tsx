'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Input, Button, Progress } from 'antd';
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
  ColumnItem,
  ModalRef,
  Pagination,
  TableDataItem,
  TreeItem,
} from '@/app/monitor/types';
import { COLLECT_TYPE_MAP } from '@/app/monitor/constants/monitor';
import CustomTable from '@/components/custom-table';
import TimeSelector from '@/components/time-selector';
import { INDEX_CONFIG } from '@/app/monitor/constants/monitor';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import viewStyle from './index.module.scss';
import TreeSelector from '@/app/monitor/components/treeSelector';
import Permission from '@/components/permission';

const Intergration = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const router = useRouter();
  const { convertToLocalizedTime } = useLocalizedTime();
  const viewRef = useRef<ModalRef>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [frequence, setFrequence] = useState<number>(0);
  const [plugins, setPlugins] = useState<IntergrationItem[]>([]);
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [objects, setObjects] = useState<ObectItem[]>([]);
  const [treeLoading, setTreeLoading] = useState<boolean>(false);
  const [objectId, setObjectId] = useState<React.Key>('');
  const [defaultSelectObj, setDefaultSelectObj] = useState<React.Key>('');
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
          <Permission requiredPermissions={['Detail']}>
            <Button type="link" onClick={() => linkToDetial(record)}>
              {t('common.detail')}
            </Button>
          </Permission>
        </>
      ),
    },
  ];
  const [tableColumn, setTableColumn] = useState<ColumnItem[]>(columns);

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

  const handleObjectChange = async (id: string) => {
    setObjectId(id);
  };

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
      const _objectName = objects.find((item) => item.id === objectId)?.name;
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
                t(`monitor.views.${[item.key]}`) ||
                target?.display_name ||
                '--',
              dataIndex: item.key,
              key: item.key,
              width: 300,
              render: (_: unknown, record: TableDataItem) => (
                <Progress
                  className="flex"
                  strokeLinecap="butt"
                  showInfo={!!record[item.key]}
                  format={(percent) => `${percent?.toFixed(2)}%`}
                  percent={getPercent(record[item.key] || 0)}
                  percentPosition={{ align: 'start', type: 'outer' }}
                  size={[260, 20]}
                />
              ),
            };
          }
          return {
            title:
              t(`monitor.views.${[item.key]}`) || target?.display_name || '--',
            dataIndex: item.key,
            key: item.key,
            width: 200,
            render: (_: unknown, record: TableDataItem) => (
              <>{getEnumValueUnit(target, record[item.key])}</>
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

  const getObjects = async () => {
    try {
      setTreeLoading(true);
      const data: ObectItem[] = await get('/monitor/api/monitor_object/', {
        params: {
          add_instance_count: true,
        },
      });
      const _treeData = getTreeData(deepClone(data));
      setTreeData(_treeData);
      setObjects(data);
      setDefaultSelectObj(data[0]?.id);
    } finally {
      setTreeLoading(false);
    }
  };

  const getTreeData = (data: ObectItem[]): TreeItem[] => {
    const groupedData = data.reduce(
      (acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = {
            title: item.display_type || '--',
            key: item.type,
            children: [],
          };
        }
        acc[item.type].children.push({
          title: (item.display_name || '--') + `(${item.instance_count || 0})`,
          label: item.name || '--',
          key: item.id,
          children: [],
        });
        return acc;
      },
      {} as Record<string, TreeItem>
    );
    return Object.values(groupedData).filter((item) => item.key !== 'Other');
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

  const linkToDetial = (app: TableDataItem) => {
    const monitorItem = objects.find((item: ObectItem) => item.id === objectId);
    const row: any = {
      monitorObjId: objectId || '',
      name: monitorItem?.name || '',
      monitorObjDisplayName: monitorItem?.display_name || '',
      instance_id: app.instance_id,
      instance_name: app.instance_name,
      instance_id_values: app.instance_id_values,
    };
    const params = new URLSearchParams(row);
    const targetUrl = `/monitor/view/detail?${params.toString()}`;
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

  const handleSelectFields = (fields: string[]) => {
    console.log(fields);
  };

  return (
    <div className={`${viewStyle.view} w-full`}>
      <div className={viewStyle.tree}>
        <TreeSelector
          data={treeData}
          defaultSelectedKey={defaultSelectObj as string}
          loading={treeLoading}
          onNodeSelect={handleObjectChange}
        />
      </div>
      <div className={viewStyle.table}>
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
          scroll={{ y: 'calc(100vh - 270px)', x: 'calc(100vw - 300px)' }}
          columns={tableColumn}
          dataSource={tableData}
          pagination={pagination}
          loading={tableLoading}
          rowKey="instance_id"
          fieldSetting={{
            showSetting: false,
            displayFieldKeys: [
              'elasticsearch_fs_total_available_in_bytes',
              'instance_name',
            ],
            choosableFields: tableColumn.slice(0, tableColumn.length - 1),
            groupFields: [
              {
                title: t('monitor.events.basicInformation'),
                key: 'baseInfo',
                child: columns.slice(0, 2),
              },
              {
                title: t('monitor.events.metricInformation'),
                key: 'metricInfo',
                child: tableColumn.slice(2, tableColumn.length - 1),
              },
            ],
          }}
          onChange={handleTableChange}
          onSelectFields={handleSelectFields}
        ></CustomTable>
      </div>
      <ViewModal
        ref={viewRef}
        plugins={plugins}
        monitorObject={objectId}
        monitorName={objects.find((item) => item.id === objectId)?.name || ''}
      />
    </div>
  );
};
export default Intergration;
