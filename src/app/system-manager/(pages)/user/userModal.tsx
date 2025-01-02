import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Input, Button, Form, Select, message } from 'antd';
import OperateModal from '@/components/operate-modal';
import type { FormInstance } from 'antd';
import { useTranslation } from '@/utils/i18n';
import { UserDataType } from '@/app/system-manager/types/user';
import { useUserApi } from "@/app/system-manager/api/user/index";
import { useRoleApi } from "@/app/system-manager/api/role/index";
import type { DataNode as TreeDataNode } from 'antd/lib/tree';

interface ModalProps {
  onSuccess: () => void;
  treeData: TreeDataNode[];
}

interface ModalConfig {
  type: 'add' | 'edit';
  form: UserDataType;
}

interface ModalRef {
  showModal: (config: ModalConfig) => void;
}

const UserModal = forwardRef<ModalRef, ModalProps>(
  ({ onSuccess, treeData }, ref) => {
    const { t } = useTranslation();
    const formRef = useRef<FormInstance>(null);

    const [userVisible, setUserVisible] = useState<boolean>(false);
    const [type, setType] = useState<'add' | 'edit'>('add');
    const [infoLoading, setInfoLoading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [userForm, setUserForm] = useState<UserDataType>({
      key: '',
      username: '',
      email: '',
      lastName: '',
      roles: [],
      groups: []
    });

    const { addUser, editUser, getRoleList } = useUserApi();
    const { getClientData } = useRoleApi();
    const [roleOptions, setRoleOptions] = useState<{ label: string, value: string }[]>([]);

    const [groupOptions, setGroupOptions] = useState<{ label: string, value: string }[]>([]);

    useImperativeHandle(ref, () => ({
      showModal: ({ type, form }) => {
        setUserVisible(true);
        setType(type);
        setUserForm(
          type === 'add'
            ? { key: '', username: '', email: '', lastName: '', roles: [], groups: [] }
            : form
        );
      },
    }));

    const fetchRoleInfo = async () => {
      setInfoLoading(true);
      try {
        const clientData = await getClientData();
        const roleData = await getRoleList({ params: { client_id: clientData?.[0]?.id } });
        const roleOpts = roleData.map((role: { role_name: string; role_id: string }) => ({
          label: role.role_name,
          value: role.role_id,
        }));
        setRoleOptions(roleOpts);
      } catch (error) {
        message.error('Error fetching role info');
        console.error('Error fetching role info', error);
      } finally {
        setInfoLoading(false);
      }
    };

    useEffect(() => {
      // Convert treeData to groupOptions for Select component
      const convertTreeDataToGroupOptions = (data: TreeDataNode[]): { label: string, value: string }[] => {
        const options: { label: string, value: string }[] = [];
        data.forEach(item => {
          options.push({ label: item.title as string, value: item.key as string });
          if (item.children && item.children.length > 0) {
            options.push(...convertTreeDataToGroupOptions(item.children));
          }
        });
        return options;
      };

      const options = convertTreeDataToGroupOptions(treeData);
      setGroupOptions(options);
    }, [treeData]);

    useEffect(() => {
      if (userVisible) {
        formRef.current?.resetFields();
        formRef.current?.setFieldsValue(userForm);
        fetchRoleInfo();
      }
    }, [userVisible]);

    const handleCancel = () => {
      setUserVisible(false);
    };

    const handleConfirm = async () => {
      try {
        setIsLoading(true);
        const validData = await formRef.current?.validateFields();

        const formattedData = {
          ...validData,
          roles: validData.roles.map((roleId: string) => ({
            id: roleId,
            name: roleOptions.find(role => role.value === roleId)?.label,
          }))
        };

        if (type === 'add') {
          await addUser(formattedData);
          message.success(t('common.addSuccess'));
        } else {
          await editUser(userForm.key, formattedData);
          message.success(t('common.editSuccess'));
        }

        onSuccess();
        setUserVisible(false);
      } catch (error) {
        message.error(t('common.operationFailed'));
        console.error('Validation failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <OperateModal
        title={type === 'add' ? t('common.add') : `${t('common.edit')}-${userForm.username}`}
        open={userVisible}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onCancel={handleCancel}
        width={650}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>,
          <Button key="submit" type="primary" onClick={handleConfirm} loading={isLoading}>
            {t('common.confirm')}
          </Button>
        ]}
      >
        <Form ref={formRef} layout="vertical">
          <Form.Item
            name="username"
            label={t('system.user.form.username')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
            colon={false}
          >
            <Input
              placeholder={`${t('common.inputMsg')}${t('system.user.form.username')}`}
              disabled={type !== 'add'}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('system.user.form.email')}
            colon={false}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Input placeholder={`${t('common.inputMsg')}${t('system.user.form.email')}`} />
          </Form.Item>
          <Form.Item
            name="lastName"
            label={t('system.user.form.lastName')}
            colon={false}
          >
            <Input placeholder={`${t('common.inputMsg')}${t('system.user.form.lastName')}`} />
          </Form.Item>
          <Form.Item
            name="groups"
            label={t('system.user.form.group')}
            colon={false}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Select
              placeholder={`${t('common.select')} ${t('system.user.form.group')}`}
              mode="multiple"
              options={groupOptions}
            />
          </Form.Item>
          <Form.Item
            name="roles"
            label={t('system.user.form.role')}
            colon={false}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Select
              placeholder={`${t('common.select')} ${t('system.user.form.role')}`}
              mode="multiple"
              loading={infoLoading}
              options={roleOptions}
            />
          </Form.Item>
        </Form>
      </OperateModal>
    );
  }
);

UserModal.displayName = 'UserModal';
export default UserModal;
export type { ModalRef };
