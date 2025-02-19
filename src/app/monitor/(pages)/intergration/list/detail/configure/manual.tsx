import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, message } from 'antd';
import { useTranslation } from '@/utils/i18n';
import { deepClone } from '@/app/monitor/utils/common';
import {
  COLLECT_TYPE_MAP,
  CONFIG_TYPE_MAP,
  INSTANCE_TYPE_MAP,
} from '@/app/monitor/constants/monitor';
import { useSearchParams } from 'next/navigation';
import useApiClient from '@/utils/request';
import { useFormItems } from '@/app/monitor/hooks/intergration';
import CodeEditor from '@/app/monitor/components/codeEditor';
import { TableDataItem } from '@/app/monitor/types';

const AutomaticConfiguration: React.FC = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { post, isLoading } = useApiClient();
  const collectTypeId = searchParams.get('collect_type') || '';
  const objId = searchParams.get('id') || '';
  const objectName = searchParams.get('name') || '';
  const collectType = COLLECT_TYPE_MAP[collectTypeId];
  const configTypes = CONFIG_TYPE_MAP[collectTypeId];
  const instanceType = INSTANCE_TYPE_MAP[collectTypeId];
  const authPasswordRef = useRef<any>(null);
  const privPasswordRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const [authPasswordDisabled, setAuthPasswordDisabled] =
    useState<boolean>(true);
  const [privPasswordDisabled, setPrivPasswordDisabled] =
    useState<boolean>(true);
  const [passwordDisabled, setPasswordDisabled] = useState<boolean>(true);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [configMsg, setConfigMsg] = useState<string>('');

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
  const { formItems, configText } = useFormItems({
    collectType,
    columns: [],
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

  const handleSave = () => {
    form.validateFields().then((values) => {
      // 处理表单提交逻辑
      const _values = deepClone(values);
      _values.instance_id = getInstId(_values);
      _values.instance_type = instanceType;
      _values.collect_type = collectType;
      _values.config_type = configTypes[0] || '';
      getConfigText(_values);
    });
  };

  const getInstId = (row: TableDataItem) => {
    switch (collectType) {
      case 'host':
        return row.monitor_ip;
      case 'trap':
        return 'trap' + row.monitor_ip;
      case 'web':
        return row.monitor_url;
      case 'ping':
        return row.monitor_url;
      case 'middleware':
        return row.monitor_url;
      case 'docker':
        return row.endpoint;
      default:
        return objectName + '-' + (row.monitor_ip || '');
    }
  };

  const getConfigText = async (params: TableDataItem) => {
    try {
      setConfirmLoading(true);
      await post(
        `/monitor/api/monitor_instance/${objId}/check_monitor_instance/`,
        {
          instance_id: params.instance_id,
          instance_name: params.instance_id,
        }
      );
      let _configMsg = deepClone(configText);
      if (collectType === 'snmp') {
        _configMsg = _configMsg[`v${params.version}`];
      }
      if (collectType === 'host') {
        _configMsg = params.metric_type.reduce((pre: string, cur: string) => {
          return (pre += _configMsg[cur]);
        }, '');
      }
      setConfigMsg(replaceTemplate(_configMsg as string, params));
      message.success(t('common.successfullyAdded'));
    } finally {
      setConfirmLoading(false);
    }
  };

  const replaceTemplate = (
    template: string,
    data: { [key: string]: string | number }
  ): string => {
    return Object.keys(data).reduce((acc, key) => {
      // 使用正则表达式来匹配模板字符串中的 ${key} 或 $key
      const regex = new RegExp(`\\$${key}`, 'g');
      // 替换匹配到的内容为对象中的值
      return acc.replace(regex, data[key].toString());
    }, template);
  };

  return (
    <div className="px-[10px]">
      <Form form={form} name="basic" layout="vertical">
        {formItems && (
          <p className="mb-[20px]">
            {t('monitor.intergrations.configureStepIntro')}
          </p>
        )}
        {formItems}
      </Form>
      <Button type="primary" loading={confirmLoading} onClick={handleSave}>
        {t('monitor.intergrations.generateConfiguration')}
      </Button>
      {!!configMsg && (
        <CodeEditor
          className="mt-[10px]"
          mode="python"
          theme="monokai"
          name="editor"
          width="100%"
          height="300px"
          readOnly
          value={configMsg}
          showCopy
        />
      )}
    </div>
  );
};

export default AutomaticConfiguration;
