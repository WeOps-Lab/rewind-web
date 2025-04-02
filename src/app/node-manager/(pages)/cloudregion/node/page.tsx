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
  const [searchText, setSearchText] = useState<string>('');
  const [showInstallController, setShowInstallController] =
    useState<boolean>(false);
  const [system, setSystem] = useState<string>('windows');
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
      getNodes();
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
            getNodes();
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
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const getCheckboxProps = () => {
    return {
      disabled: false,
    };
  };

  const rowSelection: TableRowSelection<TableDataItem> = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: getCheckboxProps,
  };

  const onSearch: SearchProps['onSearch'] = (value) => {
    setSearchText(value);
    const params = getParams();
    params.name = value;
    getNodes(params);
  };

  const getParams = () => {
    return {
      name: searchText,
      operating_system: system,
      cloud_region_id: Number(cloudid),
    };
  };

  const getNodes = async (params?: {
    name?: string;
    operating_system?: string;
    cloud_region_id?: number;
  }) => {
    setLoading(true);
    const res = await getnodelist(params || getParams());
    const data = res.map((item: TableDataItem) => ({
      ...item,
      key: item.id,
      sidecar: 'Running',
      nas_excutor: 'Running',
    }));
    setLoading(false);
    setNodelist(data);
  };

  const handleCollectorSuccess = async () => {
    getNodes();
  };

  const handleInstallController = () => {
    setShowNodeTable(false);
    setShowInstallController(true);
  };

  const onSystemChange = (id: string) => {
    setSystem(id);
    const params = getParams();
    params.operating_system = id;
    getNodes(params);
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
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={onSearch}
                />
                <ReloadOutlined
                  className="mr-[8px]"
                  onClick={() => getNodes()}
                />
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
