import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, message } from 'antd';
import { useTranslation } from '@/utils/i18n';
import { deepClone } from '@/app/monitor/utils/common';
import {
  COLLECT_TYPE_MAP,
  CONFIG_TYPE_MAP,
} from '@/app/monitor/constants/monitor';
import { useSearchParams } from 'next/navigation';
import useApiClient from '@/utils/request';
import { useFormItems } from '@/app/monitor/hooks/intergration';
import ReactAce from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

const AutomaticConfiguration: React.FC = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const { post, isLoading } = useApiClient();
  const collectTypeId = searchParams.get('collect_type') || '';
  const objId = searchParams.get('id') || '';
  const collectType = COLLECT_TYPE_MAP[collectTypeId];
  const configTypes = CONFIG_TYPE_MAP[collectTypeId];
  const authPasswordRef = useRef<any>(null);
  const privPasswordRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const [authPasswordDisabled, setAuthPasswordDisabled] =
    useState<boolean>(true);
  const [privPasswordDisabled, setPrivPasswordDisabled] =
    useState<boolean>(true);
  const [passwordDisabled, setPasswordDisabled] = useState<boolean>(true);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

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
  const { formItems } = useFormItems({
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
      getStep3Content(_values);
    });
  };

  const getStep3Content = async (
    params = { interval: '', monitor_url: '' }
  ) => {
    if (params) {
      console.log(params);
      return;
    }
    try {
      setConfirmLoading(true);
      const instnaceId = await post(
        `/monitor/api/monitor_instance/${objId}/generate_instance_id/`,
        params
      );
      console.log(instnaceId);
      message.success(t('common.successfullyAdded'));
    } finally {
      setConfirmLoading(false);
    }
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
      <ReactAce
        className="mb-[10px]"
        mode="python"
        theme="monokai"
        name="editor"
        width="100%"
        height="300px"
      />
      <Button type="primary" loading={confirmLoading} onClick={handleSave}>
        {t('monitor.intergrations.generateConfiguration')}
      </Button>
    </div>
  );
};

export default AutomaticConfiguration;
