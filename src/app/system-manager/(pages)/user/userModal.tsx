import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Input, Button, Form, TreeSelect, Select, message, Spin } from 'antd';
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
  groupKeys?: string[];
}

export interface ModalRef {
  showModal: (config: ModalConfig) => void;
}

const UserModal = forwardRef<ModalRef, ModalProps>(({ onSuccess, treeData }, ref) => {
  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);
  const { clientData } = useClientData();
  const [currentUserId, setCurrentUserId] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<'add' | 'edit'>('add');
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);

  const { addUser, editUser, getUserDetail, getRoleList } = useUserApi();

  const fetchRoleInfo = async () => {
    setInfoLoading(true);
    try {
      const ids = clientData.map(client => client.id);
      const roleData = await getRoleList({ client_id: ids });
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
      const id = clientData.map(client => client.id);
      const userDetail = await getUserDetail({ user_id: userId, id });
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

  useImperativeHandle(ref, () => ({
    showModal: ({ type, userId, groupKeys = [] }) => {
      setVisible(true);
      setType(type);
      formRef.current?.resetFields();

      if (type === 'edit' && userId) {
        fetchUserDetail(userId);
      } else if (type === 'add') {
        setTimeout(() => {
          formRef.current?.setFieldsValue({ groups: groupKeys });
        }, 0);
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
      const roles = roleOptions.filter((op) => formData.roles.includes(op.value))
        .map((role) => ({ id: role.value, name: role.label }));

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

  // 这里通过检查 treeData 和默认值进行填充，确保组件不会因为 treeData 的问题崩溃
  const transformTreeData = (data: any) => {
    return data.map((node: any) => ({
      title: node.title || 'Unknown',
      value: node.key,
      key: node.key,
      children: node.children ? transformTreeData(node.children) : []
    }));
  };

  const filteredTreeData = treeData ? transformTreeData(treeData) : [];

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
            <TreeSelect
              treeData={filteredTreeData}
              showSearch
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder={t('system.user.form.group')}
              allowClear
              multiple
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item
            name="roles"
            label={t('system.user.form.role')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Select
              placeholder={t('system.user.form.role')}
              mode="multiple"
              options={roleOptions}
              loading={infoLoading}
            />
          </Form.Item>
        </Form>
      </Spin>
    </OperateModal>
  );
});

UserModal.displayName = 'UserModal';
export default UserModal;
