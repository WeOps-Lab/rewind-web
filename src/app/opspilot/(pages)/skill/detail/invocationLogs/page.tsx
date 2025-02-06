"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Input, Spin, Drawer, Button, Pagination, message } from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { useSearchParams } from 'next/navigation';
import type { ColumnType } from 'antd/es/table';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import CollapsibleSection from './collapsibleSection';

const { Search } = Input;

interface LogDetail {
  key: string | number;
  createdTime: string;
  clientIp: string;
  state: boolean;
  id: string | number;
  requestDetail: object;
  responseDetail: object;
}

const InvocationLogsPage: React.FC = () => {
  const { t } = useTranslation();
  const { get } = useApiClient();
  const searchParams = useSearchParams();
  const skillId = searchParams.get('id');
  const { convertToLocalizedTime } = useLocalizedTime();
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState<LogDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLogDetail, setSelectedLogDetail] = useState<LogDetail | null>(null);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const fetchLogs = useCallback(async (searchText = '', page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params: any = { page, page_size: pageSize, skill_id: skillId };
      if (searchText) params.current_ip = searchText;

      const data = await get('/model_provider_mgmt/skill_log/', { params });
      const items: LogDetail[] = data.items.map((item: any) => ({
        key: item.id,
        createdTime: item.created_at,
        clientIp: item.current_ip,
        state: item.state,
        id: item.id,
        requestDetail: item.request_detail,
        responseDetail: item.response_detail,
      }));
      setData(items);
      setTotal(data.count);
    } catch (error) {
      console.error(`${t('common.fetchFailed')}:`, error);
    }
    setLoading(false);
  }, [get, skillId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
    fetchLogs(value, 1, pagination.pageSize);
  };

  const handleDetailClick = (record: LogDetail) => {
    setSelectedLogDetail(record);
    setDrawerVisible(true);
  };

  const handleTableChange = (page: number, pageSize?: number) => {
    const newPagination = {
      current: page,
      pageSize: pageSize || pagination.pageSize,
    };
    setPagination(newPagination);
    fetchLogs(searchText, newPagination.current, newPagination.pageSize);
  };

  const handleCopy = (content: object) => {
    navigator.clipboard
      .writeText(JSON.stringify(content, null, 2))
      .then(() => {
        message.success(t('skill.invocationLogs.copied'));
      })
      .catch(() => {
        message.error(t('skill.invocationLogs.copyFailed'));
      });
  };

  const columns: ColumnType<LogDetail>[] = [
    {
      title: t('skill.invocationLogs.table.time'),
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (text) => convertToLocalizedTime(text),
    },
    {
      title: t('skill.invocationLogs.table.clientIp'),
      dataIndex: 'clientIp',
      key: 'clientIp',
    },
    {
      title: t('skill.invocationLogs.table.state'),
      dataIndex: 'state',
      key: 'state',
      render: (text) => (text ? t('skill.invocationLogs.success') : t('skill.invocationLogs.failure')),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (text, record) => (
        <Button type="link" onClick={() => handleDetailClick(record)}>
          {t('skill.invocationLogs.detail')}
        </Button>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-[20px]">
        <div className="flex justify-end space-x-4">
          <Search
            placeholder={`${t('common.search')}...`}
            allowClear
            onSearch={handleSearch}
            enterButton
            className="w-60"
          />
        </div>
      </div>
      <div className="flex-grow">
        {loading ? (
          <div className="w-full flex items-center justify-center min-h-72">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={data}
            columns={columns}
            pagination={false}
            scroll={{ y: 'calc(100vh - 400px)' }}
          />
        )}
      </div>
      {total > 0 && (
        <Pagination
          total={total}
          showSizeChanger
          current={pagination.current}
          pageSize={pagination.pageSize}
          onChange={handleTableChange}
          className="fixed bottom-8 right-8"
        />
      )}
      <Drawer
        title={t('skill.invocationLogs.apiDetail')}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={680}
      >
        {selectedLogDetail && (
          <div>
            <CollapsibleSection
              title={t('skill.invocationLogs.requestInfo')}
              content={selectedLogDetail.requestDetail}
              onCopy={handleCopy}
            />

            <CollapsibleSection
              title={t('skill.invocationLogs.responseInfo')}
              content={selectedLogDetail.responseDetail}
              onCopy={handleCopy}
            />
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default InvocationLogsPage;
