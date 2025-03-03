'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Form, message, Menu, Modal } from 'antd';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/utils/i18n';
import EntityList from '@/components/entity-list';
import DynamicForm from '@/components/dynamic-form';
import OperateModal from '@/components/operate-modal';
import PermissionWrapper from '@/components/permission';
import { Channel } from '@/app/system-manager/types/channel';
import { useChannelApi } from '@/app/system-manager/api/channel';

const ChannelListPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelData, setChannelData] = useState<Channel[]>([]);

  const { getChannelData, addChannel, updateChannel, deleteChannel } = useChannelApi();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const iconMap: Record<string, string> = {
        email: 'youjian',
        weCom: 'qiwei2',
      };

      const data = await getChannelData();
      const formattedData = data.map((channel: any): Channel => ({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        icon: iconMap[channel.channel_type] || '',
        tag: [channel.channel_type],
        channel_type: channel.channel_type,
      }));
      setChannelData(formattedData);
    } catch {
      console.error(t('common.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setConfirmLoading(true);
      if (selectedChannel?.id) {
        await updateChannel({ ...selectedChannel, ...values });
      } else {
        await addChannel(values);
      }
      fetchData();
      closeModal();
      message.success(t('common.updateSuccess'));
    } catch {
      message.error(t('common.updateFailed'));
    } finally {
      setConfirmLoading(false);
    }
  };

  const closeModal = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const showModal = (channel: Channel | null = null) => {
    setSelectedChannel(channel);
    setIsModalVisible(true);
    if (channel) {
      form.setFieldsValue({
        name: channel.name,
        description: channel.description,
        channel_type: channel.channel_type,
      });
    }
  };

  const handleCardClick = (channel: Channel) => {
    router.push(
      `/system-manager/channel/detail/settings?id=${channel.id}&name=${channel.name}&desc=${channel.description}`,
    );
  };

  const handleDeleteChannel = (channel: Channel) => {
    Modal.confirm({
      title: t('system.channel.deleteConfirm'),
      onOk: async () => {
        try {
          await deleteChannel(channel);
          fetchData();
          message.success(t('common.delSuccess'));
        } catch {
          message.error(t('common.delFailed'));
        }
      },
    });
  };

  const formFields = useMemo(() => {
    return [
      {
        name: 'name',
        type: 'input',
        label: t('system.channel.name'),
        placeholder: `${t('common.inputMsg')}${t('system.channel.name')}`,
        rules: [{ required: true, message: `${t('common.inputMsg')}${t('system.channel.name')}` }],
      },
      {
        name: 'channel_type',
        type: 'select',
        label: t('system.channel.type'),
        placeholder: `${t('common.selectMsg')}${t('system.channel.type')}`,
        options: [
          { value: 'email', label: 'Email' },
          { value: 'weCom', label: 'WeCom' },
        ],
        rules: [{ required: true, message: `${t('common.selectMsg')}${t('system.channel.type')}` }],
      },
      {
        name: 'description',
        type: 'textarea',
        label: t('system.channel.description'),
        placeholder: `${t('common.inputMsg')}${t('system.channel.description')}`,
        rows: 4,
        rules: [{ required: true, message: `${t('common.inputMsg')}${t('system.channel.description')}` }],
      },
    ];
  }, [t]);

  const menuActions = (channel: Channel) => (
    <Menu>
      <Menu.Item key={`edit-${channel.id}`}>
        <PermissionWrapper requiredPermissions={['Edit']}>
          <span onClick={() => showModal(channel)}>{t('common.edit')}</span>
        </PermissionWrapper>
      </Menu.Item>
      <Menu.Item key={`delete-${channel.id}`}>
        <PermissionWrapper requiredPermissions={['Delete']}>
          <span onClick={() => handleDeleteChannel(channel)}>{t('common.delete')}</span>
        </PermissionWrapper>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="w-full h-full">
      <EntityList<Channel>
        data={channelData}
        loading={loading}
        menuActions={menuActions}
        openModal={showModal}
        onCardClick={handleCardClick}
      />
      <OperateModal
        title={selectedChannel ? selectedChannel.name : t('common.edit')}
        visible={isModalVisible}
        confirmLoading={confirmLoading}
        onOk={() => form.validateFields().then(handleSubmit)}
        onCancel={closeModal}
      >
        <DynamicForm form={form} fields={formFields} />
      </OperateModal>
    </div>
  );
};

export default ChannelListPage;
