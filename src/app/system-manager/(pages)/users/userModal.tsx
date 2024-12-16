'use client';

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Input, Button, Form, Radio, Select } from 'antd';
import OperateModal from '@/components/operate-modal';
import type { FormInstance, RadioChangeEvent } from 'antd';
import { useTranslation } from '@/utils/i18n';
import { UserDataType } from '@/app/system-manager/types/users';
import RoleDescription from '@/app/system-manager/components/role-description';
import { useUsernamegeApi } from "@/app/system-manager/api/users/index";

interface ModalProps {
  onSuccess: () => void;
}
interface ModalConfig {
  type: string;
  form: UserDataType;
}
interface ModalRef {
  showModal: (config: ModalConfig) => void;
}

const UserModal = forwardRef<ModalRef, ModalProps>(
  ({ onSuccess }, ref) => {
    const { t } = useTranslation();
    const formRef = useRef<FormInstance>(null);
    const [userVisible, setUserVisible] = useState<boolean>(false);
    const [type, setType] = useState<string>('');
    const [userForm, setUserForm] = useState<UserDataType>({
      key: '',
      username: '',
      name: '',
      email: '',
      number: '',
      team: '',
      role: ''
    });
    const [eidtroleselect, setEidtroleselect] = useState<boolean>(true);
    const { addUserApi, editUserApi } = useUsernamegeApi();

    useImperativeHandle(ref, () => ({
      showModal: ({ type, form }) => {
        setUserVisible(true);
        setType(type);
        switch (type) {
          case 'add':
            setUserForm({
              key: '',
              username: '',
              name: '',
              email: '',
              number: '',
              team: 'team1',
              role: 'Normal users'
            });
            break;
          case 'edit':
            setUserForm(form);
            break;
          case 'modifyrole':
            setUserForm(form);
            break;
        }
      },
    }));

    const options = [
      { label: t('system.users.form.administrator'), value: 'Administrator' },
      { label: t('system.users.form.normalusers'), value: 'Normal users' },
    ];

    useEffect(() => {
      if (userVisible) {
        formRef.current?.resetFields();
        if (type === 'add') {
          formRef.current?.setFieldsValue({
            team: 'team1',
            role: "Normal users"
          });
        }
        formRef.current?.setFieldsValue(userForm);
      }
    }, [userVisible, userForm]);

    const handleCancel = () => {
      setUserVisible(false);
    };

    const handleConfirm = async () => {
      try {
        const validData = await formRef.current?.validateFields();

        if (type === 'add') {
          await addUserApi(validData.username, validData.email, validData.name, validData.number);
        } else {
          await editUserApi(userForm.key, validData);
        }

        onSuccess();
        setUserVisible(false);
      } catch (error) {
        console.log('Validation failed:', error);
      }
    };

    const radiochang = (e: RadioChangeEvent) => {
      setEidtroleselect(e.target.value === "Administrator");
    };

    return (
      <div>
        {type === 'modifyrole' ? (
          <OperateModal
            width={500}
            title={t('system.common.batchmodifyroles')}
            closable={false}
            open={userVisible}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
            footer={[
              <Button key="submit" type="primary" onClick={handleConfirm}>
                {t('common.confirm')}
              </Button>,
              <Button key="cancel" onClick={handleCancel}>
                {t('common.cancel')}
              </Button>,
            ]}
          >
            <Form ref={formRef}>
              <Form.Item colon={false}>
                <span>{t('system.common.selectedusers')}:</span>
                <span className="text-[#1890ff]">{userForm.username}</span>
              </Form.Item>
              <Form.Item name="role" colon={false}>
                <Radio.Group options={options} onChange={radiochang} />
              </Form.Item>
              <Form.Item name="comment" colon={false}>
                <RoleDescription modifyRoleSelect={eidtroleselect} />
              </Form.Item>
            </Form>
          </OperateModal>
        ) : (
          <OperateModal
            title={type === 'add' ? t('common.add') : t('common.edit') + '-' + userForm.username}
            closable={false}
            open={userVisible}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
            width={500}
            footer={[
              <Button key="submit" type="primary" onClick={handleConfirm}>
                {t('common.confirm')}
              </Button>,
              <Button key="cancel" onClick={handleCancel}>
                {t('common.cancel')}
              </Button>,
            ]}
          >
            <Form ref={formRef} layout="vertical">
              <Form.Item
                name="username"
                label={t('system.users.form.username')}
                rules={[{ required: true, message: t('system.users.form.username') + ' is required' }]}
                colon={false}
              >
                <Input placeholder="input placeholder" disabled={type !== 'add'} />
              </Form.Item>
              <Form.Item
                name="name"
                label={t('system.users.form.name')}
                colon={false}
              >
                <Input placeholder="input placeholder" />
              </Form.Item>
              <Form.Item
                name="email"
                label={t('system.users.form.email')}
                colon={false}
                rules={[{ required: true, message: t('system.users.form.email') + ' is required' }]}
              >
                <Input placeholder="input placeholder" />
              </Form.Item>
              <Form.Item
                name="number"
                label={t('system.users.form.number')}
                colon={false}
              >
                <Input placeholder="input placeholder" />
              </Form.Item>
              <Form.Item
                name="team"
                label={t('system.users.form.team')}
                colon={false}
                rules={[{ required: true, message: t('system.users.form.team') + ' is required' }]}
              >
                <Select
                  style={{ width: 120 }}
                  options={[
                    { value: 'team1', label: 'team1' },
                    { value: 'team2', label: 'team2' },
                  ]}
                  placeholder="select it"
                />
              </Form.Item>
              <Form.Item
                name="role"
                label={t('system.users.form.role')}
                colon={false}
                rules={[{ required: true, message: t('system.users.form.role') + ' is required' }]}
              >
                <Radio.Group options={options} onChange={radiochang} />
              </Form.Item>
              <Form.Item
                name="comment"
                label="  "
                colon={false}
              >
                <RoleDescription modifyRoleSelect={eidtroleselect} />
              </Form.Item>
            </Form>
          </OperateModal>
        )}
      </div>
    );
  }
);

UserModal.displayName = 'UserModal';
export default UserModal;
export type { ModalRef };
