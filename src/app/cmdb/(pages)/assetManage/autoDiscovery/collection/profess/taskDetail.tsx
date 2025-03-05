'use client';

import React, { useState } from 'react';
import { Alert, Button, Tabs } from 'antd';
import CustomTable from '@/components/custom-table';
import type { CollectTask } from '@/app/cmdb/types/autoDiscovery';
import { TASK_DETAIL_CONFIG, MOCK_TABLE_DATA } from './constants';
import styles from './index.module.scss';

interface TaskDetailProps {
  task: CollectTask;
}

const TaskTable: React.FC<{
  type: string;
  columns: any[];
}> = ({ columns }) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 4,
  });

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  return (
    <CustomTable
      size="middle"
      columns={columns}
      dataSource={MOCK_TABLE_DATA}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
      }}
      onChange={handleTableChange}
      scroll={{ y: 'calc(100vh - 320px)' }}
      rowKey="key"
    />
  );
};

const TaskDetail: React.FC<TaskDetailProps> = () => {
  const actionColumn = {
    title: '操作',
    key: 'action',
    fixed: 'right' as const,
    width: 120,
    render: () => (
      <Button type="link" size="small">
        变更记录
      </Button>
    ),
  };

  const tabItems = Object.entries(TASK_DETAIL_CONFIG).map(([key, config]) => ({
    key,
    label: `${config.label} (${config.count})`,
    children: (
      <div className="flex flex-col h-full">
        <Alert
          message={config.message}
          type={config.alertType}
          showIcon
          className="mb-4"
        />
        <TaskTable type={key} columns={[...config.columns, actionColumn]} />
      </div>
    ),
  }));

  return (
    <div
      className={`flex flex-col h-full bg-white rounded-lg ${styles.taskDetail}`}
    >
      <Tabs defaultActiveKey="update" items={tabItems} className="flex-1" />
    </div>
  );
};

export default TaskDetail;
