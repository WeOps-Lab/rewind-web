'use client';
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { Spin, Button, Form, Select, Input, Segmented } from 'antd';
import type { FormInstance } from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import {
  ModalRef,
  SegmentedItem,
  TableDataItem,
} from '@/app/node-manager/types';
import {
  ControllerInstallFields,
  ControllerInstallProps,
} from '@/app/node-manager/types/cloudregion';
import controllerInstallSyle from './index.module.scss';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';
import {
  useInstallWays,
  OPERATE_SYSTEMS,
} from '@/app/node-manager/constants/cloudregion';
import CustomTable from '@/components/custom-table';
import BatchEditModal from './batchEditModal';
import {
  EditOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import { cloneDeep, uniqueId } from 'lodash';
const { Option } = Select;
import useApiCloudRegion from '@/app/node-manager/api/cloudregion';
import useCloudId from '@/app/node-manager/hooks/useCloudid';
import ControllerTable from './controllerTable';

const INFO_ITEM = {
  ip: null,
  system: null,
  group: null,
  port: null,
  account: null,
  password: null,
};

const StrategyOperation: React.FC<ControllerInstallProps> = ({ cancel }) => {
  const { t } = useTranslation();
  const { isLoading } = useApiClient();
  const { getnodelist } = useApiCloudRegion();
  const cloudId = useCloudId();
  const searchParams = useSearchParams();
  const [form] = Form.useForm();
  const instRef = useRef<ModalRef>(null);
  const tableFormRef = useRef<FormInstance>(null);
  const name = searchParams.get('name') || '';
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [installMethod, setInstallMethod] = useState<string>('remoteInstall');
  const [showInstallTable, setShowInstallTable] = useState<boolean>(false);
  const [nodeList, setNodeList] = useState<TableDataItem[]>([]);
  const [sidecarVersionList, setSidecarVersionList] = useState<TableDataItem[]>(
    []
  );
  const [excutorVersionList, setExcutorVersionList] = useState<TableDataItem[]>(
    []
  );
  const [groupList, setGroupList] = useState<SegmentedItem[]>([]);
  const [tableData, setTableData] = useState<TableDataItem[]>([
    {
      ...cloneDeep(INFO_ITEM),
      id: '0',
    },
  ]);
  const currentTableData = useRef<TableDataItem[]>([
    {
      ...cloneDeep(INFO_ITEM),
      id: '0',
    },
  ]);
  const installWays = useInstallWays();

  const tableColumns = useMemo(() => {
    const columns: any = [
      {
        title: t('node-manager.cloudregion.node.ipAdrress'),
        dataIndex: 'ip',
        width: 100,
        key: 'ip',
        render: (value: string, row: TableDataItem) => {
          return (
            <>
              <Form.Item name={`ip-${row.id}`}>
                <Input onBlur={(e) => handleInputBlur(e, row, 'ip')}></Input>
              </Form.Item>
            </>
          );
        },
      },
      {
        title: (
          <>
            {t('node-manager.cloudregion.node.operateSystem')}
            <EditOutlined
              className="cursor-pointer ml-[10px] text-[var(--color-primary)]"
              onClick={() => batchEditModal('system')}
            />
          </>
        ),
        dataIndex: 'system',
        width: 100,
        key: 'system',
        ellipsis: true,
        render: (value: string, row: TableDataItem) => {
          return (
            <>
              <Form.Item name={`system-${row.id}`}>
                <Select
                  value={row.system}
                  onChange={(system) =>
                    handleSelectChange(system, row, 'system')
                  }
                >
                  {OPERATE_SYSTEMS.map((item) => (
                    <Option value={item.value} key={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          );
        },
      },
      {
        title: (
          <>
            {t('node-manager.cloudregion.node.organaziton')}
            <EditOutlined
              className="cursor-pointer ml-[10px] text-[var(--color-primary)]"
              onClick={() => batchEditModal('group')}
            />
          </>
        ),
        dataIndex: 'group',
        width: 100,
        key: 'group',
        render: (value: string, row: TableDataItem) => {
          return (
            <>
              <Form.Item name={`group-${row.id}`}>
                <Select
                  value={row.group}
                  onChange={(group) => handleSelectChange(group, row, 'group')}
                >
                  {groupList.map((item) => (
                    <Option value={item.value} key={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          );
        },
      },
      {
        title: (
          <>
            {t('node-manager.cloudregion.node.loginPort')}
            <EditOutlined
              className="cursor-pointer ml-[10px] text-[var(--color-primary)]"
              onClick={() => batchEditModal('port')}
            />
          </>
        ),
        dataIndex: 'port',
        width: 100,
        key: 'port',
        render: (value: string, row: TableDataItem) => {
          return (
            <>
              <Form.Item name={`port-${row.id}`}>
                <Input onBlur={(e) => handleInputBlur(e, row, 'port')}></Input>
              </Form.Item>
            </>
          );
        },
      },
      {
        title: (
          <>
            {t('node-manager.cloudregion.node.loginAccount')}
            <EditOutlined
              className="cursor-pointer ml-[10px] text-[var(--color-primary)]"
              onClick={() => batchEditModal('account')}
            />
          </>
        ),
        dataIndex: 'account',
        width: 100,
        key: 'account',
        render: (value: string, row: TableDataItem) => {
          return (
            <>
              <Form.Item name={`account-${row.id}`}>
                <Input
                  onBlur={(e) => handleInputBlur(e, row, 'account')}
                ></Input>
              </Form.Item>
            </>
          );
        },
      },
      {
        title: (
          <>
            {t('node-manager.cloudregion.node.loginPassword')}
            <EditOutlined
              className="cursor-pointer ml-[10px] text-[var(--color-primary)]"
              onClick={() => batchEditModal('password')}
            />
          </>
        ),
        dataIndex: 'password',
        width: 100,
        key: 'password',
        render: (value: string, row: TableDataItem) => {
          return (
            <>
              <Form.Item name={`password-${row.id}`}>
                <Input.Password
                  onBlur={(e) => handleInputBlur(e, row, 'password')}
                ></Input.Password>
              </Form.Item>
            </>
          );
        },
      },
      {
        title: '',
        dataIndex: 'action',
        width: 60,
        fixed: 'right',
        key: 'action',
        render: (value: string, row: TableDataItem, index: number) => {
          return (
            <>
              <Button
                type="link"
                icon={<PlusCircleOutlined />}
                onClick={() => addInfoItem(index)}
              ></Button>
              {!!index && (
                <Button
                  type="link"
                  icon={<MinusCircleOutlined />}
                  onClick={() => deleteInfoItem(row)}
                ></Button>
              )}
            </>
          );
        },
      },
    ];
    return installMethod === 'remoteInstall'
      ? columns
      : [...columns.slice(0, 3), columns[columns.length - 1]];
  }, [installMethod]);

  const isRemote = useMemo(() => {
    return installMethod === 'remoteInstall';
  }, [installMethod]);

  useEffect(() => {
    if (!isLoading) {
      getNodeList();
      setSidecarVersionList([{ id: '1', name: 'version1' }]);
      setExcutorVersionList([{ id: '1', name: 'version1' }]);
      setGroupList([
        {
          label: '超管',
          value: 'admin',
        },
      ]);
    }
  }, [isLoading]);

  useEffect(() => {
    form.resetFields();
  }, [name]);

  useEffect(() => {
    if (tableData?.length && tableFormRef.current) {
      const obj = tableFormRef.current.getFieldsValue() || {};
      setTimeout(() => {
        tableFormRef.current?.setFieldsValue(cloneDeep(obj));
      });
    }
  }, [tableData]);

  const handleBatchEdit = useCallback(
    (row: TableDataItem) => {
      const data = cloneDeep(currentTableData.current);
      const obj: any = {};
      data.forEach((item) => {
        item[row.field] = row.value;
        obj[`${row.field}-${item.id}`] = row.value;
      });
      tableFormRef.current?.setFieldsValue(obj);
      currentTableData.current = data;
      setTableData(data);
    },
    [currentTableData]
  );

  const batchEditModal = (field: string) => {
    instRef.current?.showModal({
      title: t('common.bulkEdit'),
      type: field,
      form: {},
    });
  };

  const changeCollectType = (id: string) => {
    setInstallMethod(id);
  };

  const addInfoItem = (index: number) => {
    const data = cloneDeep(currentTableData.current);
    data.splice(index + 1, 0, {
      ...cloneDeep(INFO_ITEM),
      id: uniqueId(),
    });
    currentTableData.current = data;
    setTableData(data);
  };

  const deleteInfoItem = (row: TableDataItem) => {
    const data = cloneDeep(currentTableData.current);
    const index = data.findIndex((item) => item.id === row.id);
    if (index != -1) {
      data.splice(index, 1);
      currentTableData.current = data;
      setTableData(data);
    }
  };

  const handleInputBlur = (
    e: React.ChangeEvent<HTMLInputElement>,
    row: TableDataItem,
    key: string
  ) => {
    const data = cloneDeep(currentTableData.current);
    const index = data.findIndex((item) => item.id === row.id);
    if (index !== -1) {
      data[index][key] = e.target.value;
      currentTableData.current = data;
    }
  };

  const handleSelectChange = (
    value: string,
    row: TableDataItem,
    key: string
  ) => {
    const data = cloneDeep(currentTableData.current);
    const index = data.findIndex((item) => item.id === row.id);
    if (index !== -1) {
      data[index][key] = value;
      currentTableData.current = data;
      setTableData(data);
    }
  };

  const getNodeList = async () => {
    try {
      setPageLoading(true);
      const data = await getnodelist({ cloud_region_id: Number(cloudId) });
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

  const validateTableData = async () => {
    let data = cloneDeep(currentTableData.current);
    if (installMethod === 'manualInstall') {
      data = data.map((item) => ({
        ip: item.ip,
        system: item.system,
        group: item.group,
      }));
    }
    if (data.every((item) => Object.values(item).every((tex) => !!tex))) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(t('common.valueValidate')));
  };

  const goBack = () => {
    cancel();
  };

  const handleCreate = () => {
    setConfirmLoading(false);
    form.validateFields().then((values) => {
      console.log(values);
      setShowInstallTable(true);
    });
  };

  const cancelInstall = useCallback(() => {
    goBack();
  }, []);

  return (
    <Spin spinning={pageLoading} className="w-full">
      {showInstallTable ? (
        <ControllerTable
          config={{
            type: installMethod,
            sidecarVersionList,
            excutorVersionList,
          }}
          cancel={cancelInstall}
        ></ControllerTable>
      ) : (
        <div className={controllerInstallSyle.controllerInstall}>
          <div className={controllerInstallSyle.title}>
            <ArrowLeftOutlined
              className="text-[var(--color-primary)] text-[20px] cursor-pointer mr-[10px]"
              onClick={goBack}
            />
            <span>{t('node-manager.cloudregion.node.installController')}</span>
          </div>
          <div className={controllerInstallSyle.form}>
            <Form form={form} name="basic" layout="vertical">
              <Form.Item<ControllerInstallFields>
                required
                label={t('node-manager.cloudregion.node.installationMethod')}
              >
                <Form.Item name="install" noStyle>
                  <Segmented
                    options={installWays}
                    value={installMethod}
                    onChange={changeCollectType}
                  />
                </Form.Item>
                <div className={controllerInstallSyle.description}>
                  {t('node-manager.cloudregion.node.installWayDes')}
                </div>
              </Form.Item>
              {isRemote && (
                <>
                  <Form.Item<ControllerInstallFields>
                    required
                    label={t('node-manager.cloudregion.node.defaultNode')}
                  >
                    <Form.Item
                      name="node_id"
                      noStyle
                      rules={[
                        { required: true, message: t('common.required') },
                      ]}
                    >
                      <Select
                        style={{
                          width: 300,
                        }}
                        showSearch
                        allowClear
                        placeholder={t('common.pleaseSelect')}
                      >
                        {nodeList.map((item) => (
                          <Option value={item.id} key={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <div className={controllerInstallSyle.description}>
                      {t('node-manager.cloudregion.node.defaultNodeDes')}
                    </div>
                  </Form.Item>
                  <Form.Item<ControllerInstallFields>
                    required
                    label={t('node-manager.cloudregion.node.sidecarVersion')}
                  >
                    <Form.Item
                      name="sidecar_version"
                      noStyle
                      rules={[
                        { required: true, message: t('common.required') },
                      ]}
                    >
                      <Select
                        style={{
                          width: 300,
                        }}
                        showSearch
                        allowClear
                        placeholder={t('common.pleaseSelect')}
                      >
                        {sidecarVersionList.map((item) => (
                          <Option value={item.id} key={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <div className={controllerInstallSyle.description}>
                      {t('node-manager.cloudregion.node.sidecarVersionDes')}
                    </div>
                  </Form.Item>
                  <Form.Item<ControllerInstallFields>
                    required
                    label={t('node-manager.cloudregion.node.executorVersion')}
                  >
                    <Form.Item
                      name="executor_version"
                      noStyle
                      rules={[
                        { required: true, message: t('common.required') },
                      ]}
                    >
                      <Select
                        style={{
                          width: 300,
                        }}
                        showSearch
                        allowClear
                        placeholder={t('common.pleaseSelect')}
                      >
                        {excutorVersionList.map((item) => (
                          <Option value={item.id} key={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <div className={controllerInstallSyle.description}>
                      {t('node-manager.cloudregion.node.executorVersionDes')}
                    </div>
                  </Form.Item>
                </>
              )}
              <Form.Item<ControllerInstallFields>
                name="install_type"
                label={t('node-manager.cloudregion.node.installInfo')}
                rules={[{ required: true, validator: validateTableData }]}
              >
                <Form ref={tableFormRef} component={false}>
                  <CustomTable
                    rowKey="id"
                    columns={tableColumns}
                    dataSource={tableData}
                  />
                </Form>
              </Form.Item>
            </Form>
          </div>
          <div className={controllerInstallSyle.footer}>
            <Button
              type="primary"
              className="mr-[10px]"
              loading={confirmLoading}
              onClick={handleCreate}
            >
              {`${t('node-manager.cloudregion.node.toInstall')} (${tableData.length})`}
            </Button>
            <Button onClick={goBack}>{t('common.cancel')}</Button>
          </div>
        </div>
      )}
      <BatchEditModal
        ref={instRef}
        config={{
          systemList: OPERATE_SYSTEMS,
          groupList,
        }}
        onSuccess={handleBatchEdit}
      />
    </Spin>
  );
};

export default StrategyOperation;
