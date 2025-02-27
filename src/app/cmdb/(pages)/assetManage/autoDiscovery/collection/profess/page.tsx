'use client';

import React, { useState } from 'react';
import { Input, Button, Table, Tag, Tree } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import type { TableColumnsType } from 'antd';
import AddTask from './addTask';

const menuItems = [
  { key: 'kbs', label: 'KBS', children: [] },
  { key: 'snmp', label: 'snmp设备', children: [] },
  { key: 'network', label: '网络拓扑', children: [] },
  {
    key: 'ip',
    label: 'IP管理',
    children: [
      { key: 'ip-device', label: '网络设备' },
      { key: 'ip-config', label: '配置文件' },
    ],
  },
  {
    key: 'database',
    label: '数据库',
    children: [
      { key: 'postgresql', label: 'PostgreSQL' },
      { key: 'mysql', label: 'MySQL' },
      { key: 'h2', label: 'H2数据库' },
      { key: 'redis', label: 'Redis' },
      { key: 'oracle', label: 'Oracle' },
    ],
  },
  { key: 'cloud', label: '云平台', children: [] },
  { key: 'cert', label: '证书许可', children: [] },
  { key: 'asset', label: '资产关联', children: [] },
  { key: 'middleware', label: '中间件', children: [] },
  { key: 'network-device', label: '网络设备', children: [] },
  { key: 'host', label: '主机管理', children: [] },
];

const treeData = menuItems.map((item) => ({
  title: item.label,
  key: item.key,
  children: item.children?.map((child) => ({
    title: child.label,
    key: child.key,
  })),
}));

const professionalData = [
  {
    key: '1',
    name: '资源采集',
    status: '异常',
    summary: [
      { count: 0, type: '新增资产', color: 'success' },
      { count: 2, type: '更新资产', color: 'processing' },
      { count: 1, type: '新增关联', color: 'warning' },
      { count: 0, type: '下线资产', color: 'error' },
    ],
    creator: 'admin',
    executeTime: '2025-01-09 01:56:16',
  },
];

const professionalColumns: TableColumnsType<any> = [
  {
    title: '任务名称',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    width: 150,
  },
  {
    title: '执行状态',
    dataIndex: 'status',
    key: 'status',
    render: (text: string) => <Tag color="processing">{text}</Tag>,
    width: 100,
  },
  {
    title: '采集摘要',
    dataIndex: 'summary',
    key: 'summary',
    width: 400,
    render: (summaries: { count: number; type: string; color: string }[]) => (
      <div className="flex gap-2">
        {summaries.map((item, index) => (
          <Tag key={index} color={item.color}>
            {item.type}: {item.count}
          </Tag>
        ))}
      </div>
    ),
  },
  { title: '创建者', dataIndex: 'creator', key: 'creator', width: 100 },
  {
    title: '执行时间',
    dataIndex: 'executeTime',
    key: 'executeTime',
    width: 200,
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 280,
    render: () => (
      <div className="flex gap-3">
        <Button type="link" size="small">
          详情
        </Button>
        <Button type="link" size="small">
          立即执行
        </Button>
        <Button type="link" size="small">
          修改
        </Button>
        <Button type="link" size="small">
          删除
        </Button>
      </div>
    ),
  },
];

const ProfessionalCollection: React.FC = () => {
  const { t } = useTranslation();
  const [addTaskVisible, setAddTaskVisible] = useState(false);

  const openAddTask = () => {
    setAddTaskVisible(true);
  };

  const closeAddTask = () => {
    setAddTaskVisible(false);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="w-64 flex-shrink-0 border-r border-gray-200 p-4 overflow-auto">
        <Tree treeData={treeData} defaultExpandAll />
      </div>
      <div className="flex-1 p-6 flex flex-col overflow-hidden">
        <div className="mb-4 flex justify-between items-center flex-shrink-0">
          <Input
            placeholder={t('Collection.inputTaskPlaceholder')}
            prefix={<SearchOutlined className="text-gray-400" />}
            className="max-w-md"
          />
          <Button
            type="primary"
            className="!rounded-button whitespace-nowrap"
            onClick={openAddTask}
          >
            {t('Collection.newTask')}
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow-sm flex-1 overflow-auto">
          <Table
            columns={professionalColumns}
            dataSource={professionalData}
            scroll={{ x: 1000 }}
            pagination={{
              total: professionalData.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </div>
      </div>
      {addTaskVisible && <AddTask visible={addTaskVisible} onClose={closeAddTask} />}
    </div>
  );
};

export default ProfessionalCollection;
