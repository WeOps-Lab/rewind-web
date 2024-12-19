import { useTranslation } from "@/utils/i18n";
import { Button, Popconfirm } from "antd";
import type { TableColumnsType } from "antd";
import { ConfigHookParams } from "@/app/node-manager/types/cloudregion";
import { TableDataItem } from "@/app/node-manager/types/common";
export const useConfigColumns = ({
  configurationClick,
  applyconfigurationClick,
  deleteconfirm,
  delcancel
}: ConfigHookParams): TableColumnsType<TableDataItem> => {
  const { t } = useTranslation();
  const columns: TableColumnsType<TableDataItem> = [
    {
      title: t("node-manager.cloudregion.Configuration.name"),
      dataIndex: "name",
      fixed: "left",
      width: 180,
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: t("node-manager.cloudregion.Configuration.Collector"),
      dataIndex: "collector",
      width: 300,
    },
    {
      title: t("node-manager.cloudregion.Configuration.System"),
      dataIndex: "operatingsystem",
      width: 200,
    },
    {
      title: t("node-manager.cloudregion.Configuration.count"),
      dataIndex: "nodecount",
      width: 200,
    },
    {
      title: t("common.Actions"),
      dataIndex: "key",
      fixed: "right",
      width: 180,
      render: (key) => (
        <div className="flex">
          <Button
            color="primary"
            variant="link"
            onClick={() => {
              applyconfigurationClick(key);
            }}
          >
            {t("common.apply")}
          </Button>
          <Button
            color="primary"
            variant="link"
            onClick={() => {
              configurationClick(key);
            }}
          >
            {t("common.edit")}
          </Button>
          <Popconfirm
            title={t("node-manager.cloudregion.Configuration.deltitle")}
            description={t("node-manager.cloudregion.Configuration.deleteinfo")}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
            onConfirm={deleteconfirm}
            onCancel={delcancel}
          >
            <Button
              color="primary"
              variant="link"
            >
              {t("common.delete")}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return columns;
};