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
import { UserDataType } from '@/app/system-manager/types/user';
import RoleDescription from '@/app/system-manager/components/role-description';
import { useUsernamegeApi } from "@/app/system-manager/api/user/index";

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
      { label: t('system.user.form.administrator'), value: 'Administrator' },
      { label: t('system.user.form.normalusers'), value: 'Normal users' },
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
            width={650}
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
                <span className="text-[var(--color-primary)]">{userForm.username}</span>
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
            width={650}
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
                label={t('system.user.form.username')}
                rules={[{ required: true, message: t('common.inputRequired') }]}
                colon={false}
              >
                <Input placeholder={`${t('common.inputMsg')}${t('system.user.form.username')}`} disabled={type !== 'add'} />
              </Form.Item>
              <Form.Item
                name="name"
                label={t('system.user.form.name')}
                colon={false}
              >
                <Input placeholder={`${t('common.inputMsg')}${t('system.user.form.name')}`} />
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
                name="number"
                label={t('system.user.form.number')}
                colon={false}
              >
                <Input placeholder={`${t('common.inputMsg')}${t('system.user.form.number')}`} />
              </Form.Item>
              <Form.Item
                name="team"
                label={t('system.user.form.team')}
                colon={false}
                rules={[{ required: true, message: t('common.inputRequired') }]}
              >
                <Select
                  style={{ width: '100%' }}
                  options={[
                    { value: 'team1', label: 'team1' },
                    { value: 'team2', label: 'team2' },
                  ]}
                  placeholder="select it"
                />
              </Form.Item>
              <Form.Item
                name="role"
                label={t('system.user.form.role')}
                colon={false}
                rules={[{ required: true, message: t('common.inputRequired') }]}
              >
                <Radio.Group options={options} onChange={radiochang} />
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
