import { useMemo } from 'react';
import { useTranslation } from '@/utils/i18n';
import { Tag, Tooltip, Button } from 'antd';
import type { TableColumnsType } from 'antd';
import { TableDataItem } from '@/app/node-manager/types/index';
import { useTelegrafMap } from '@/app/node-manager/constants/cloudregion';

interface HookParams {
  checkConfig: (row: TableDataItem) => void;
}

export const useColumns = ({
  checkConfig,
}: HookParams): TableColumnsType<TableDataItem> => {
  const { t } = useTranslation();
  const statusMap = useTelegrafMap();

  const columns = useMemo(
    (): TableColumnsType<TableDataItem> => [
      {
        title: t('node-manager.cloudregion.node.ip'),
        dataIndex: 'ip',
        key: 'ip',
      },
      {
        title: t('node-manager.cloudregion.node.system'),
        dataIndex: 'operating_system',
      },
      {
        title: 'Sidecar',
        dataIndex: 'sidecar',
        render: (key: string, item) => {
          return (
            <Tooltip title={`${item.message}`}>
              <Tag
                bordered={false}
                color={key === 'Running' ? 'success' : 'error'}
              >
                {key}
              </Tag>
            </Tooltip>
          );
        },
      },
      {
        title: 'Nas Excutor',
        dataIndex: 'nas_excutor',
        // filters: [
        //   {
        //     text: 'Running',
        //     value: 'Running',
        //   },
        //   {
        //     text: 'Error',
        //     value: 'Error',
        //   },
        // ],
        onFilter: (value, record) => record.sidecar.includes(value),
        render: (key: string, item) => {
          return (
            <Tooltip title={`${item.message}`}>
              <Tag
                bordered={false}
                color={key === 'Running' ? 'success' : 'error'}
              >
                {key || '--'}
              </Tag>
            </Tooltip>
          );
        },
      },
      {
        title: 'Telegraf',
        dataIndex: 'telegraf',
        render: (key: string, item) => {
          return (
            <div>
              <span
                className="recordStatus"
                style={{
                  backgroundColor: statusMap[item.status]?.color || '#b2b5bd',
                }}
              ></span>
              <span
                style={{ color: statusMap[item.status]?.color || '#b2b5bd' }}
              >
                {statusMap[item.status]?.text || '--'}
              </span>
            </div>
          );
        },
      },
      {
        key: 'action',
        dataIndex: 'action',
        fixed: 'right',
        width: 140,
        render: (key, item) => (
          <Button type="link" onClick={() => checkConfig(item)}>
            {t('node-manager.cloudregion.node.checkConfig')}
          </Button>
        ),
      },
    ],
    [checkConfig, statusMap, t]
  );

  return columns;
};
