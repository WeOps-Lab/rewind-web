'use client';

import dayjs from 'dayjs';
import styles from './index.module.scss';
import K8sTaskForm from './k8sTask';
import AddTaskForm from './addTask';
import TaskDetail from './taskDetail';
import useApiClient from '@/utils/request';
import CustomTable from '@/components/custom-table';
import React, { useState, useEffect, useCallback } from 'react';
import type { TableColumnType } from 'antd';
import type { ColumnItem } from '@/app/cmdb/types/assetManage';
import { Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import { Input, Button, Spin, Tag, Tree, Drawer, message, Tabs } from 'antd';
import {
  createExecStatusMap,
  ExecStatusKey,
  ExecStatus,
  getExecStatusConfig,
  EXEC_STATUS,
  ExecStatusType,
} from './constants';
import {
  CollectTask,
  TreeNode,
  CollectTaskMessage,
} from '@/app/cmdb/types/autoDiscovery';
import type { ColumnType } from 'antd/es/table';
import PermissionWrapper from '@/components/permission';

type ExtendedColumnItem = ColumnType<CollectTask> & {
  key: string;
  dataIndex?: string;
};

const ProfessionalCollection: React.FC = () => {
  const { t } = useTranslation();
  const { get, del, post } = useApiClient();
  const ExecStatusMap = React.useMemo(() => createExecStatusMap(t), [t]);
  const execStatusConfig = React.useMemo(() => getExecStatusConfig(t), [t]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');
  const [selectedNode, setSelectedNode] = useState<TreeNode>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<CollectTask | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [tableData, setTableData] = useState<CollectTask[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [displayFieldKeys, setDisplayFieldKeys] = useState<string[]>([]);
  const [allColumns, setAllColumns] = useState<ExtendedColumnItem[]>([]);
  const [currentColumns, setCurrentColumns] = useState<ExtendedColumnItem[]>(
    []
  );
  const [treeLoading, setTreeLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [executingTaskIds, setExecutingTaskIds] = useState<number[]>([]);
  const timerRef = React.useRef<NodeJS.Timeout>();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const getAllKeys = (nodes: TreeNode[]): string[] => {
    let keys: string[] = [];
    nodes.forEach((node) => {
      keys.push(node.id);
      if (node.children) {
        keys = keys.concat(getAllKeys(node.children));
      }
    });
    return keys;
  };

  const fetchData = useCallback(
    async (
      options: {
        page?: number;
        pageSize?: number;
        status?: ExecStatusType;
        search?: string;
      } = {}
    ) => {
      try {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        setTableLoading(true);
        const params = {
          model_id: selectedNode?.tabItems?.length
            ? activeTab || selectedNode?.tabItems?.[0]?.id
            : selectedNodeId,
          search: options.search ?? searchText,
          page: options.page ?? pagination.current,
          page_size: options.pageSize ?? pagination.pageSize,
          ...(options.status !== undefined && { exec_status: options.status }),
        };
        const data = await get('/cmdb/api/collect/search/', { params });
        setTableData(data.items || []);
        setPagination((prev) => ({
          ...prev,
          total: data.count || 0,
        }));
        timerRef.current = setTimeout(() => {
          fetchData();
        }, 10 * 1000);
      } catch (error) {
        console.error('Failed to fetch table data:', error);
      } finally {
        setTableLoading(false);
      }
    },
    [
      selectedNodeId,
      selectedNode,
      activeTab,
      searchText,
      pagination.current,
      pagination.pageSize,
      get,
    ]
  );

  const handleEnterSearch = () => {
    const newPagination = { ...pagination, current: 1 };
    setPagination(newPagination);
    fetchData({ page: 1 });
  };

  const handleClearSearch = () => {
    setSearchText('');
    const newPagination = { ...pagination, current: 1 };
    setPagination(newPagination);
    fetchData({ page: 1, search: '' });
  };

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    },
    []
  );

  const handleTableChange = useCallback(
    async (newPagination: any, filters: any) => {
      const newStatus = filters.exec_status?.[0] as ExecStatusType;
      setPagination(newPagination);
      fetchData({
        page: newPagination.current,
        pageSize: newPagination.pageSize,
        status: newStatus,
      });
    },
    []
  );

  const onTreeSelect = async (selectedKeys: any[]) => {
    if (selectedKeys.length > 0) {
      const nodeId = selectedKeys[0] as string;
      setSelectedNodeId(nodeId);
      const node = findNodeById(treeData, nodeId);
      setSelectedNode(node);

      if (node?.tabItems?.length) {
        setActiveTab(node.tabItems[0].id);
      } else {
        setActiveTab('');
      }
    }
  };
  const findNodeById = (
    nodes: TreeNode[],
    id: string
  ): TreeNode | undefined => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return undefined;
  };
  const handleCreate = () => {
    setEditingId(null);
    setDrawerVisible(true);
  };

  const handleEdit = (record: CollectTask) => {
    setEditingId(record.id);
    setDrawerVisible(true);
  };

  const handleDelete = useCallback(
    (record: CollectTask) => {
      Modal.confirm({
        title: t('deleteTitle'),
        content: t('deleteContent'),
        onOk: async () => {
          try {
            await del(`/cmdb/api/collect/${record.id}/`);
            message.success(t('successfullyDeleted'));
            fetchData();
          } catch (error) {
            console.error('Failed to delete task:', error);
          }
        },
        okText: t('confirm'),
        cancelText: t('cancel'),
        centered: true,
      });
    },
    [del, fetchData, t]
  );

  const handleExecuteNow = useCallback(
    async (record: CollectTask) => {
      if (executingTaskIds.includes(record.id)) {
        return;
      }

      try {
        setExecutingTaskIds((prev) => [...prev, record.id]);
        await post(`/cmdb/api/collect/${record.id}/exec_task/`);
        message.success(t('Collection.executeSuccess'));
        await fetchData();
      } catch (error) {
        console.error('Failed to execute task:', error);
      } finally {
        setExecutingTaskIds((prev) => prev.filter((id) => id !== record.id));
      }
    },
    [post, fetchData, t]
  );

  const closeDrawer = () => {
    setEditingId(null);
    setDrawerVisible(false);
  };

  const getDrawerContent = () => {
    const props = {
      onClose: closeDrawer,
      onSuccess: () => {
        fetchData();
      },
      modelId: activeTab || selectedNodeId,
      editId: editingId,
    };
    if (selectedNodeId === 'k8s') {
      return <K8sTaskForm {...props} />;
    }
    return <AddTaskForm {...props} />;
  };

  const toCamelCase = (str: string) => {
    return str
      .toLowerCase()
      .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
  };

  const statusFilters = React.useMemo(() => {
    return Object.entries(EXEC_STATUS).map(([key, value]) => ({
      text: t(`Collection.execStatus.${toCamelCase(key)}`),
      value,
    }));
  }, []);

  useEffect(() => {
    const newColumns: any = getColumns();
    setAllColumns(newColumns);
    setDisplayFieldKeys(
      newColumns.map((col: TableColumnType) => col.key as string)
    );
    setCurrentColumns(newColumns);
  }, []);

  const onSelectFields = async (fields: string[]) => {
    setDisplayFieldKeys(fields);
    setCurrentColumns(
      allColumns.filter(
        (col) => fields.includes(col.key as string) || col.key === 'action'
      ) as ExtendedColumnItem[]
    );
  };

  const isTaskExecuting = useCallback((status: ExecStatusType) => {
    return status === EXEC_STATUS.COLLECTING || status === EXEC_STATUS.WRITING;
  }, []);

  const getColumns = useCallback((): TableColumnType<CollectTask>[] => {
    return [
      {
        title: t('Collection.table.taskName'),
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 180,
        render: (text: any) => <span>{text || '--'}</span>,
      },
      {
        title: t('Collection.table.execStatus'),
        dataIndex: 'exec_status',
        key: 'exec_status',
        width: 120,
        filters: statusFilters,
        filterMultiple: false,
        render: (status: ExecStatusType) => {
          const config = execStatusConfig[status];
          return (
            <div className={styles.statusText}>
              <span
                className={styles.status}
                style={{ background: config.color }}
              />
              <span>{config.text}</span>
            </div>
          );
        },
      },
      {
        title: t('Collection.table.collectSummary'),
        dataIndex: 'collect_digest',
        key: 'collect_digest',
        width: 400,
        render: (_: any, record: CollectTask) => {
          const digest = (record.message || {}) as CollectTaskMessage;
          return Object.keys(digest).length > 0 ? (
            <div className="flex gap-2">
              {(
                Object.entries(ExecStatusMap) as [ExecStatusKey, ExecStatus][]
              ).map(([key, value]) => (
                <Tag key={key} color={value.color}>
                  {value.text}: {digest[key] ?? '--'}
                </Tag>
              ))}
            </div>
          ) : (
            <span>--</span>
          );
        },
      },
      {
        title: t('Collection.table.creator'),
        dataIndex: 'created_by',
        key: 'created_by',
        width: 120,
        render: (text: any) => <span>{text || '--'}</span>,
      },
      {
        title: t('Collection.table.execTime'),
        dataIndex: 'updated_at',
        key: 'updated_at',
        width: 220,
        render: (text: string) => (
          <span>{text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>
        ),
      },
      {
        title: t('Collection.table.actions'),
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
        width: 230,
        render: (_: any, record: CollectTask) => {
          const executing = isTaskExecuting(
            record.exec_status as ExecStatusType
          );
          return (
            <div className="flex gap-3">
              <Button
                type="link"
                size="small"
                onClick={() => handleViewDetail(record)}
              >
                {t('Collection.table.detail')}
              </Button>
              <PermissionWrapper requiredPermissions={['Execute']}>
                <Button
                  type="link"
                  size="small"
                  disabled={executing}
                  loading={executingTaskIds.includes(record.id)}
                  onClick={() => handleExecuteNow(record)}
                >
                  {executingTaskIds.includes(record.id)
                    ? t('Collection.executing')
                    : t('Collection.table.executeNow')}
                </Button>
              </PermissionWrapper>
              <PermissionWrapper requiredPermissions={['Edit']}>
                <Button
                  type="link"
                  size="small"
                  disabled={executing}
                  onClick={() => handleEdit(record)}
                >
                  {t('Collection.table.modify')}
                </Button>
              </PermissionWrapper>
              <PermissionWrapper requiredPermissions={['Delete']}>
                <Button
                  type="link"
                  size="small"
                  disabled={executing}
                  onClick={() => handleDelete(record)}
                >
                  {t('Collection.table.delete')}
                </Button>
              </PermissionWrapper>
            </div>
          );
        },
      },
    ];
  }, [t, executingTaskIds, statusFilters, execStatusConfig, isTaskExecuting]);

  useEffect(() => {
    setCurrentColumns(getColumns() as ExtendedColumnItem[]);
  }, [executingTaskIds]);

  const handleViewDetail = (record: CollectTask) => {
    setCurrentTask(record);
    setDetailVisible(true);
  };

  useEffect(() => {
    if (selectedNodeId) {
      fetchData();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [selectedNodeId]);

  const getItems = (node: TreeNode) => {
    if (node.children?.[0]?.type) {
      node.tabItems = node.children;
      node.children = [];
    } else if (node.children) {
      node.children.forEach(getItems);
    }
  };

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        setTreeLoading(true);
        const data = await get('/cmdb/api/collect/collect_model_tree/');
        const treeData = data.map((node: TreeNode) => {
          getItems(node);
          return node;
        });
        setTreeData(treeData);
        setExpandedKeys(getAllKeys(data));
        if (!data.length) return;

        const firstItem = data[0];
        const defaultKey = firstItem.children?.length
          ? firstItem.children[0].id
          : firstItem.id;
        setSelectedNodeId(defaultKey);
        setSelectedNode(
          treeData.find((node: TreeNode) => node.id === defaultKey)
        );
        setActiveTab(firstItem.tabItems?.[0]?.id || '');
      } catch (error) {
        console.error('Failed to fetch tree data:', error);
      } finally {
        setTreeLoading(false);
      }
    };
    fetchTreeData();
  }, []);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-56 flex-shrink-0 border-r border-gray-200 pr-4 py-2 overflow-auto">
        <Spin spinning={treeLoading}>
          <Tree
            blockNode
            treeData={treeData}
            fieldNames={{ title: 'name', key: 'id', children: 'children' }}
            expandedKeys={expandedKeys}
            selectedKeys={[selectedNodeId]}
            onSelect={onTreeSelect}
          />
        </Spin>
      </div>
      <div className="flex-1 pt-1 pl-5 flex flex-col overflow-hidden">
        {selectedNode?.tabItems && selectedNode.tabItems.length > 1 && (
          <Tabs
            activeKey={activeTab}
            items={selectedNode?.tabItems?.map((tab) => ({
              key: tab.id,
              label: tab.name,
            }))}
            onChange={setActiveTab}
            className="border-b"
          />
        )}
        <div className="mb-4 flex justify-between items-center flex-shrink-0">
          <Input
            placeholder={t('Collection.inputTaskPlaceholder')}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="max-w-md"
            allowClear
            value={searchText}
            onChange={handleSearchChange}
            onPressEnter={handleEnterSearch}
            onClear={handleClearSearch}
          />
          <PermissionWrapper requiredPermissions={['Add']}>
            <Button
              type="primary"
              className="!rounded-button whitespace-nowrap"
              onClick={handleCreate}
            >
              {t('Collection.addTaskTitle')}
            </Button>
          </PermissionWrapper>
        </div>
        <div className="bg-white rounded-lg shadow-sm flex-1 overflow-auto">
          <CustomTable
            size="middle"
            columns={currentColumns}
            dataSource={tableData}
            scroll={{ y: 'calc(100vh - 510px)' }}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            fieldSetting={{
              showSetting: true,
              displayFieldKeys,
              choosableFields: allColumns.filter(
                (item): item is ColumnItem =>
                  item.key !== 'action' && 'dataIndex' in item
              ),
            }}
            onSelectFields={onSelectFields}
            onChange={handleTableChange}
            rowKey="id"
            loading={tableLoading}
          />
        </div>
      </div>

      <Drawer
        title={
          editingId
            ? t('Collection.editTaskTitle')
            : t('Collection.addTaskTitle')
        }
        placement="right"
        width={620}
        onClose={closeDrawer}
        open={drawerVisible}
      >
        {drawerVisible && getDrawerContent()}
      </Drawer>

      <Drawer
        title={t('Collection.taskDetail.title')}
        placement="right"
        width={750}
        onClose={() => setDetailVisible(false)}
        open={detailVisible}
      >
        {detailVisible && currentTask && (
          <div className="bg-gray-50">
            <TaskDetail task={currentTask} />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ProfessionalCollection;
