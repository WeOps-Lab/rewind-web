'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Form, message, Spin } from 'antd';
import { useTranslation } from '@/utils/i18n';
import DynamicForm from '@/components/dynamic-form';
import OperateModal from '@/components/operate-modal'
import { useChannelApi } from '@/app/system-manager/api/channel';
import { ChannelType } from '@/app/system-manager/types/channel';

interface ChannelModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'add' | 'edit';
  channelId: string | null;
  onSuccess: () => void;
}

const ChannelModal: React.FC<ChannelModalProps> = ({
  visible,
  onClose,
  type,
  channelId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const channelType = (searchParams.get('id') || 'email') as ChannelType;
  const { addChannel, updateChannel, getChannelDetail } = useChannelApi();
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [channelData, setChannelData] = useState<any>({ config: {} });

  const fetchChannelDetail = async (id: string) => {
    setLoading(true);
    try {
      const data = await getChannelDetail(id);
      setChannelData(data);
      form.setFieldsValue(data.config);
    } catch {
      message.error(t('common.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    if (type === 'edit' && channelId) {
      fetchChannelDetail(channelId);
    } else {
      setChannelData({
        name: '',
        channel_type: channelType,
        description: '',
        config: channelType === 'email' ? {
          smtp_server: '',
          port: '',
          smtp_user: '',
          smtp_pwd: '',
          smtp_usessl: false,
          smtp_usetls: false,
          mail_sender: '',
        } : {
          corp_id: '',
          secret: '',
          token: '',
          aes_key: '',
          agent_id: '',
        },
      });
    }
  }, [type, channelId, visible]);

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();
      const payload = {
        channel_type: channelType,
        ...values,
        config: {
          ...values
        }
      };
      if (type === 'add') {
        await addChannel(payload);
      } else if (type === 'edit' && channelId) {
        await updateChannel({ id: channelId, ...payload });
      }
      message.success(t('common.updateSuccess'));
      onSuccess();
      onClose();
    } catch {
      message.error(t('common.updateFailed'));
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
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

  const formFields = React.useMemo(() => {
    if (!channelData.config) return [];

    const basicFields = [
      {
        name: 'name',
        type: 'input',
        label: t('system.channel.settings.name'),
        placeholder: `${t('common.inputMsg')}${t('system.channel.settings.name')}`,
        rules: [{ required: true, message: `${t('common.inputMsg')}${t('system.channel.settings.name')}` }],
      },
      {
        name: 'description',
        type: 'textarea',
        label: t('system.channel.settings.description'),
        placeholder: `${t('common.inputMsg')}${t('system.channel.settings.description')}`,
        rows: 4,
        rules: [{ required: true, message: `${t('common.inputMsg')}${t('system.channel.settings.description')}` }],
      },
    ];

    const configFields = Object.keys(channelData.config).map((key) => ({
      name: key,
      type: getFieldType(key),
      label: t(`system.channel.settings.${key}`),
      placeholder: `${t('common.inputMsg')}${t(`system.channel.settings.${key}`)}`,
      rules: [{ required: !['smtp_usessl', 'smtp_usetls'].includes(key), message: `${t('common.inputMsg')}${t(`system.channel.settings.${key}`)}` }],
    }));

    return [...basicFields, ...configFields];
  }, [channelData.config, t]);

  return (
    <OperateModal
      title={type === 'add' ? t('system.channel.settings.addChannel') : t('system.channel.settings.editChannel')}
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
    >
      {loading ? (
        <Spin />
      ) : (
        <DynamicForm
          form={form}
          fields={formFields}
        />
      )}
    </OperateModal>
  );
};

export default ChannelModal;
