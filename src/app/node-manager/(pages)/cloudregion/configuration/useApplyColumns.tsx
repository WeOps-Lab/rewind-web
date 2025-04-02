import { useTranslation } from "@/utils/i18n";
import { Button, Tag } from "antd";
import type { TableColumnsType } from "antd";

export const useApplyColumns = ({
  handleApply,
  nodes
}: { handleApply: (key: string) => void, nodes: string[] }): TableColumnsType => {
  const { t } = useTranslation();
  //数据
  const applycolumns: TableColumnsType = [
    {
      title: t('node-manager.cloudregion.Configuration.ip'),
      dataIndex: "ip"
    },
    {
      title: t('node-manager.cloudregion.Configuration.system'),
      dataIndex: "operatingsystem"
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
      title: t('common.actions'),
      dataIndex: "key",
      fixed: "right",
      render: (key: string, sidecarinfo) => {
        return (
          <div>{
            nodes.includes(sidecarinfo.key) ?
              <Button type="link" onClick={() => { }}>{t('common.unapply')}</Button>
              : <Button disabled={sidecarinfo.sidecar != 'Running'} type="link" onClick={() => { handleApply(key) }}>{t('common.apply')}</Button>}</div>
        )
      },
    },
  ];
  return applycolumns;
};