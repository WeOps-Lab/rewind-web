import { useTranslation } from '@/utils/i18n';
import { Button, Popconfirm } from 'antd';
import type { TableColumnsType } from 'antd';
import { ConfigHookParams } from '@/app/node-manager/types/cloudregion';
import { TableDataItem } from '@/app/node-manager/types/index';
import useApiCloudRegion from '@/app/node-manager/api/cloudregion';
export const useConfigColumns = ({
  configurationClick,
  applyconfigurationClick,
  onDelSuccess,
}: ConfigHookParams) => {
  const { t } = useTranslation();
  const { deletecollector } = useApiCloudRegion();
  const columns: TableColumnsType<TableDataItem> = [
    {
      title: t('node-manager.cloudregion.Configuration.name'),
      dataIndex: 'name',
      fixed: 'left',
      width: 300,
      render: (text: string) => <p>{text}</p>,
    },
    {
      title: t('node-manager.cloudregion.Configuration.collector'),
      dataIndex: 'collector',
      width: 150,
    },
    {
      title: t('node-manager.cloudregion.Configuration.system'),
      dataIndex: 'operatingsystem',
      width: 150,
    },
    {
      title: t('node-manager.cloudregion.Configuration.count'),
      dataIndex: 'nodecount',
      width: 150,
    },
    {
      title: t('common.actions'),
      dataIndex: 'key',
      fixed: 'right',
      width: 180,
      render: (key, item) => (
        <div className="flex">
          <Button
            color="primary"
            variant="link"
            onClick={() => {
              applyconfigurationClick(key, item.operatingsystem, item.nodes);
            }}
          >
            {t('common.apply')}
          </Button>
          <Button
            color="primary"
            variant="link"
            onClick={() => {
              configurationClick(key);
            }}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('node-manager.cloudregion.Configuration.deltitle')}
            description={t('node-manager.cloudregion.Configuration.deleteinfo')}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
            onConfirm={() => {
              deleteconfirm(key);
            }}
          >
            <Button disabled={item.nodecount} color="primary" variant="link">
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  //删除的确定的弹窗(删除单个配置接口实现)
  const deleteconfirm = (key: any) => {
    deletecollector(key);
    onDelSuccess();
  };

  return {
    columns,
  };
};
