import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Input, Button, Form, Select, message, Spin } from 'antd';
import OperateModal from '@/components/operate-modal';
import type { FormInstance } from 'antd';
import { useTranslation } from '@/utils/i18n';
import { useUserApi } from '@/app/system-manager/api/user/index';
import type { DataNode as TreeDataNode } from 'antd/lib/tree';
import { useClientData } from '@/context/client';

interface ModalProps {
  onSuccess: () => void;
  treeData: TreeDataNode[];
}

interface ModalConfig {
  type: 'add' | 'edit';
  userId?: string;
}

export interface ModalRef {
  showModal: (config: ModalConfig) => void;
}

const UserModal = forwardRef<ModalRef, ModalProps>(({ onSuccess, treeData }, ref) => {
  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);
  const { getByName } = useClientData();
  const [currentUserId, setCurrentUserId] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<'add' | 'edit'>('add');
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const [groupOptions, setGroupOptions] = useState<{ label: string; value: string }[]>([]);

  const { addUser, editUser, getUserDetail, getRoleList } = useUserApi();

  const fetchRoleInfo = async () => {
    setInfoLoading(true);
    try {
      const curClient = await getByName('OpsPilot');
      const roleData = await getRoleList({ params: { client_id: curClient?.id } });
      setRoleOptions(
        roleData.map((role: { role_name: string; role_id: string }) => ({
          label: role.role_name,
          value: role.role_id,
        })),
      );
    } catch {
      message.error(t('common.fetchFailed'));
    } finally {
      setInfoLoading(false);
    }
  };

  const fetchUserDetail = async (userId: string) => {
    setLoading(true);
    try {
      const curClient = await getByName('OpsPilot');
      const userDetail = await getUserDetail({ params: { user_id: userId, id: curClient?.id } });
      if (userDetail) {
        setCurrentUserId(userId);
        formRef.current?.setFieldsValue({
          ...userDetail,
          roles: userDetail.roles?.map((role: { role_id: string }) => role.role_id) || [],
          groups: userDetail.groups?.map((group: { id: string }) => group.id) || [],
        });
      }
    } catch {
      message.error(t('common.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (treeData) {
      const convertTreeDataToGroupOptions = (data: TreeDataNode[]): { label: string; value: string }[] => {
        return data.flatMap((item) => [
          { label: String(item.title), value: String(item.key) },
          ...(item.children ? convertTreeDataToGroupOptions(item.children) : []),
        ]);
      };
      setGroupOptions(convertTreeDataToGroupOptions(treeData));
    }
  }, [treeData]);

  useImperativeHandle(ref, () => ({
    showModal: ({ type, userId }) => {
      setVisible(true);
      setType(type);
      formRef.current?.resetFields();
      if (type === 'edit' && userId) {
        fetchUserDetail(userId);
      }
      fetchRoleInfo();
    },
  }));

  const handleCancel = () => {
    setVisible(false);
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      const formData = await formRef.current?.validateFields();
      console.log('formData', formData);
      const roles = roleOptions.filter(op => formData.roles.includes(op.value)).map(role => ({ id: role.value, name: role.label }))
      console.log('roles', roles)
      if (type === 'add') {
        await addUser({ ...formData, roles });
        message.success(t('common.addSuccess'));
      } else {
        await editUser({ user_id: currentUserId, ...formData, roles });
        message.success(t('common.updateSuccess'));
      }
      onSuccess();
      setVisible(false);
    } catch {
      message.error(t('common.valFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OperateModal
      title={type === 'add' ? t('common.add') : t('common.edit')}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('common.cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleConfirm} loading={isSubmitting || loading}>
          {t('common.confirm')}
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Form ref={formRef} layout="vertical">
          <Form.Item
            name="username"
            label={t('system.user.form.username')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Input placeholder={t('system.user.form.username')} disabled={type === 'edit'} />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('system.user.form.email')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Input placeholder={t('system.user.form.email')} />
          </Form.Item>
          <Form.Item
            name="lastName"
            label={t('system.user.form.lastName')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Input placeholder={t('system.user.form.lastName')} />
          </Form.Item>
          <Form.Item
            name="groups"
            label={t('system.user.form.group')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Select placeholder={t('system.user.form.group')} mode="multiple" options={groupOptions} />
          </Form.Item>
          <Form.Item
            name="roles"
            label={t('system.user.form.role')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Select placeholder={t('system.user.form.role')} mode="multiple" options={roleOptions} loading={infoLoading} />
          </Form.Item>
        </Form>
      </Spin>
    </OperateModal>
  );
});

UserModal.displayName = 'UserModal';
export default UserModal;
