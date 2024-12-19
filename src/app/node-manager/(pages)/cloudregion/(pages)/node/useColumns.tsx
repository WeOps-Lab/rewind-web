import { useTranslation } from "@/utils/i18n";
import { Tag } from "antd";
import type { TableColumnsType } from 'antd';
import { TableDataItem } from "@/app/node-manager/types/common"
interface HookParams {
  toggleExpandRow: (key: string) => void;
}
export const useColumns = ({
  toggleExpandRow
}: HookParams): TableColumnsType<TableDataItem> => {
  const { t } = useTranslation();

  const columns: TableColumnsType<TableDataItem> = [
    {
      title: t("node-manager.cloudregion.node.ip"),
      dataIndex: "ip",
      key: "ip",
      render: (text, record) => (
        <a onClick={() => toggleExpandRow(record.key.toString())}>{text}</a>
      ),
    },
    {
      title: t("node-manager.cloudregion.node.system"),
      dataIndex: "operatingsystem",
      filters: [
        {
          text: "Windows",
          value: "Windows",
        },
        {
          text: "Linux",
          value: "Linux",
        },
      ],
      onFilter: (value, record) =>
        record.operatingsystem.indexOf(value as string) === 0,
    },
    {
      title: t("node-manager.cloudregion.node.sidecar"),
      dataIndex: "sidecar",
      filters: [
        {
          text: "Running",
          value: "Running",
        },
        {
          text: "Error",
          value: "Error",
        },
      ],
      onFilter: (value, record) =>
        record.sidecar.indexOf(value as string) === 0,
      render: (key: string) => {
        if (key === "Running") {
          return (
            <Tag bordered={false} color="success">
              {key}
            </Tag>
          );
        }
        return (
          <Tag bordered={false} color="error">
            {key}
          </Tag>
        );
      },
    },
  ];
  return columns;
};