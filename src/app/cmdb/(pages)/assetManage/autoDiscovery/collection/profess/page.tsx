'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input, Button, Spin, Tag, Tree, Drawer, message } from 'antd';
import { Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import K8sTaskForm from './k8sTask';
import AddTaskForm from './addTask';
import useApiClient from '@/utils/request';
import { createExecStatusMap, ExecStatusKey, ExecStatus } from './constants';
import CustomTable from '@/components/custom-table';
import type { ColumnItem } from '@/app/cmdb/types/assetManage';
import {
  CollectTask,
  TreeNode,
  CollectTaskMessage,
} from '@/app/cmdb/types/autoDiscovery';
import { withCommon } from '@/app/cmdb/context/withCommon';

const ProfessionalCollection: React.FC = () => {
  const { t } = useTranslation();
  const { get, del } = useApiClient();
  const ExecStatusMap = React.useMemo(() => createExecStatusMap(t), [t]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string>('');
  const [tableData, setTableData] = useState<CollectTask[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [execStatus, setExecStatus] = useState<number | undefined>();
  const [displayFieldKeys, setDisplayFieldKeys] = useState<string[]>([]);
  const [allColumns, setAllColumns] = useState<ColumnItem[]>([]);
  const [currentColumns, setCurrentColumns] = useState<ColumnItem[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

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

  const fetchTableData = React.useCallback(
    async (nodeId: string) => {
      try {
        setTableLoading(true);
        const params = {
          model_id: nodeId,
          name: searchName,
          page: pagination.current,
          page_size: pagination.pageSize,
          ...(execStatus !== undefined && { exec_status: execStatus }),
        };
        const data = await get('/cmdb/api/collect/search/', { params });
        setTableData(data.items || []);
        setPagination((prev) => ({
          ...prev,
          total: data.count || 0,
        }));
      } catch (error) {
        console.error('Failed to fetch table data:', error);
      } finally {
        setTableLoading(false);
      }
    },
    [searchName, pagination.current, pagination.pageSize, execStatus]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTreeLoading(true);
        const data = await get('/cmdb/api/collect/collect_model_tree/');
        setTreeData(data);
        setExpandedKeys(getAllKeys(data));
        if (!data.length) return;

        const firstItem = data[0];
        const defaultKey = firstItem.children?.length
          ? firstItem.children[0].id
          : firstItem.id;
        setSelectedNode(defaultKey);
        await fetchTableData(defaultKey);
      } catch (error) {
        console.error('Failed to fetch tree data:', error);
      } finally {
        setTreeLoading(false);
      }
    };
    fetchData();
  }, []);

  const enterText = () => {
    setSearchName(searchText);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchTableData(selectedNode);
  };

  const clearText = () => {
    setSearchText('');
    setSearchName('');
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchTableData(selectedNode);
  };

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    },
    []
  );

  const handleTableChange = (pagination: any, filters: any) => {
    setPagination(pagination);
    setExecStatus(filters.exec_status?.[0]);
    fetchTableData(selectedNode);
  };

  const onTreeSelect = async (selectedKeys: any[]) => {
    if (selectedKeys.length > 0) {
      const nodeId = selectedKeys[0] as string;
      setSelectedNode(nodeId);
      await fetchTableData(nodeId);
    }
  };

  const handleCreate = () => {
    setEditingId(null);
    setDrawerVisible(true);
  };

  const handleEdit = (record: CollectTask) => {
    setEditingId(record.id);
    setDrawerVisible(true);
  };

  const handleDelete = (record: CollectTask) => {
    console.log('record', record);
    Modal.confirm({
      title: t('deleteTitle'),
      content: t('deleteContent'),
      onOk: async () => {
        try {
          await del(`/cmdb/api/collect/${record.id}/`);
          message.success(t('successfullyDeleted'));
          fetchTableData(selectedNode);
        } catch (error) {
          console.error('Failed to delete task:', error);
        }
      },
      okText: t('confirm'),
      cancelText: t('cancel'),
      centered: true,
    });
  };

  const closeDrawer = () => {
    setEditingId(null);
    setDrawerVisible(false);
  };

  const getDrawerContent = () => {
    const props = {
      onClose: closeDrawer,
      onSuccess: () => {
        fetchTableData(selectedNode);
      },
      modelId: selectedNode,
      editId: editingId,
    };

    const parentNode = treeData.find((node) =>
      node.children?.some((child) => child.id === selectedNode)
    );
    if (parentNode?.id === 'k8s') {
      return <K8sTaskForm {...props} />;
    }
    return <AddTaskForm {...props} />;
  };

  const columns = React.useMemo(() => {
    const cols: ColumnItem[] = [
      {
        title: t('Collection.table.taskName'),
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 180,
        render: (text: any) => <span>{text ?? '--'}</span>,
      },
      {
        title: t('Collection.table.execStatus'),
        dataIndex: 'exec_status',
        key: 'exec_status',
        width: 100,
        render: (text: any) => <span>{text ?? '--'}</span>,
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
        render: (text: any) => <span>{text ?? '--'}</span>,
      },
      {
        title: t('Collection.table.execTime'),
        dataIndex: 'updated_at',
        key: 'updated_at',
        width: 240,
        render: (text: any) => <span>{text ?? '--'}</span>,
      },
      {
        title: t('Collection.table.actions'),
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
        width: 220,
        render: (_, record: CollectTask) => (
          <div className="flex gap-3">
            <Button type="link" size="small">
              {t('Collection.table.detail')}
            </Button>
            <Button type="link" size="small">
              {t('Collection.table.executeNow')}
            </Button>
            <Button type="link" size="small" onClick={() => handleEdit(record)}>
              {t('Collection.table.modify')}
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => handleDelete(record)}
            >
              {t('Collection.table.delete')}
            </Button>
          </div>
        ),
      },
    ];
    return cols;
  }, []);

  useEffect(() => {
    setAllColumns(columns);
    setDisplayFieldKeys(columns.map((col) => col.key as string));
    setCurrentColumns(columns);
  }, []);

  const onSelectFields = async (fields: string[]) => {
    setDisplayFieldKeys(fields);
    setCurrentColumns(
      allColumns.filter(
        (col) => fields.includes(col.key as string) || col.key === 'action'
      )
    );
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-56 flex-shrink-0 border-r border-gray-200 p-4 overflow-auto">
        <Spin spinning={treeLoading}>
          <Tree
            blockNode
            treeData={treeData}
            fieldNames={{ title: 'name', key: 'id', children: 'children' }}
            expandedKeys={expandedKeys}
            selectedKeys={[selectedNode]}
            onSelect={onTreeSelect}
          />
        </Spin>
      </div>
      <div className="flex-1 pt-2 pl-5 flex flex-col overflow-hidden">
        <div className="mb-4 flex justify-between items-center flex-shrink-0">
          <Input
            placeholder={t('Collection.inputTaskPlaceholder')}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="max-w-md"
            allowClear
            value={searchText}
            onChange={handleSearchChange}
            onPressEnter={enterText}
            onClear={clearText}
          />
          <Button
            type="primary"
            className="!rounded-button whitespace-nowrap"
            onClick={handleCreate}
          >
            {t('Collection.newTask')}
          </Button>
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
    </div>
  );
};

export default withCommon(ProfessionalCollection);
