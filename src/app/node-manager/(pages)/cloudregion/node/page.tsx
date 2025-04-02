'use client';
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { Button, Input, message, Space, Modal } from 'antd';
import { DownOutlined, ReloadOutlined } from '@ant-design/icons';
import type { MenuProps, TableProps } from 'antd';
import nodeStyle from './index.module.scss';
import { Dropdown, Segmented } from 'antd';
import CollectorModal from './collectorModal';
import { useTranslation } from '@/utils/i18n';
import type { GetProps } from 'antd';
import { ModalRef, TableDataItem } from '@/app/node-manager/types/index';
import CustomTable from '@/components/custom-table/index';
import { useColumns } from '@/app/node-manager/hooks/node';
import Mainlayout from '../mainlayout/layout';
import useApiClient from '@/utils/request';
import useApiCloudRegion from '@/app/node-manager/api/cloudregion';
import useCloudId from '@/app/node-manager/hooks/useCloudid';
import ControllerInstall from './controllerInstall';
import {
  OPERATE_SYSTEMS,
  useSidecaritems,
  useCollectoritems,
} from '@/app/node-manager/constants/cloudregion';
const { confirm } = Modal;
const { Search } = Input;

type TableRowSelection<T extends object = object> =
  TableProps<T>['rowSelection'];
type SearchProps = GetProps<typeof Input.Search>;

