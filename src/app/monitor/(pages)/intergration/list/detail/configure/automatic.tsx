import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import { useTranslation } from '@/utils/i18n';
import CustomTable from '@/components/custom-table';
import { v4 as uuidv4 } from 'uuid';
import { deepClone } from '@/app/monitor/utils/common';
import {
  COLLECT_TYPE_MAP,
  INSTANCE_TYPE_MAP,
  CONFIG_TYPE_MAP,
} from '@/app/monitor/constants/monitor';
import { useSearchParams, useRouter } from 'next/navigation';
import useApiClient from '@/utils/request';
import { useCommon } from '@/app/monitor/context/common';
import { Organization, ListItem } from '@/app/monitor/types';
import { useUserInfoContext } from '@/context/userInfo';
import { useColumnsAndFormItems } from '@/app/monitor/hooks/intergration';

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

  // 使用自定义 Hook
  const { displaycolumns, formItems } = useColumnsAndFormItems({
    collectType,
    columns,
    authPasswordRef,
    privPasswordRef,
    passwordRef,
    authPasswordDisabled,
    privPasswordDisabled,
    passwordDisabled,
    handleEditAuthPassword,
    handleEditPrivPassword,
    handleEditPassword,
  });

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
    const newData: MonitoredObject = { ...row, key: uuidv4() };
    const updatedData = [...dataSource];
    updatedData.splice(index + 1, 0, newData);
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
      const searchParams = new URLSearchParams({
        objId: objectId,
      });
      const targetUrl = `/monitor/intergration/list?${searchParams.toString()}`;
      router.push(targetUrl);
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

  return (
    <div className="px-[10px]">
      <Form form={form} name="basic" layout="vertical">
        {formItems && (
          <b className="text-[14px] flex mb-[10px] ml-[-10px]">
            {t('monitor.intergrations.configuration')}
          </b>
        )}
        {formItems}
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
            columns={displaycolumns}
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
