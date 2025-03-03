'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, message, Button, Spin } from 'antd';
import { useTranslation } from '@/utils/i18n';
import DynamicForm from '@/components/dynamic-form';
import { useChannelApi } from '@/app/system-manager/api/channel';

const { useForm } = Form;

const ChannelSettingsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [channelConfig, setChannelConfig] = useState<Record<string, any>>({});
  const [form] = useForm();
  const { getChannelDetail, updateChannelSettings } = useChannelApi();

  const channelId = searchParams.get('id');

  useEffect(() => {
    if (channelId) {
      fetchChannelDetail(channelId);
    }
  }, [channelId]);

  const fetchChannelDetail = async (id: string) => {
    setLoading(true);
    try {
      const data = await getChannelDetail(id);
      setChannelConfig(data.config);
      form.setFieldsValue(data.config);
    } catch {
      message.error(t('common.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        setConfirmLoading(true);
        await updateChannelSettings({ id: channelId, config: values });
        message.success(t('common.updateSuccess'));
      } catch {
        message.error(t('common.updateFailed'));
      } finally {
        setConfirmLoading(false);
      }
    }).catch((error) => {
      console.log('common.valFailed:', error);
    });
  };

  const handleCancel = () => {
    router.back();
  };

  const getFieldType = (key: string): string => {
    if (['smtp_usessl', 'smtp_usetls'].includes(key)) {
      return 'switch';
    }
    if (['smtp_pwd', 'token', 'aes_key', 'secret'].includes(key)) {
      return 'inputPwd';
    }
    return 'input';
  };

  const formFields = useMemo(() => {
    if (!channelConfig) return [];

    return Object.keys(channelConfig).map((key) => ({
      name: key,
      type: getFieldType(key),
      label: t(`system.channel.settings.${key}`),
      placeholder: `${t('common.inputMsg')}${t(`system.channel.settings.${key}`)}`,
      rules: [{ required: true, message: `${t('common.inputMsg')}${t(`system.channel.settings.${key}`)}` }]
    }));
  }, [channelConfig]);

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      {loading ? (<Spin></Spin>) : (<DynamicForm
        form={form}
        fields={formFields}
      />)}
      <div className="flex justify-end mt-5">
        <Button onClick={handleCancel} className="mr-3">{t('common.cancel')}</Button>
        <Button type="primary" onClick={handleOk} loading={confirmLoading}>{t('common.confirm')}</Button>
      </div>
    </div>
  );
};

export default ChannelSettingsPage;
