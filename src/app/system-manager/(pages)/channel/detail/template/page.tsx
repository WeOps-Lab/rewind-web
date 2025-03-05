"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Table, Input, Spin, Drawer, Button, Pagination, message } from "antd";
import { useTranslation } from "@/utils/i18n";
import type { ColumnType } from "antd/es/table";
import { ChannelTemplate } from "@/app/system-manager/types/channel";
import { useChannelApi } from "@/app/system-manager/api/channel";

const { Search } = Input;

const TemplatePage: React.FC = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [data, setData] = useState<ChannelTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChannelTemplate | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);

  const { getChannelTemp } = useChannelApi();

  const fetchChannelTemplates = useCallback(
    async (searchText = "", page = 1, pageSize = 10) => {
      setLoading(true);
      try {
        const data = await getChannelTemp({
          searchText,
          page,
          pageSize,
        });
        const { items, total } = data;
        setData(items);
        setTotal(total);
      } catch (error) {
        console.error(`${t("common.fetchFailed")}:`, error);
        message.error(t("common.fetchFailed"));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchChannelTemplates('', pagination.current, pagination.pageSize);
  }, [fetchChannelTemplates, pagination.current, pagination.pageSize]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
    fetchChannelTemplates(value, 1, pagination.pageSize);
  };

  const handleTableChange = (page: number, pageSize?: number) => {
    const newPagination = {
      current: page,
      pageSize: pageSize || pagination.pageSize,
    };
    setPagination(newPagination);
    fetchChannelTemplates(searchText, newPagination.current, newPagination.pageSize);
  };

  const handleDetailClick = (record: ChannelTemplate) => {
    setSelectedTemplate(record);
    setDrawerVisible(true);
  };

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
            placeholder={`${t("common.search")}...`}
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
            rowKey="id"
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
        title={selectedTemplate?.name || t("system.channel.template.detail")}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={680}
      >
        {selectedTemplate && (
          <div className="flex flex-col">
            <div className="mb-4">
              <p className="mb-2">{t("system.channel.template.name")}: </p>
              <div className="border p-2 rounded-md text-sm text-[var(--color-text-2)]">{selectedTemplate.name}</div>
            </div>
            <div className="mb-4">
              <p className="mb-2">{t("system.channel.template.app")}: </p>
              <div className="border p-2 rounded-md text-sm text-[var(--color-text-2)]">{selectedTemplate.app}</div>
            </div>
            <div className="mb-4">
              <p className="mb-2">{t("system.channel.template.context")}: </p>
              <div className="border p-2 rounded-md text-sm text-[var(--color-text-2)] min-h-[100px]">{selectedTemplate.context}</div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default TemplatePage;
