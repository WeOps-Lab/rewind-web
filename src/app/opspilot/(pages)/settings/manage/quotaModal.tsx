import React, { useEffect, useState, useCallback } from 'react';
import { Form, Input, Select, Button, InputNumber, Radio, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import OperateModal from '@/components/operate-modal';
import { useTranslation } from '@/utils/i18n';
import useApiClient from '@/utils/request';
import Cookies from 'js-cookie';
import styles from './index.module.scss';

const { Option } = Select;

interface QuotaModalProps {
  visible: boolean;
  onConfirm: (values: any) => Promise<void>;
  onCancel: () => void;
  mode: 'add' | 'edit';
  initialValues?: any;
}

interface TargetOption {
  id: string;
  name: string;
}

const QuotaModal: React.FC<QuotaModalProps> = ({ visible, onConfirm, onCancel, mode, initialValues }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { get } = useApiClient();
  const [targetType, setTargetType] = useState<string>('user');
  const [userList, setUserList] = useState<TargetOption[]>([]);
  const [groupList, setGroupList] = useState<TargetOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [targetLoading, setTargetLoading] = useState<boolean>(false);

  const fetchData = useCallback(async (type: 'user' | 'group') => {
    setTargetLoading(true);
    try {
      if (type === 'user') {
        const userData = await get('/base/quota_rule/get_group_user/');
        setUserList(userData.map((user: any) => ({ id: user.username, name: user.username })));
      } else {
        const groupData = await get('/core/login_info/');
        const { group_list: groupListData } = groupData;
        setGroupList(groupListData.map((group: any) => ({ id: group.id, name: group.name })));
        const currentGroupId = Cookies.get('current_team');
        const currentGroup = groupListData.find((group: any) => group.id === currentGroupId);
        if (currentGroup) {
          form.setFieldsValue({ targetList: [currentGroup.id] });
        }
      }
    } finally {
      setTargetLoading(false);
    }
  }, [form, get]);

  useEffect(() => {
    if (visible) {
      if (targetType === 'user') {
        fetchData('user');
      } else if (targetType === 'group') {
        fetchData('group');
      }

      if (mode === 'edit' && initialValues) {
        form.setFieldsValue(initialValues);
        setTargetType(initialValues.targetType);
      } else if (mode === 'add') {
        form.resetFields();
        form.setFieldsValue({
          targetType: 'user',
          rule: 'uniform'
        });
      }
    }
  }, [visible, targetType, mode, initialValues, form, fetchData]);

  const handleTargetTypeChange = (value: string) => {
    setTargetType(value);
    if (value === 'user' && userList.length === 0) {
      fetchData('user');
    } else if (value === 'group' && groupList.length === 0) {
      fetchData('group');
    }
    form.setFieldsValue({
      rule: 'uniform',
      targetList: undefined
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      setLoading(true);
      onConfirm(values).finally(() => {
        setLoading(false);
      });
    }).catch((info) => {
      console.log('Validate Failed: ', info);
    });
  };

  return (
    <OperateModal
      title={mode === 'add' ? t('settings.manageQuota.form.add') : t('settings.manageQuota.form.edit')}
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          {t('common.cancel')}
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {t('common.confirm')}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" name="quota_form">
        <Form.Item
          label={t('settings.manageQuota.form.name')}
          name="name"
          rules={[{ required: true, message: `${t('common.inputRequired')}` }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={t('settings.manageQuota.form.target')} required>
          <Input.Group compact>
            <Form.Item
              name="targetType"
              noStyle
              rules={[{ required: true, message: `${t('common.selectMsg')}${t('settings.manageQuota.form.target')}` }]}
            >
              <Select style={{ width: '30%' }} onChange={handleTargetTypeChange}>
                <Option value="user">User</Option>
                <Option value="group">Group</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="targetList"
              noStyle
              rules={[{ required: true, message: `${t('common.selectMsg')}` }]}
            >
              <Select
                mode={targetType === 'user' ? 'multiple' : undefined}
                className={styles.multipleSelect}
                style={{ width: '70%' }}
                loading={targetLoading}
                disabled={targetLoading || targetType !== 'user'}>
                {(targetType === 'user' ? userList : groupList).map(item => (
                  <Option key={item.id} value={item.id}>{item.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Input.Group>
        </Form.Item>
        <Form.Item
          label={t('settings.manageQuota.form.rule')}
          name="rule"
          rules={[{ required: true, message: `${t('common.selectMsg')}` }]}>
          <Radio.Group disabled={targetType === 'user'}>
            <Radio value="uniform">
              {t('settings.manageQuota.form.uniform')}
              <Tooltip title={t('settings.manageQuota.form.uniformTooltip')}>
                <InfoCircleOutlined style={{ marginLeft: 8 }} />
              </Tooltip>
            </Radio>
            <Radio value="shared" style={{ marginLeft: 16 }}>
              {t('settings.manageQuota.form.shared')}
              <Tooltip title={t('settings.manageQuota.form.sharedTooltip')}>
                <InfoCircleOutlined style={{ marginLeft: 8 }} />
              </Tooltip>
            </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          label={t('settings.manageQuota.form.bot')}
          name="bots"
          rules={[{ required: true, message: `${t('common.inputRequired')}` }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label={t('settings.manageQuota.form.skill')}
          name="skills"
          rules={[{ required: true, message: `${t('common.inputRequired')}` }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label={t('settings.manageQuota.form.knowledgeBase')}
          name="file_size"
          rules={[{ required: true, message: `${t('common.inputRequired')}` }]}
        >
          <InputNumber
            min={0}
            addonAfter={
              <Form.Item name="unit" noStyle initialValue="MB">
                <Select>
                  <Option value="MB">MB</Option>
                  <Option value="GB">GB</Option>
                </Select>
              </Form.Item>
            }
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </OperateModal>
  );
};

export default QuotaModal;
