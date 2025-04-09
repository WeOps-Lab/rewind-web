import { useTranslation } from '@/utils/i18n';
import { Button } from 'antd';
import type { TableColumnsType } from 'antd';
import { ConfigHookParams } from '@/app/node-manager/types/cloudregion';
import { TableDataItem } from '@/app/node-manager/types/index';
export const useConfigColumns = ({
  configurationClick,
  openSub
}: ConfigHookParams) => {
  const { t } = useTranslation();
  const columns: TableColumnsType<TableDataItem> = [
    {
      title: t('common.name'),
      dataIndex: 'name',
      fixed: 'left',
      width: 300,
      render: (text: string) => <p>{text}</p>,
    },
    {
      title: t('node-manager.cloudregion.node.node'),
      dataIndex: 'nodes',
      width: 150,
      render: (text: string) => <p>{text}</p>,
    },
    {
      title: t('node-manager.cloudregion.Configuration.sidecar'),
      dataIndex: 'collector',
      align: 'center',
      filters: [
        {
          text: 'Telegraf',
          value: 'Telegraf'
        },
        {
          text: 'Sidecar',
          value: 'Sidecar'
        }
      ],
      width: 150,
      onFilter: (value, record) => record?.sidecar === value,
      render: (text: string) => <p>{text}</p>,
    },
    {
      title: t('common.actions'),
      dataIndex: 'key',
      fixed: 'right',
      align: 'center',
      width: 180,
      render: (key, item) => (
        <div className="flex justify-center">
          <Button
            color="primary"
            variant="link"
            onClick={() => {
              configurationClick(key);
            }}
          >
            {t('common.edit')}
          </Button>
          <Button
            color="primary"
            variant="link"
            onClick={() => {
              openSub(key, item);
            }}
          >
            {t('node-manager.cloudregion.Configuration.subconfiguration')}
          </Button>
        </div>
      ),
    },
  ];

  return {
    columns,
  };
};
