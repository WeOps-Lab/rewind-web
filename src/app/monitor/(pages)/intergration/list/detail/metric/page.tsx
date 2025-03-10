'use client';
import React, { useEffect, useState, useRef } from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Input, Button, Modal, message, Spin, Segmented, Empty } from 'antd';
import useApiClient from '@/utils/request';
import metricStyle from './index.module.scss';
import { useTranslation } from '@/utils/i18n';
import CustomTable from '@/components/custom-table';
import { ColumnItem, ModalRef } from '@/app/monitor/types';
import {
  DimensionItem,
  MetricItem,
  GroupInfo,
  IntergrationItem,
  ObectItem,
  MetricListItem,
} from '@/app/monitor/types/monitor';
import Collapse from '@/components/collapse';
import GroupModal from './groupModal';
import MetricModal from './metricModal';
import { useSearchParams } from 'next/navigation';
import { deepClone } from '@/app/monitor/utils/common';
import { useUserInfoContext } from '@/context/userInfo';
const { confirm } = Modal;
import Permission from '@/components/permission';

const Configure = () => {
  const { get, del, isLoading, post } = useApiClient();
  const { t } = useTranslation();
  const commonContext = useUserInfoContext();
  const superRef = useRef(commonContext?.isSuperUser || false);
  const searchParams = useSearchParams();
  const groupName = searchParams.get('name') || '';
  const groupId = searchParams.get('id');
  const pluginID = searchParams.get('plugin_id') || '';
  const groupRef = useRef<ModalRef>(null);
  const metricRef = useRef<ModalRef>(null);
  const isSuperUser = superRef?.current;
  const [searchText, setSearchText] = useState<string>('');
  const [metricData, setMetricData] = useState<MetricListItem[]>([]);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [groupList, setGroupList] = useState<MetricListItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [items, setItems] = useState<IntergrationItem[]>([]);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);

  const columns: ColumnItem[] = [
    {
      title: t('common.id'),
      dataIndex: 'name',
      width: 120,
      key: 'name',
    },
    {
      title: t('common.name'),
      dataIndex: 'display_name',
      width: 120,
      key: 'display_name',
    },
    {
      title: t('monitor.intergrations.dimension'),
      dataIndex: 'dimensions',
      width: 100,
      key: 'dimensions',
      render: (_, record) => (
        <>
          {record.dimensions?.length
            ? record.dimensions
              .map((item: DimensionItem) => item.name)
              .join(',')
            : '--'}
        </>
      ),
    },
    {
      title: t('monitor.intergrations.dataType'),
      dataIndex: 'data_type',
      key: 'data_type',
      width: 100,
      render: (_, record) => <>{record.data_type || '--'}</>,
    },
    {
      title: t('common.unit'),
      dataIndex: 'unit',
      width: 80,
      key: 'unit',
      render: (_, record) => (
        <>{record.data_type === 'Enum' ? '--' : record.unit || '--'}</>
      ),
    },
    {
      title: t('common.descripition'),
      dataIndex: 'display_description',
      key: 'display_description',
      width: 150,
      render: (_, record) => <>{record.display_description || '--'}</>,
    },
    {
      title: t('common.action'),
      key: 'action',
      dataIndex: 'action',
      fixed: 'right',
      width: 110,
      render: (_, record) => (
        <>
          <Permission
            requiredPermissions={['Edit Metric']}
            className="mr-[10px]"
          >
            <Button
              type="link"
              disabled={record.is_pre && !isSuperUser}
              onClick={() => openMetricModal('edit', record)}
            >
              {t('common.edit')}
            </Button>
          </Permission>
          <Permission requiredPermissions={['Delete Metric']}>
            <Button
              type="link"
              disabled={record.is_pre && !isSuperUser}
              onClick={() => showDeleteConfirm(record)}
            >
              {t('common.delete')}
            </Button>
          </Permission>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (isLoading) return;
    getObjects();
  }, [isLoading]);

  const getObjects = async () => {
    setLoading(true);
    let _objId = '';
    try {
      if (['Docker', 'Cluster'].includes(groupName)) {
        const typeMaps: Record<string, string> = {
          Docker: 'Container Management',
          Cluster: 'K8S',
        };
        const data = await get(`/monitor/api/monitor_object/`);
        const _items = data
          .filter((item: ObectItem) => item.type === typeMaps[groupName])
          .sort((a: ObectItem, b: ObectItem) => a.id - b.id)
          .map((item: ObectItem) => ({
            label: item.display_name,
            value: item.id,
          }));
        _objId = _items[0]?.value;
        setItems(_items);
      } else {
        _objId = groupId || '';
      }
      setActiveTab(_objId);
      getInitData(_objId);
    } catch {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (row: MetricItem) => {
    confirm({
      title: t('common.deleteTitle'),
      content: t('common.deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/monitor/api/metrics/${row.id}/`);
            message.success(t('common.successfullyDeleted'));
            getInitData();
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const showGroupDeleteConfirm = (row: MetricListItem) => {
    confirm({
      title: t('common.deleteTitle'),
      content: t('common.deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/monitor/api/metrics_group/${row.id}/`);
            message.success(t('common.successfullyDeleted'));
            getInitData();
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const getInitData = async (objId = activeTab) => {
    const params = {
      monitor_object_id: +objId,
      monitor_plugin_id: +pluginID,
    };
    const getGroupList = get(`/monitor/api/metrics_group/`, {
      params: {
        ...params,
        name: searchText,
      },
    });
    const getMetrics = get('/monitor/api/metrics/', {
      params: {
        ...params,
        monitor_plugin_id: +pluginID,
      },
    });
    setLoading(true);
    try {
      Promise.all([getGroupList, getMetrics])
        .then((res) => {
          const groupData = res[0].map((item: GroupInfo, index: number) => ({
            ...item,
            child: [],
            isOpen: !index,
          }));
          const metricData = res[1];
          setMetrics(res[1] || []);
          metricData.forEach((metric: MetricItem) => {
            const target = groupData.find(
              (item: GroupInfo) => item.id === metric.metric_group
            );
            if (target) {
              target.child.push(metric);
            }
          });
          setGroupList(groupData);
          setMetricData(groupData);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch {
      setLoading(false);
    }
  };

  const onSearchTxtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const onTxtPressEnter = () => {
    getInitData();
  };

  const onTxtClear = () => {
    setSearchText('');
    getInitData();
  };

  const openGroupModal = (type: string, row = {}) => {
    const title = t(
      type === 'add'
        ? 'monitor.intergrations.addGroup'
        : 'monitor.intergrations.editGroup'
    );
    groupRef.current?.showModal({
      title,
      type,
      form: row,
    });
  };

  const openMetricModal = (type: string, row = {}) => {
    const title = t(
      type === 'add'
        ? 'monitor.intergrations.addMetric'
        : 'monitor.intergrations.editMetric'
    );
    metricRef.current?.showModal({
      title,
      type,
      form: row,
    });
  };

  const operateGroup = () => {
    getInitData();
  };

  const operateMtric = () => {
    getInitData();
  };

  const onTabChange = (val: string) => {
    setMetricData([]);
    setActiveTab(val);
    getInitData(val);
  };

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingItemId(id);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    if (draggingItemId) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverTargetId(targetId);
      if (
        dragOverTargetId === targetId &&
        draggingItemId !== dragOverTargetId
      ) {
        setMetricData((prev) =>
          prev.map((item) =>
            item.id === targetId ? { ...item, isOpen: false } : item
          )
        );
      }
    }
  };

  const onDrop = async (
    e: React.DragEvent<HTMLDivElement>,
    targetId: string
  ) => {
    e.preventDefault();
    setDragOverTargetId(null);
    if (draggingItemId && draggingItemId !== targetId) {
      const draggingIndex = metricData.findIndex(
        (item) => item.id === draggingItemId
      );
      const targetIndex = metricData.findIndex((item) => item.id === targetId);
      const reorderedData = deepClone(metricData);
      const [draggedItem] = reorderedData.splice(draggingIndex, 1);
      reorderedData.splice(targetIndex, 0, draggedItem);
      if (draggingIndex !== -1 && targetIndex !== -1) {
        try {
          setLoading(true);
          const updatedOrder = reorderedData.map(
            (item: MetricItem, index: number) => ({
              id: item.id,
              sort_order: index,
            })
          );
          await post('/monitor/api/metrics_group/set_order/', updatedOrder);
          message.success(t('common.updateSuccess'));
          getInitData();
        } catch {
          setLoading(false);
        }
      }
      setDraggingItemId(null);
    }
  };

  const onRowDragEnd = async (data: any) => {
    setLoading(true);
    metrics.forEach((metricItem) => {
      if (!data.map((item: MetricItem) => item.id).includes(metricItem.id)) {
        data.push(metricItem);
      }
    });
    const updatedOrder = data.map((item: MetricItem, index: number) => ({
      id: item.id,
      sort_order: index,
    }));
    await post('/monitor/api/metrics/set_order/', updatedOrder);
    message.success(t('common.updateSuccess'));
    getInitData();
  };

  const onToggle = (id: string, isOpen: boolean) => {
    setMetricData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isOpen } : item))
    );
  };

  return (
    <div className={metricStyle.metric}>
      {['Docker', 'Cluster'].includes(groupName) && (
        <Segmented
          className="mb-[20px] custom-tabs"
          value={activeTab}
          options={items}
          onChange={onTabChange}
        />
      )}
      <p className="mb-[10px] text-[var(--color-text-2)]">
        {t('monitor.intergrations.metricTitle')}
      </p>
      <div className="flex items-center justify-between mb-[15px]">
        <Input
          className="w-[400px]"
          placeholder={t('common.searchPlaceHolder')}
          value={searchText}
          allowClear
          onChange={onSearchTxtChange}
          onPressEnter={onTxtPressEnter}
          onClear={onTxtClear}
        />
        <div>
          <Permission requiredPermissions={['Add Group']} className="mr-[8px]">
            <Button type="primary" onClick={() => openGroupModal('add')}>
              {t('monitor.intergrations.addGroup')}
            </Button>
          </Permission>
          <Permission requiredPermissions={['Add Metric']}>
            <Button onClick={() => openMetricModal('Add Metric')}>
              {t('monitor.intergrations.addMetric')}
            </Button>
          </Permission>
        </div>
      </div>
      <Spin spinning={loading}>
        <div
          className={metricStyle.metricTable}
          style={{
            height: ['Docker', 'Cluster'].includes(groupName)
              ? 'calc(100vh - 366px)'
              : 'calc(100vh - 316px)',
          }}
        >
          {!!metricData.length ? (
            metricData.map((metricItem) => (
              <Collapse
                className={`mb-[10px] ${
                  dragOverTargetId === metricItem.id &&
                  draggingItemId !== dragOverTargetId
                    ? 'border-t-[1px] border-blue-200'
                    : ''
                }`}
                key={metricItem.id}
                sortable
                onDragStart={(e) => onDragStart(e, metricItem.id)}
                onDragOver={(e) => onDragOver(e, metricItem.id)}
                onDrop={(e) => onDrop(e, metricItem.id)}
                title={metricItem.display_name || ''}
                isOpen={metricItem.isOpen}
                onToggle={(isOpen) => onToggle(metricItem.id, isOpen)}
                icon={
                  <div>
                    <Permission requiredPermissions={['Edit Group']}>
                      <Button
                        type="link"
                        size="small"
                        disabled={metricItem.is_pre}
                        icon={<EditOutlined />}
                        onClick={() => openGroupModal('edit', metricItem)}
                      ></Button>
                    </Permission>
                    <Permission requiredPermissions={['Edit Group']}>
                      <Button
                        type="link"
                        size="small"
                        disabled={
                          !!metricItem.child?.length || metricItem.is_pre
                        }
                        icon={<DeleteOutlined />}
                        onClick={() => showGroupDeleteConfirm(metricItem)}
                      ></Button>
                    </Permission>
                  </div>
                }
              >
                <CustomTable
                  pagination={false}
                  dataSource={metricItem.child || []}
                  scroll={{ x: 'calc(100vw - 260px)' }}
                  columns={columns}
                  rowKey="id"
                  rowDraggable={metricItem.child?.length > 0}
                  onRowDragEnd={onRowDragEnd}
                />
              </Collapse>
            ))
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </Spin>
      <GroupModal
        ref={groupRef}
        monitorObject={+activeTab}
        onSuccess={operateGroup}
      />
      <MetricModal
        ref={metricRef}
        monitorObject={+activeTab}
        pluginId={+pluginID}
        groupList={groupList}
        onSuccess={operateMtric}
      />
    </div>
  );
};
export default Configure;
