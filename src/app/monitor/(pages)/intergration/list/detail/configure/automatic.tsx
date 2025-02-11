import React, { useState, useRef, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  message,
  Checkbox,
  Space,
  InputNumber,
} from 'antd';
import { useTranslation } from '@/utils/i18n';
import CustomTable from '@/components/custom-table';
import { v4 as uuidv4 } from 'uuid';
import { deepClone } from '@/app/monitor/utils/common';
import {
  TIMEOUT_UNITS,
  COLLECT_TYPE_MAP,
  INSTANCE_TYPE_MAP,
  CONFIG_TYPE_MAP,
} from '@/app/monitor/constants/monitor';
import { EditOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import useApiClient from '@/utils/request';
import { useCommon } from '@/app/monitor/context/common';
import { Organization, ListItem } from '@/app/monitor/types';
import { useUserInfoContext } from '@/context/userInfo';

const { Option } = Select;

interface MonitoredObject {
  key: string;
  node_ids: string | string[] | null;
  instance_name?: string | null;
  group_ids: string[];
  url?: string | null;
  ip?: string | null;
  instance_id?: string;
  instance_type?: string;
}

const AutomaticConfiguration: React.FC = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { post, isLoading } = useApiClient();
  const commonContext = useCommon();
  const router = useRouter();
  const userContext = useUserInfoContext();
  const currentGroup = useRef(userContext?.selectedGroup);
  const groupId = [currentGroup?.current?.id || ''];
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList: Organization[] = authList.current;
  const collectTypeId = searchParams.get('collect_type') || '';
  const collectType = COLLECT_TYPE_MAP[collectTypeId];
  const instType = INSTANCE_TYPE_MAP[collectTypeId];
  const configTypes = CONFIG_TYPE_MAP[collectTypeId];
  const objectName = searchParams.get('name') || '';
  const objectId = searchParams.get('id') || '';
  const getInitMonitoredObjectItem = () => {
    const initItem = {
      key: uuidv4(),
      node_ids: null,
      instance_name: null,
      group_ids: groupId,
    };
    if (['web', 'ping'].includes(collectType)) {
      return { ...initItem, url: null };
    }
    if (['snmp', 'ipmi'].includes(collectType)) {
      return { ...initItem, ip: null };
    }
    return initItem as MonitoredObject;
  };
  const authPasswordRef = useRef<any>(null);
  const privPasswordRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const [dataSource, setDataSource] = useState<MonitoredObject[]>([
    getInitMonitoredObjectItem(),
  ]);
  const [authPasswordDisabled, setAuthPasswordDisabled] =
    useState<boolean>(true);
  const [privPasswordDisabled, setPrivPasswordDisabled] =
    useState<boolean>(true);
  const [passwordDisabled, setPasswordDisabled] = useState<boolean>(true);
  const [nodeList, setNodeList] = useState<ListItem[]>([]);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [nodesLoading, setNodesLoading] = useState<boolean>(false);

  const columns: any[] = [
    {
      title: t('monitor.intergrations.node'),
      dataIndex: 'node_ids',
      key: 'node_ids',
      width: 200,
      render: (_: unknown, record: any, index: number) => (
        <Select
          loading={nodesLoading}
          value={record.node_ids}
          onChange={(val) => handleFilterNodeChange(val, index)}
        >
          {getFilterNodes(record.node_ids).map((item) => (
            <Option key={item.id} value={item.id}>
              {item.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: t('monitor.intergrations.node'),
      dataIndex: 'node_ids',
      key: 'node_ids',
      width: 200,
      render: (_: unknown, record: any, index: number) => (
        <Select
          mode="tags"
          maxTagCount="responsive"
          loading={nodesLoading}
          value={record.node_ids}
          onChange={(val) => handleNodeChange(val, index)}
        >
          {nodeList.map((item) => (
            <Option key={item.id} value={item.id}>
              {item.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 200,
      render: (_: unknown, record: any, index: number) => (
        <Input value={record.ip} onChange={(e) => handleIpChange(e, index)} />
      ),
    },
    {
      title: t('monitor.intergrations.url'),
      dataIndex: 'url',
      key: 'url',
      width: 200,
      render: (_: unknown, record: any, index: number) => (
        <Input value={record.url} onChange={(e) => handleUrlChange(e, index)} />
      ),
    },
    {
      title: t('monitor.intergrations.instanceName'),
      dataIndex: 'instance_name',
      key: 'instance_name',
      width: 200,
      render: (_: unknown, record: any, index: number) => (
        <Input
          value={record.instance_name}
          onChange={(e) => handleInstNameChange(e, index)}
        />
      ),
    },
    {
      title: t('common.group'),
      dataIndex: 'group_ids',
      key: 'group_ids',
      width: 200,
      render: (_: unknown, record: any, index: number) => (
        <Select
          mode="tags"
          maxTagCount="responsive"
          value={record.group_ids}
          onChange={(val) => handleGroupChange(val, index)}
        >
          {organizationList.map((item) => (
            <Option key={item.value} value={item.value}>
              {item.label}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: t('common.action'),
      key: 'action',
      dataIndex: 'action',
      width: 160,
      fixed: 'right',
      render: (_: unknown, record: any, index: number) => (
        <>
          <Button
            type="link"
            className="mr-[10px]"
            onClick={() => handleAdd(record.key)}
          >
            {t('common.add')}
          </Button>
          {!['host', 'trap'].includes(collectType) && (
            <Button
              type="link"
              className="mr-[10px]"
              onClick={() => handleCopy(record)}
            >
              {t('common.copy')}
            </Button>
          )}
          {!!index && (
            <Button type="link" onClick={() => handleDelete(record.key)}>
              {t('common.delete')}
            </Button>
          )}
        </>
      ),
    },
  ];

  useEffect(() => {
    if (!authPasswordDisabled && authPasswordRef?.current) {
      authPasswordRef.current.focus();
    }
  }, [authPasswordDisabled]);

  useEffect(() => {
    if (!privPasswordDisabled && privPasswordRef?.current) {
      privPasswordRef.current.focus();
    }
  }, [privPasswordDisabled]);

  useEffect(() => {
    if (!passwordDisabled && passwordRef?.current) {
      passwordRef.current.focus();
    }
  }, [passwordDisabled]);

  useEffect(() => {
    if (isLoading) return;
    getNodeList();
    initData();
  }, [isLoading]);

  const initData = () => {
    if (collectType === 'host') {
      form.setFieldsValue({
        metric_type: configTypes,
      });
    }
    if (collectType === 'ipmi') {
      form.setFieldsValue({
        protocol: 'lanplus',
      });
    }
    if (collectType === 'snmp') {
      form.setFieldsValue({
        port: 161,
        version: 2,
        timeout: 10,
      });
    }
  };

  const getNodeList = async () => {
    setNodesLoading(true);
    try {
      const data = await post('/monitor/api/node_mgmt/nodes/', {
        cloud_region_id: 0,
        page: 1,
        page_size: -1,
      });
      setNodeList(data.nodes || []);
    } finally {
      setNodesLoading(false);
    }
  };

  const getFilterNodes = (id: string) => {
    if (['ipmi', 'snmp'].includes(collectType)) {
      return nodeList;
    }
    const nodeIds = dataSource
      .map((item) => item.node_ids)
      .filter((item) => item !== id);
    const _nodeList = nodeList.filter(
      (item) => !nodeIds.includes(item.id as any)
    );
    return _nodeList;
  };

  const handleAdd = (key: string) => {
    const index = dataSource.findIndex((item) => item.key === key);
    const newData: MonitoredObject = getInitMonitoredObjectItem();
    const updatedData = [...dataSource];
    updatedData.splice(index + 1, 0, newData); // 在当前行下方插入新数据
    setDataSource(updatedData);
  };

  const handleCopy = (row: any) => {
    const index = dataSource.findIndex((item) => item.key === row.key);
    const newData: MonitoredObject = {
      ...row,
      key: uuidv4(), // 每条数据的唯一标识
    };
    const updatedData = [...dataSource];
    updatedData.splice(index + 1, 0, newData); // 在当前行下方插入新数据
    setDataSource(updatedData);
  };

  const handleDelete = (key: string) => {
    setDataSource(dataSource.filter((item) => item.key !== key));
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      // 处理表单提交逻辑
      const _values = deepClone(values);
      delete _values.metric_type;
      delete _values.nodes;
      const params = {
        configs: getConfigs(_values),
        collect_type: collectType,
        monitor_object_id: +objectId,
        instances: dataSource.map((item) => {
          const { key, ...rest } = item;
          values.key = key;
          return {
            ...rest,
            node_ids: [item.node_ids].flat(),
            instance_type: instType,
            instance_id: getInstId(item),
          };
        }),
      };
      addNodesConfig(params);
    });
  };

  const getConfigs = (row: any) => {
    switch (collectType) {
      case 'host':
        return form.getFieldValue('metric_type').map((item: string) => ({
          type: item,
          ...row,
        }));
      default:
        if (row.timeout) {
          row.timeout = row.timeout + 's';
        }
        return [{ type: configTypes[0], ...row }];
    }
  };

  const getInstId = (row: MonitoredObject) => {
    switch (collectType) {
      case 'host':
        const hostTarget: any = nodeList.find(
          (item) => row.node_ids === item.id
        );
        return hostTarget?.ip + '-' + hostTarget?.cloud_region;
      case 'trap':
        const target: any = nodeList.find((item) => row.node_ids === item.id);
        return 'trap' + target?.ip + '-' + target?.cloud_region;
      case 'web':
        return row.url;
      case 'ping':
        return row.url;
      default:
        return objectName + '-' + (row.ip || '');
    }
  };

  const addNodesConfig = async (params = {}) => {
    try {
      setConfirmLoading(true);
      await post(
        '/monitor/api/node_mgmt/batch_setting_node_child_config/',
        params
      );
      message.success(t('common.addSuccess'));
      router.push('/monitor/intergration/list');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleFilterNodeChange = (val: string, index: number) => {
    const _dataSource = deepClone(dataSource);
    _dataSource[index].node_ids = val;
    if (['host', 'trap'].includes(collectType)) {
      _dataSource[index].instance_name =
        nodeList.find((item) => item.id === val)?.name || '';
    }
    setDataSource(_dataSource);
  };

  const handleNodeChange = (val: string[], index: number) => {
    const _dataSource = deepClone(dataSource);
    _dataSource[index].node_ids = val;
    setDataSource(_dataSource);
  };

  const handleGroupChange = (val: string[], index: number) => {
    const _dataSource = deepClone(dataSource);
    _dataSource[index].group_ids = val;
    setDataSource(_dataSource);
  };

  const handleInstNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const _dataSource = deepClone(dataSource);
    _dataSource[index].instance_name = e.target.value;
    setDataSource(_dataSource);
  };

  const handleUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const _dataSource = deepClone(dataSource);
    _dataSource[index].url = _dataSource[index].instance_name = e.target.value;
    setDataSource(_dataSource);
  };

  const handleIpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const _dataSource = deepClone(dataSource);
    _dataSource[index].ip = _dataSource[index].instance_name = e.target.value;
    setDataSource(_dataSource);
  };

  const handleEditAuthPassword = () => {
    if (authPasswordDisabled) {
      form.setFieldsValue({
        authPassword: '',
      });
    }
    setAuthPasswordDisabled(false);
  };

  const handleEditPrivPassword = () => {
    if (privPasswordDisabled) {
      form.setFieldsValue({
        privPassword: '',
      });
    }
    setPrivPasswordDisabled(false);
  };

  const handleEditPassword = () => {
    if (passwordDisabled) {
      form.setFieldsValue({
        password: '',
      });
    }
    setPasswordDisabled(false);
  };

  const getColumnsAndFormItem = () => {
    switch (collectType) {
      case 'host':
        return {
          displaycolumns: [columns[0], ...columns.slice(4, 7)],
          formItems: (
            <Form.Item
              label={t('monitor.intergrations.metricType')}
              name="metric_type"
              rules={[
                {
                  required: true,
                  message: t('common.required'),
                },
              ]}
            >
              <Checkbox.Group>
                <Space direction="vertical">
                  <Checkbox value="cpu">
                    <span>
                      <span className="w-[80px] inline-block">CPU</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.cpuDes')}
                      </span>
                    </span>
                  </Checkbox>
                  <Checkbox value="disk">
                    <span>
                      <span className="w-[80px] inline-block">Disk</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.diskDes')}
                      </span>
                    </span>
                  </Checkbox>
                  <Checkbox value="diskio">
                    <span>
                      <span className="w-[80px] inline-block">Disk IO</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.diskIoDes')}
                      </span>
                    </span>
                  </Checkbox>
                  <Checkbox value="mem">
                    <span>
                      <span className="w-[80px] inline-block">Memory</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.memoryDes')}
                      </span>
                    </span>
                  </Checkbox>
                  <Checkbox value="net">
                    <span>
                      <span className="w-[80px] inline-block">Net</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.netDes')}
                      </span>
                    </span>
                  </Checkbox>
                  <Checkbox value="processes">
                    <span>
                      <span className="w-[80px] inline-block">Processes</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.processesDes')}
                      </span>
                    </span>
                  </Checkbox>
                  <Checkbox value="system">
                    <span>
                      <span className="w-[80px] inline-block">System</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.systemDes')}
                      </span>
                    </span>
                  </Checkbox>
                </Space>
              </Checkbox.Group>
            </Form.Item>
          ),
        };
      case 'trap':
        return {
          displaycolumns: [columns[0], ...columns.slice(4, 7)],
          formItems: null,
        };
      case 'web':
        return {
          displaycolumns: [columns[1], ...columns.slice(3, 7)],
          formItems: null,
        };
      case 'ping':
        return {
          displaycolumns: [columns[1], ...columns.slice(3, 7)],
          formItems: null,
        };
      case 'snmp':
        return {
          displaycolumns: [columns[0], columns[2], ...columns.slice(4, 7)],
          formItems: (
            <>
              <Form.Item required label={t('monitor.intergrations.port')}>
                <Form.Item
                  noStyle
                  name="port"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <InputNumber
                    className="w-[300px] mr-[10px]"
                    min={1}
                    precision={0}
                  />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.portDes')}
                </span>
              </Form.Item>
              <Form.Item required label={t('monitor.intergrations.version')}>
                <Form.Item
                  noStyle
                  name="version"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Select className="mr-[10px]" style={{ width: '300px' }}>
                    <Option value={2}>v2c</Option>
                    <Option value={3}>v3</Option>
                  </Select>
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.versionDes')}
                </span>
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.version !== currentValues.version
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue('version') === 2 ? (
                    <Form.Item
                      required
                      label={t('monitor.intergrations.community')}
                    >
                      <Form.Item
                        noStyle
                        name="community"
                        rules={[
                          {
                            required: true,
                            message: t('common.required'),
                          },
                        ]}
                      >
                        <Input className="w-[300px] mr-[10px]" />
                      </Form.Item>
                      <span className="text-[12px] text-[var(--color-text-3)]">
                        {t('monitor.intergrations.communityDes')}
                      </span>
                    </Form.Item>
                  ) : (
                    <>
                      <Form.Item required label={t('common.name')}>
                        <Form.Item
                          noStyle
                          name="sec_name"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input className="w-[300px] mr-[10px]" />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.nameDes')}
                        </span>
                      </Form.Item>
                      <Form.Item required label={t('monitor.events.level')}>
                        <Form.Item
                          noStyle
                          name="sec_level"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Select
                            className="mr-[10px]"
                            style={{ width: '300px' }}
                          >
                            <Option value="noAuthNoPriv">noAuthNoPriv</Option>
                            <Option value="authNoPriv">authNoPriv</Option>
                            <Option value="authPriv">authPriv</Option>
                          </Select>
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.levelDes')}
                        </span>
                      </Form.Item>
                      <Form.Item
                        required
                        label={t('monitor.intergrations.authProtocol')}
                      >
                        <Form.Item
                          noStyle
                          name="auth_protocol"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input className="w-[300px] mr-[10px]" />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.authProtocolDes')}
                        </span>
                      </Form.Item>
                      <Form.Item
                        required
                        label={t('monitor.intergrations.authPassword')}
                      >
                        <Form.Item
                          noStyle
                          name="auth_password"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input
                            ref={authPasswordRef}
                            disabled={authPasswordDisabled}
                            className="w-[300px] mr-[10px]"
                            type="password"
                            suffix={
                              <EditOutlined
                                className="text-[var(--color-text-2)]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAuthPassword();
                                }}
                              />
                            }
                          />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.authPasswordDes')}
                        </span>
                      </Form.Item>
                      <Form.Item
                        required
                        label={t('monitor.intergrations.privProtocol')}
                      >
                        <Form.Item
                          noStyle
                          name="priv_protocol"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input className="w-[300px] mr-[10px]" />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.privProtocolDes')}
                        </span>
                      </Form.Item>
                      <Form.Item
                        required
                        label={t('monitor.intergrations.privPassword')}
                      >
                        <Form.Item
                          noStyle
                          name="priv_password"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input
                            ref={privPasswordRef}
                            disabled={privPasswordDisabled}
                            className="w-[300px] mr-[10px]"
                            type="password"
                            suffix={
                              <EditOutlined
                                className="text-[var(--color-text-2)]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPrivPassword();
                                }}
                              />
                            }
                          />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.privPasswordDes')}
                        </span>
                      </Form.Item>
                    </>
                  )
                }
              </Form.Item>
              <Form.Item required label={t('monitor.intergrations.timeout')}>
                <Form.Item
                  noStyle
                  name="timeout"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <InputNumber
                    className="mr-[10px]"
                    min={1}
                    precision={0}
                    addonAfter={
                      <Select style={{ width: 116 }} defaultValue="s">
                        {TIMEOUT_UNITS.map((item: string) => (
                          <Option key={item} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    }
                  />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.timeoutDes')}
                </span>
              </Form.Item>
            </>
          ),
        };
      case 'ipmi':
        return {
          displaycolumns: [columns[0], columns[2], ...columns.slice(4, 7)],
          formItems: (
            <>
              <Form.Item label={t('monitor.intergrations.username')} required>
                <Form.Item
                  noStyle
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Input className="w-[300px] mr-[10px]" />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.usernameDes')}
                </span>
              </Form.Item>
              <Form.Item label={t('monitor.intergrations.password')} required>
                <Form.Item
                  noStyle
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Input
                    ref={passwordRef}
                    disabled={passwordDisabled}
                    className="w-[300px] mr-[10px]"
                    type="password"
                    suffix={
                      <EditOutlined
                        className="text-[var(--color-text-2)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPassword();
                        }}
                      />
                    }
                  />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.passwordDes')}
                </span>
              </Form.Item>
              <Form.Item label={t('monitor.intergrations.protocol')} required>
                <Form.Item
                  noStyle
                  name="protocol"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Input className="w-[300px] mr-[10px]" />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.protocolDes')}
                </span>
              </Form.Item>
            </>
          ),
        };
      default:
        return {
          displaycolumns: [columns[0], ...columns.slice(4, 7)],
          formItems: null,
        };
    }
  };

  return (
    <div className="px-[10px]">
      <Form form={form} name="basic" layout="vertical">
        {getColumnsAndFormItem().formItems && (
          <b className="text-[14px] flex mb-[10px] ml-[-10px]">
            {t('monitor.intergrations.configuration')}
          </b>
        )}
        {getColumnsAndFormItem().formItems}
        <b className="text-[14px] flex mb-[10px] ml-[-10px]">
          {t('monitor.intergrations.basicInformation')}
        </b>
        <Form.Item
          label={t('monitor.intergrations.MonitoredObject')}
          name="nodes"
          rules={[
            {
              required: true,
              validator: async () => {
                if (!dataSource.length) {
                  return Promise.reject(new Error(t('common.required')));
                }
                if (
                  dataSource.some((item) =>
                    Object.values(item).some((value) => !value)
                  )
                ) {
                  return Promise.reject(new Error(t('common.required')));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <CustomTable
            scroll={{ y: 'calc(100vh - 490px)', x: 'calc(100vw - 320px)' }}
            dataSource={dataSource}
            columns={getColumnsAndFormItem().displaycolumns}
            rowKey="key"
            pagination={false}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" loading={confirmLoading} onClick={handleSave}>
            {t('common.confirm')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AutomaticConfiguration;
