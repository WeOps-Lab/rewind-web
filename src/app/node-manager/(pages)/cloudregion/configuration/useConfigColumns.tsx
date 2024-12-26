import { useTranslation } from "@/utils/i18n";
import { Button, message, Popconfirm } from "antd";
import type { TableColumnsType } from "antd";
import { ConfigHookParams } from "@/app/node-manager/types/cloudregion";
import { TableDataItem } from "@/app/node-manager/types/index";
import useApiCloudRegion from "@/app/node-manager/api/cloudregion";
import { useEffect, useState } from "react";
export const useConfigColumns = ({
  configurationClick,
  applyconfigurationClick,
}: ConfigHookParams) => {
  const { t } = useTranslation();
  const { deletecollector } = useApiCloudRegion();
  const [deletestate, setDeletestate] = useState<boolean>(false);
  const columns: TableColumnsType<TableDataItem> = [
    {
      title: t("node-manager.cloudregion.Configuration.name"),
      dataIndex: "name",
      fixed: "left",
      width: 150,
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: t("node-manager.cloudregion.Configuration.Collector"),
      dataIndex: "collector",
      width: 150,
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
            onConfirm={() => { deleteconfirm(key) }}
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

  useEffect(() => {
    setDeletestate(false);
  }, [])
  //删除的确定的弹窗(删除单个配置接口实现)
  const deleteconfirm = (key: any) => {
    message.success({
      content: 'success delete',
      duration: 1,
    });
    deletecollector(key);
    setDeletestate(true);
  }

  const delcancel = (e: any) => {
    console.log(e);
    message.error('Click on No');
  }
  const handleDeleteCollector = (deleted: boolean) => {
    setDeletestate(deleted);
  }

  return {
    columns,
    deletestate,
    handleDeleteCollector
  };
};