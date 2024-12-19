import { useTranslation } from "@/utils/i18n";
import { Button, Popconfirm, type TableColumnsType } from "antd";
import type { TableDataItem } from "@/app/node-manager/types/common";
import { VariableProps } from "@/app/node-manager/types/cloudregion";
export const useVarColumns = ({
  openUerModal,
  getFormDataById,
  delconfirm,
  delcancel
}: VariableProps): TableColumnsType<TableDataItem> => {
  const { t } = useTranslation();
  const columns: TableColumnsType<TableDataItem> = [
    {
      title: t("node-manager.cloudregion.variable.Name"),
      dataIndex: "name",
      width: 180,
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: t("node-manager.cloudregion.variable.Value"),
      dataIndex: "value",
      width: 150,
    },
    {
      title: t("node-manager.cloudregion.variable.Desc"),
      dataIndex: "description",
      width: 200,
    },
    {
      title: t("common.actions"),
      dataIndex: "key",
      width: 200,
      fixed: "right",
      render: (key: string) => (
        <div>
          <Button
            onClick={() => {
              openUerModal("edit", getFormDataById(key)!);
            }}
            color="primary"
            variant="link"
          >
            {t("common.edit")}
          </Button>

          <Popconfirm
            title={t("node-manager.cloudregion.variable.deletevariable")}
            description={t("node-manager.cloudregion.variable.deleteinfo")}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
            onConfirm={delconfirm}
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