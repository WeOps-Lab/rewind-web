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
import { UserDataType } from '@/app/system-manager/types/userstypes';
import RoleDescription from '@/app/system-manager/components/role-description';
import userInfoStyle from './index.module.scss'

//传入modal的参数类型
interface ModalProps {
  onSuccess: (successuserdata: UserDataType, reptype: string) => void;
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
    //
    useImperativeHandle(ref, () => ({
      showModal: ({ type, form }) => {
        // 开启弹窗的交互
        setUserVisible(true);
        setType(type);
        switch (type) {
          case 'add':
            form.type = 'add';
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
            form.type = 'edit';
            setUserForm(form);
            break;
          case 'modifyrole':
            form.type = 'modifyrole';
            setUserForm(form);
            break;
        }
        console.log(type);
      },

    }));
    const options = [
      { label: t('tableItem.administrator'), value: 'Administrator' },
      { label: t('tableItem.normalusers'), value: 'Normal users' },
    ];
    //初始化表单的数据
    useEffect(() => {
      if (userVisible) {
        formRef.current?.resetFields();
        if (type === 'add') {
          formRef.current?.setFieldsValue({
            team: 'team1',
            role: "Normal users"
          })
        }
        formRef.current?.setFieldsValue(userForm);
      }
    }, [userVisible, userForm]);


    //关闭用户的弹窗
    const handleCancel = () => {
      setUserVisible(false);
    };
    const handleConfirm = () => {
      const successuserdata = handleEmptyFields(userForm);
      onSuccess(successuserdata, type);
      setUserVisible(false);
    };

    //实现点击不同的角色时，显示不同的角色描述
    function radiochang(e: RadioChangeEvent) {
      if (e.target.value === "Administrator") {
        setEidtroleselect(true);
      } else {
        setEidtroleselect(false);
      }
    }

    // 处理空字段，将其值设为 '--'
    const handleEmptyFields = (values: UserDataType): UserDataType => {
      return Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, value || '--'])
      ) as UserDataType;
    };


    return (
      <div>
        {type === 'modifyrole' ? (<OperateModal
          width={500}
          title={t('common.batchmodifyroles')}
          closable={false}
          open={userVisible}
          okText={t('common.confirm')}
          cancelText={t('common.cancel')}
          footer={[
            <Button key="submit" type="primary" onClick={() => handleConfirm()}>
              {t('common.confirm')}
            </Button>,
            <Button key="cancel" onClick={() => handleCancel()}>
              {t('common.cancel')}
            </Button>,
          ]}
        >
          <Form style={{ maxWidth: 600 }} ref={formRef} >
            <Form.Item
              colon={false}>
              <span>{t('common.selectedusers')}:</span>
              <span className="text-[#1890ff]">
                {/* {username.toString()} */}
                {userForm.username}
              </span>
            </Form.Item>
            <Form.Item
              name="role" colon={false}>
              <Radio.Group className={`${userInfoStyle.removeSingleChoiceInterval}`} block options={options} onChange={radiochang} />
            </Form.Item>
            <Form.Item
              label={''} name="comment" colon={false}>
              <RoleDescription modifyRoleSelect={eidtroleselect}></RoleDescription>
            </Form.Item>
          </Form>
        </OperateModal>) :
          (<OperateModal
            title={type === 'add' ? t('common.add') : t('common.edit') + '-' + userForm.username}
            closable={false}
            open={userVisible}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
            width={500}
            footer={[
              <Button key="submit" type="primary" onClick={() => handleConfirm()}>
                {t('common.confirm')}
              </Button>,
              <Button key="cancel" onClick={() => handleCancel()}>
                {t('common.cancel')}
              </Button>,
            ]}
          >
            <Form
              style={{ maxWidth: 600 }}
              ref={formRef}
            >
              {
                type === 'add' ? (<Form.Item
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 18 }}
                  name="username" label={`${t('tableItem.username')}*`} colon={false}>
                  <Input placeholder="input placeholder" />
                </Form.Item>) : (<Form.Item
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 18 }}
                  name="username" label={`${t('tableItem.username')}*`} colon={false}>
                  <Input disabled={true} ></Input>
                </Form.Item>)
              }
              <Form.Item
                name="name"
                label={`${t('tableItem.name')}`}
                colon={false}
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
              >
                <Input placeholder="input placeholder" />
              </Form.Item>
              <Form.Item
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                name="email"
                label={`${t('tableItem.email')}`}
                colon={false}
              >
                <Input placeholder="input placeholder" />
              </Form.Item>
              <Form.Item
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                name="number"
                label={`${t('tableItem.number')}`}
                colon={false}
              >
                <Input placeholder="input placeholder" />
              </Form.Item>
              <Form.Item
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                name="team"
                label={`${t('tableItem.team')}*`}
                colon={false}
              >
                <Select
                  style={{ width: 120 }}
                  defaultValue="team1"
                  allowClear
                  options={[
                    { value: 'team1', label: 'team1' },
                    { value: 'team2', label: 'team2' },
                  ]}
                  placeholder="select it"
                />
              </Form.Item>
              <Form.Item
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                label={`${t('tableItem.role')}*`}
                name="role" colon={false}>
                <Radio.Group className={`${userInfoStyle.removeSingleChoiceInterval}`} block options={[
                  { label: t('tableItem.administrator'), value: 'Administrator' },
                  { label: t('tableItem.normalusers'), value: 'Normal users' },
                ]} onChange={radiochang} />
              </Form.Item>
              <Form.Item
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 18 }}
                label={'  '}
                name="comment" colon={false}>
                <RoleDescription modifyRoleSelect={eidtroleselect} />
              </Form.Item>
            </Form>
          </OperateModal>)}
      </div>
    );
  }
);
UserModal.displayName = 'RuleModal';
export default UserModal ;
export type { ModalRef };