const Node = () => {
  const collectorRef = useRef<ModalRef>(null);
  const { t } = useTranslation();
  const cloudid = useCloudId();
  const { isLoading, del } = useApiClient();
  const { getnodelist } = useApiCloudRegion();
  const [nodelist, setNodelist] = useState<TableDataItem[]>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showNodeTable, setShowNodeTable] = useState<boolean>(true);
  const [showInstallController, setShowInstallController] =
    useState<boolean>(false);
  const [system, setSystem] = useState<string>('Windows');
  const checkConfig = (row: TableDataItem) => {
    console.log(row);
  };
  const columns = useColumns({ checkConfig });
  const sidecaritems = useSidecaritems();
  const collectoritems = useCollectoritems();

  const cancelInstall = useCallback(() => {
    setShowNodeTable(true);
    setShowInstallController(false);
  }, []);

  const enableOperateSideCar = useMemo(() => {
    if (!selectedRowKeys.length) return true;
    const list = (nodelist || []).filter((item) =>
      selectedRowKeys.includes(item.key)
    );
    return list.some((item) => item.nas_excutor !== 'Running');
  }, [selectedRowKeys, nodelist]);

  const enableOperateCollecter = useMemo(() => {
    if (!selectedRowKeys.length) return true;
    const list = (nodelist || []).filter((item) =>
      selectedRowKeys.includes(item.key)
    );
    return list.some(
      (item) => item.nas_excutor !== 'Running' || item.sidecar !== 'Running'
    );
  }, [selectedRowKeys, nodelist]);

  useEffect(() => {
    if (!isLoading) {
      getNodelist();
    }
  }, [isLoading]);

  const handleSidecarMenuClick: MenuProps['onClick'] = (e) => {
    confirm({
      title: t('common.prompt'),
      content: t(`node-manager.cloudregion.node.${e.key}Tips`),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          const params = JSON.stringify(selectedRowKeys);
          try {
            await del(`/monitor/api/monitor_policy/${params}/`);
            message.success(t('common.operationSuccessful'));
            getNodelist();
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const handleCollectorMenuClick: MenuProps['onClick'] = (e) => {
    collectorRef.current?.showModal({
      type: e.key,
      ids: selectedRowKeys as string[],
      selectedsystem: '',
    });
  };

  const SidecarmenuProps = {
    items: sidecaritems,
    onClick: handleSidecarMenuClick,
  };

  const CollectormenuProps = {
    items: collectoritems,
    onClick: handleCollectorMenuClick,
  };

  //选择相同的系统节点，判断是否禁用按钮
  const onSelectChange = (
    newSelectedRowKeys: React.Key[],
    selectedRows: TableDataItem[]
  ) => {
    console.log(selectedRows);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const getCheckboxProps = (record: TableDataItem) => {
    return {
      disabled: record ? false : true,
    };
  };

  const rowSelection: TableRowSelection<TableDataItem> = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: getCheckboxProps,
  };

  const onSearch: SearchProps['onSearch'] = (value) => {
    getNodelist(value);
  };

  const updatenodelist = async () => {
    setLoading(true);

    try {
      // 获取节点数据
      const res = await getnodelist(Number(cloudid));
      const newNodeList = res.map((item: any) => ({
        key: item.id,
        ip: item.ip,
        operatingsystem:
          item.operating_system.charAt(0).toUpperCase() +
          item.operating_system.slice(1),
        sidecar: !item.status?.status ? 'Running' : 'Error',
        message: item.status.message,
      }));
      setNodelist(newNodeList);
    } catch (error) {
      console.error('Failed to update node list', error);
    } finally {
      setLoading(false); // 无论上述情况是否默认执行完成，此行均应恢复原逻辑状态置
    }
  };

  const getNodelist = async (search?: string) => {
    setLoading(true);
    const res = await getnodelist(Number(cloudid));
    console.log(res, search);
    setLoading(false);
    setNodelist([
      //   {
      //     key: 1,
      //     ip: '10.10.22',
      //     operatingsystem: 'Windows',
      //     sidecar: 'Running',
      //     nas_excutor: 'Error',
      //     message: '123',
      //   },
      //   {
      //     key: 2,
      //     ip: '10.10.22',
      //     operatingsystem: 'Windows',
      //     sidecar: 'Running',
      //     nas_excutor: 'Running',
      //     message: '123',
      //   },
      //   {
      //     key: 3,
      //     ip: '10.10.22',
      //     operatingsystem: 'Windows',
      //     sidecar: 'Error',
      //     nas_excutor: 'Running',
      //     message: '123',
      //   },
    ]);
  };

  const handleCollectorSuccess = async () => {
    // 更新 table 的普通数据（主列表数据）
    await getNodelist();
    // 收集已经展开行的 key，再次更新这些展开行的数据

    const res = await getnodelist(Number(cloudid));
    console.log(res);
  };

  const handleInstallController = () => {
    setShowNodeTable(false);
    setShowInstallController(true);
  };

  const onSystemChange = (id: string) => {
    setSystem(id);
    getNodelist();
  };

  return (
    <Mainlayout>
      {showNodeTable && (
        <div className={`${nodeStyle.node} w-full h-full`}>
          <div className="overflow-hidden">
            <div className="flex justify-between w-full overflow-y-hidden mb-4">
              <Segmented
                options={OPERATE_SYSTEMS}
                value={system}
                onChange={onSystemChange}
              />
              <div>
                <Search
                  className="w-64 mr-[8px]"
                  placeholder={t('common.search')}
                  enterButton
                  onSearch={onSearch}
                />
                <ReloadOutlined className="mr-[8px]" onClick={updatenodelist} />
                <Button
                  type="primary"
                  className="mr-[8px]"
                  onClick={handleInstallController}
                >
                  {t('node-manager.cloudregion.node.installController')}
                </Button>
                <Dropdown
                  className="mr-[8px]"
                  menu={SidecarmenuProps}
                  disabled={enableOperateSideCar}
                >
                  <Button>
                    <Space>
                      {t('node-manager.cloudregion.node.sidecar')}
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
                <Dropdown
                  className="mr-[8px]"
                  menu={CollectormenuProps}
                  disabled={enableOperateCollecter}
                >
                  <Button>
                    <Space>
                      {t('node-manager.cloudregion.node.collector')}
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </div>
            </div>
            <div className="tablewidth">
              <CustomTable
                columns={columns}
                loading={loading}
                dataSource={nodelist}
                scroll={{ y: 'calc(100vh - 400px)', x: 'calc(100vw - 300px)' }}
                rowSelection={rowSelection}
              />
            </div>
            <CollectorModal
              ref={collectorRef}
              onSuccess={() => {
                handleCollectorSuccess();
              }}
            ></CollectorModal>
          </div>
        </div>
      )}
      {showInstallController && <ControllerInstall cancel={cancelInstall} />}
    </Mainlayout>
  );
};

export default Node;
