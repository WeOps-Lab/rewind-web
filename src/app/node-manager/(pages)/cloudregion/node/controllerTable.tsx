'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Spin, Button, Modal } from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { ModalRef, TableDataItem } from '@/app/node-manager/types';
import { ControllerInstallProps } from '@/app/node-manager/types/cloudregion';
import controllerInstallSyle from './index.module.scss';
import { ArrowLeftOutlined } from '@ant-design/icons';
import {
  OPERATE_SYSTEMS,
  useInstallMap,
} from '@/app/node-manager/constants/cloudregion';
import CustomTable from '@/components/custom-table';
import { cloneDeep } from 'lodash';
import useApiCloudRegion from '@/app/node-manager/api/cloudregion';
import useCloudId from '@/app/node-manager/hooks/useCloudid';
import InstallGuidance from './installGuidance';
const { confirm } = Modal;

const INFO_ITEM = {
  ip: null,
  system: null,
  group: null,
  nas_excutor: 'failed',
  sidecar: 'installing',
};

const ControllerTable: React.FC<ControllerInstallProps> = ({
  cancel,
  config,
}) => {
  const { t } = useTranslation();
  const { isLoading } = useApiClient();
  const { getnodelist } = useApiCloudRegion();
  const cloudId = useCloudId();
  const guidance = useRef<ModalRef>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [nodeList, setNodeList] = useState<TableDataItem[]>([
    {
      id: 1,
      name: '123',
    },
  ]);
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const installMay = useInstallMap();

  const isRemote = useMemo(() => {
    return config?.type === 'remoteInstall';
  }, [config]);

  const tableColumns = useMemo(() => {
    const columns: any = [
      {
        title: t('node-manager.cloudregion.node.ipAdrress'),
        dataIndex: 'ip',
        width: 100,
        key: 'ip',
        ellipsis: true,
        render: (value: string, row: TableDataItem) => {
          return <>{row.ip || '--'}</>;
        },
      },
      {
        title: t('node-manager.cloudregion.node.operateSystem'),
        dataIndex: 'system',
        width: 100,
        key: 'system',
        ellipsis: true,
        render: (value: string) => {
          return (
            <>
              {OPERATE_SYSTEMS.find((item) => item.value === value)?.label ||
                '--'}
            </>
          );
        },
      },
      {
        title: t('node-manager.cloudregion.node.organaziton'),
        dataIndex: 'group',
        width: 100,
        key: 'group',
        ellipsis: true,
        render: (value: string) => {
          return <>{value || '--'}</>;
        },
      },
      {
        title: 'Sidecar',
        dataIndex: 'sidecar',
        width: 100,
        key: 'sidecar',
        ellipsis: true,
        render: (value: string) => {
          return (
            <span
              style={{
                color: installMay[value]?.color || 'var(--ant-color-text)',
              }}
            >
              {installMay[value]?.text || '--'}
            </span>
          );
        },
      },
      {
        title: 'Nas Excutor',
        dataIndex: 'nas_excutor',
        width: 100,
        key: 'nas_excutor',
        ellipsis: true,
        render: (value: string) => {
          return (
            <span
              style={{
                color: installMay[value]?.color || 'var(--ant-color-text)',
              }}
            >
              {installMay[value]?.text || '--'}
            </span>
          );
        },
      },
      {
        title: '',
        dataIndex: 'action',
        width: 60,
        fixed: 'right',
        key: 'action',
        render: (value: string, row: TableDataItem) => {
          return (
            <>
              {isRemote ? (
                <Button
                  type="link"
                  disabled={
                    row.nas_excutor !== 'failed' && row.sidecar !== 'failed'
                  }
                  onClick={() => checkDetail('remoteInstall')}
                >
                  {t('node-manager.cloudregion.node.viewLog')}
                </Button>
              ) : (
                <Button
                  type="link"
                  onClick={() => checkDetail('manualInstall')}
                >
                  {t('node-manager.cloudregion.node.viewGuide')}
                </Button>
              )}
            </>
          );
        },
      },
    ];
    return columns;
  }, [isRemote]);

  useEffect(() => {
    if (!isLoading) {
      getNodeList();
      setTableData([
        {
          ...cloneDeep(INFO_ITEM),
          id: '0',
        },
      ]);
      console.log(nodeList);
    }
  }, [isLoading]);

  const checkDetail = (type: string) => {
    guidance.current?.showModal({
      title: t(
        `node-manager.cloudregion.node.${isRemote ? 'log' : 'installationGuide'}`
      ),
      type,
      form: {},
    });
  };

  const getNodeList = async () => {
    try {
      setPageLoading(true);
      const data = await getnodelist(cloudId as any, '');
      if (!data.length) {
        setNodeList([
          {
            id: 1,
            name: '123',
          },
        ]);
      }
    } finally {
      setPageLoading(false);
    }
  };

  const goBack = () => {
    confirm({
      title: t('common.prompt'),
      content: t('node-manager.cloudregion.node.installingTips'),
      centered: true,
      onOk() {
        cancel();
      },
    });
  };

  return (
    <Spin spinning={pageLoading} className="w-full">
      <div className={controllerInstallSyle.controllerInstall}>
        <div className={controllerInstallSyle.title}>
          <ArrowLeftOutlined
            className="text-[var(--color-primary)] text-[20px] cursor-pointer mr-[10px]"
            onClick={goBack}
          />
          <span>
            {t(
              `node-manager.cloudregion.node.${isRemote ? 'autoInstall' : 'manuallyInstall'}`
            )}
          </span>
        </div>
        <div className={controllerInstallSyle.table}>
          <CustomTable
            rowKey="id"
            columns={tableColumns}
            dataSource={tableData}
          />
        </div>
      </div>
      <InstallGuidance
        ref={guidance}
        sidecarVersionList={config.sidecarVersionList || []}
        excutorVersionList={config.excutorVersionList || []}
      />
    </Spin>
  );
};

export default ControllerTable;
