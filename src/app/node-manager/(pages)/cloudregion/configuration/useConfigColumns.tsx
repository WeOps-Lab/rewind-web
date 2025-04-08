import { useTranslation } from '@/utils/i18n';
import { Button } from 'antd';
import type { TableColumnsType } from 'antd';
import { ConfigHookParams } from '@/app/node-manager/types/cloudregion';
import { TableDataItem } from '@/app/node-manager/types/index';
// import useApiCloudRegion from '@/app/node-manager/api/cloudregion';
export const useConfigColumns = ({
  configurationClick,
  // applyconfigurationClick,
  // onDelSuccess,
  openSub
}: ConfigHookParams) => {
  const { t } = useTranslation();
  // const { deletecollector } = useApiCloudRegion();
  const columns: TableColumnsType<TableDataItem> = [
    {
      title: t('common.name'),
      dataIndex: 'name',
      fixed: 'left',
      width: 300,
      render: (text: string) => <p>{text}</p>,
    },
    // {
    //   title: t('node-manager.cloudregion.Configuration.collector'),
    //   dataIndex: 'collector',
    //   width: 150,
    // },
    // {
    //   title: t('node-manager.cloudregion.Configuration.system'),
    //   dataIndex: 'operatingsystem',
    //   width: 150,
    // },
    // {
    //   title: t('node-manager.cloudregion.Configuration.count'),
    //   dataIndex: 'nodecount',
    //   width: 150,
    // },
    {
      title: t('node-manager.cloudregion.node.node'),
      dataIndex: 'nodes',
      width: 150,
      render: (text: string) => <p>{text}</p>,
    },
    {
      title: t('node-manager.cloudregion.Configuration.sidecar'),
      dataIndex: 'sidecar',
      align: 'center',
      filters:[
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
      onFilter: (value,record) => record?.sidecar === value,
      render: (text: string) => <p>{text}</p>,
    },
    {
      title: t('common.actions'),
      dataIndex: 'key',
      fixed: 'right',
      align: 'center',
      width: 180,
      render: (key,item) => (
        <div className="flex justify-center">
          <Button
            color="primary"
            variant="link"
            onClick={() => {
              configurationClick(key);
              // applyconfigurationClick(key, item.operatingsystem, item.nodes);
            }}
          >
            {t('common.edit')}
          </Button>
          <Button
            color="primary"
            variant="link"
            onClick={() => {
              // configurationClick(key);
              openSub(key,item);
            }}
          >
            {t('node-manager.cloudregion.Configuration.subconfiguration')}
          </Button>
          {/* <Popconfirm
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
          </Popconfirm> */}
        </div>
      ),
    },
  ];

  //删除的确定的弹窗(删除单个配置接口实现)
  // const deleteconfirm = (key: any) => {
  //   deletecollector(key);
  //   onDelSuccess();
  // };

  return {
    columns,
  };
};
