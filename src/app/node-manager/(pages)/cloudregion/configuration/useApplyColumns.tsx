import { useTranslation } from "@/utils/i18n";
import { Button, Tag } from "antd";
import type { TableColumnsType } from "antd";

export const useApplyColumns = ({
  handleApply,
}: { handleApply: (key: string) => void }): TableColumnsType => {
  const { t } = useTranslation();
  //数据
  const applycolumns: TableColumnsType = [
    {
      title: t('node-manager.cloudregion.Configuration.ip'),
      dataIndex: "ip",
    },
    {
      title: t('node-manager.cloudregion.Configuration.System'),
      dataIndex: "operatingsystem",
    },
    {
      title: t('node-manager.cloudregion.Configuration.sidecar'),
      dataIndex: "sidecar",
      className: "table-cell-center",
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
    {
      title: t('common.Actions'),
      dataIndex: "key",
      fixed: "right",
      render: (key: string, sidecarinfo) => {
        return (<Button disabled={sidecarinfo.sidecar != 'Running'} type="link" onClick={() => { handleApply(key) }}>{t('common.apply')}</Button>)
      },
    },
  ];
  return applycolumns;
};