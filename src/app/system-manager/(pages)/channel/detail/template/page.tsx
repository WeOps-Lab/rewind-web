"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Table, Input, Spin, Drawer, Button, Pagination, message } from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { useSearchParams } from 'next/navigation';
import type { ColumnType } from 'antd/es/table';
import { useChannelApi } from '@/app/system-manager/api/channel';
import { ChannelTemplate } from '@/app/system-manager/types/channel';

const { Search } = Input;

const TemplatePage: React.FC = () => {
  const { t } = useTranslation();
  const { get } = useApiClient();
  const searchParams = useSearchParams();
  const channelId = searchParams.get("id"); // 获取传入的 channel id
  const [searchText, setSearchText] = useState(""); // 搜索的关键字
  const [data, setData] = useState<ChannelTemplate[]>([]); // 模板数据
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChannelTemplate | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);

  const { getChannelTemp } = useChannelApi();

  // 调用后端接口获取模板数据
  const fetchChannelTemplates = useCallback(
    async (searchText = "", page = 1, pageSize = 10) => {
      if (!channelId) {
        console.error("Channel ID is required.");
        return;
      }
      setLoading(true);
      try {
        const params = {
          name: "监控模板",
          channel_obj: channelId, // 传入的 channel ID
          title: searchText || "${title}", // 搜索条件
          app: "monitor",
          context: "这是告警模板内容",
          page,
          page_size: pageSize,
        };
        const response = await getChannelTemp(params);
        const items: ChannelTemplate[] = response.items.map((item: any) => ({
          key: item.id,
          id: item.id,
          name: item.name,
          app: item.app,
          title: item.title,
          context: item.context,
          channelObj: item.channel_obj,
        }));
        setData(items);
        setTotal(response.count || 0);
      } catch (error) {
        console.error(`${t("common.fetchFailed")}:`, error);
      } finally {
        setLoading(false);
      }
    },
    [channelId, get, t]
  );

  // 初始化获取数据
  useEffect(() => {
    fetchChannelTemplates();
  }, [fetchChannelTemplates]);

  // 搜索事件处理
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
    fetchChannelTemplates(value, 1, pagination.pageSize);
  };

  // 分页切换事件
  const handleTableChange = (page: number, pageSize?: number) => {
    const newPagination = {
      current: page,
      pageSize: pageSize || pagination.pageSize,
    };
    setPagination(newPagination);
    fetchChannelTemplates(searchText, newPagination.current, newPagination.pageSize);
  };

  // 打开抽屉显示模板详情
  const handleDetailClick = (record: ChannelTemplate) => {
    setSelectedTemplate(record);
    setDrawerVisible(true);
  };

  // 复制内容到剪贴板
  const handleCopy = (content: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => message.success(t("system.channel.template.copySuccess")))
      .catch(() => message.error(t("system.channel.template.copyFailed")));
  };

  // 表格列定义
  const columns: ColumnType<ChannelTemplate>[] = [
    {
      title: t("system.channel.template.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("system.channel.template.app"),
      dataIndex: "app",
      key: "app",
    },
    {
      title: t("system.channel.template.title"),
      dataIndex: "title",
      key: "title",
    },
    {
      title: t("common.actions"),
      key: "actions",
      render: (_, record) => (
        <Button type="link" onClick={() => handleDetailClick(record)}>
          {t("system.channel.template.detail")}
        </Button>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-[20px]">
        <div className="flex justify-end space-x-4">
          <Search
            placeholder={`${t("system.channel.template.search")}...`}
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
            scroll={{ y: "calc(100vh - 400px)" }}
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
        title={t("system.channel.template.detail")}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={680}
      >
        {selectedTemplate && (
          <div>
            <p>
              <strong>{t("system.channel.template.name")}: </strong>
              {selectedTemplate.name}
            </p>
            <p>
              <strong>{t("system.channel.template.app")}: </strong>
              {selectedTemplate.app}
            </p>
            <p>
              <strong>{t("system.channel.template.title")}: </strong>
              {selectedTemplate.title}
            </p>
            <p>
              <strong>{t("system.channel.template.context")}: </strong>
              {selectedTemplate.context}
            </p>
            <Button type="primary" onClick={() => handleCopy(selectedTemplate.context)}>
              {t("system.channel.template.copyContext")}
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TemplatePage;
