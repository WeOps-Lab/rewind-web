'use client';

import React, { useState, useEffect } from 'react';
import { Alert, Tabs, Button, message, Modal } from 'antd';
import CustomTable from '@/components/custom-table';
import type { CollectTask } from '@/app/cmdb/types/autoDiscovery';
import { TASK_DETAIL_CONFIG } from '@/app/cmdb/constants/professCollection';
import styles from '../index.module.scss';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';

interface TaskDetailProps {
  task: CollectTask;
  modelId?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

interface TaskData {
  data: any[];
  count: number;
}

interface TaskDetailData {
  add: TaskData;
  update: TaskData;
  delete: TaskData;
  relation: TaskData;
}

interface TaskTableProps {
  type: string;
  taskId: number;
  isApprove: boolean;
  columns: any[];
  onClose?: () => void;
  onSuccess?: () => void;
}

const TaskTable: React.FC<TaskTableProps> = ({
  type,
  taskId,
  columns,
  isApprove,
  onClose,
  onSuccess,
}) => {
  const { get, post } = useApiClient();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await get(`/cmdb/api/collect/${taskId}/info/`);
      const data = response as TaskDetailData;
      const typeData =
        type === 'offline' ? data.delete : data[type as keyof TaskDetailData];
      const listData = typeData?.data || [];
      setAllData(listData);
      updateDisplayData(listData, pagination.current, pagination.pageSize);
      setPagination((prev) => ({
        ...prev,
        total: listData.length,
      }));
    } catch (error) {
      console.error('Failed to fetch task detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayData = (
    data: any[],
    current: number,
    pageSize: number
  ) => {
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    setDisplayData(data.slice(start, end));
  };

  useEffect(() => {
    if (taskId) {
      fetchData();
    }
  }, [taskId]);

  const handleTableChange = (newPagination: any) => {
    setPagination({ ...newPagination, total: allData.length });
    updateDisplayData(allData, newPagination.current, newPagination.pageSize);
  };

  const handleApprove = async () => {
    if (!selectedRowKeys.length) {
      message.warning('请选择需要审批的数据');
      return;
    }

    Modal.confirm({
      title: t('Collection.taskDetail.approvalConfirm'),
      content: `确定审批选中的 ${selectedRowKeys.length} 条数据吗？`,
      okText: t('confirm'),
      cancelText: t('cancel'),
      centered: true,
      onOk: async () => {
        try {
          await post(`/cmdb/api/collect/${taskId}/approval/`, {
            instances: selectedRows,
          });
          message.success(t('Collection.taskDetail.approvalSuccess'));
          onClose?.();
          onSuccess?.();
        } catch (error) {
          console.error('Failed to approve:', error);
        }
      },
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[], rows: any[]) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
  };

  return (
    <>
      <CustomTable
        size="middle"
        columns={columns}
        dataSource={displayData}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
        scroll={{ y: 'calc(100vh - 350px)' }}
        rowKey={(record) => record.id || record.inst_name || record.name}
        loading={loading}
        rowSelection={isApprove ? rowSelection : undefined}
      />
      <div className="flex justify-start space-x-4">
        {isApprove ? (
          <>
            <Button type="primary" onClick={handleApprove}>
              {t('Collection.execStatus.approval')}
            </Button>
            <Button onClick={onClose}>{t('common.cancel')}</Button>
          </>
        ) : (
          <Button onClick={onClose}>{t('common.close')}</Button>
        )}
      </div>
    </>
  );
};

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  modelId,
  onClose,
  onSuccess,
}) => {
  const { get } = useApiClient();
  const { t } = useTranslation();
  const [detailData, setDetailData] = useState<TaskDetailData>({
    add: { data: [], count: 0 },
    update: { data: [], count: 0 },
    delete: { data: [], count: 0 },
    relation: { data: [], count: 0 },
  });

  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        const response = await get(`/cmdb/api/collect/${task.id}/info/`);
        setDetailData(response as TaskDetailData);
      } catch (error) {
        console.error('Failed to fetch task detail data:', error);
      }
    };
    fetchDetailData();
  }, [task.id]);

  const statusColumn = {
    title: '状态',
    dataIndex: '_status',
    width: 120,
    render: (status: string) => {
      if (status === 'success') {
        return (
          <span className="text-green-500">
            {t('Collection.execStatus.success')}
          </span>
        );
      }
      return (
        <span className="text-red-500">{t('Collection.execStatus.error')}</span>
      );
    },
  };

  const isApprove = task.input_method === 1 && !task.examine;

  const tabItems = Object.entries(TASK_DETAIL_CONFIG)
    .filter(([key]) => !(modelId === 'k8s' && key === 'relation'))
    .map(([key, config]) => {
      const count = detailData[key as keyof TaskDetailData]?.count || 0;
      return {
        key,
        label: `${config.label} (${count})`,
        children: (
          <div className="flex flex-col h-full">
            <Alert
              message={config.message}
              type={config.alertType}
              showIcon
              className="mb-4"
            />
            <TaskTable
              type={key}
              taskId={task.id}
              isApprove={isApprove}
              columns={[...config.columns, statusColumn]}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          </div>
        ),
      };
    });

  return (
    <div
      className={`flex flex-col h-full bg-white rounded-lg ${styles.taskDetail}`}
    >
      <Tabs defaultActiveKey="add" items={tabItems} className="flex-1" />
    </div>
  );
};

export default TaskDetail;
