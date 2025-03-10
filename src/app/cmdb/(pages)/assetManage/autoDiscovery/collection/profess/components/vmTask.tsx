'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Form,
  Radio,
  Button,
  Tooltip,
  Spin,
  message,
  Collapse,
  Input,
  Switch,
  Space,
  Select,
} from 'antd';
import {
  QuestionCircleOutlined,
  CaretRightOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import useApiClient from '@/utils/request';
import BaseTaskForm from './baseTask';
import { useTaskForm } from '../hooks/useTaskForm';
import {
  CYCLE_OPTIONS,
  ENTER_TYPE,
  ADD_FORM_INITIAL_VALUES,
  createTaskValidationRules,
} from '@/app/cmdb/constants/professCollection';
import { FieldModalRef } from '@/app/cmdb/types/assetManage';
import { useCommon } from '@/app/cmdb/context/common';
import FieldModal from '@/app/cmdb/(pages)/assetData/list/fieldModal';

interface AddTaskFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  modelId: string;
  editId?: number | null;
}

const VMTask: React.FC<AddTaskFormProps> = ({
  onClose,
  onSuccess,
  modelId,
  editId,
}) => {
  const { t } = useTranslation();
  const { post, get } = useApiClient();
  const commonContext = useCommon();
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList = authList.current;
  const users = useRef(commonContext?.userList || []);
  const userList = users.current;
  const fieldRef = useRef<FieldModalRef>(null);
  const [instOptLoading, setInstOptLoading] = useState(false);
  const [instOptions, setInstOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const { form, loading, submitLoading, fetchTaskDetail, onFinish } =
    useTaskForm({
      modelId,
      editId,
      onSuccess,
      onClose,
      initialValues: ADD_FORM_INITIAL_VALUES,
      formatValues: (values) => ({
        name: values.taskName,
        input_method: values.enterType === ENTER_TYPE.AUTOMATIC ? 0 : 1,
        vcenter: values.inst,
        proxy: values.proxy,
        account: values.account,
        password: values.password,
        port: values.port,
        ssl_verify: values.sslVerify,
        timeout: values.timeout,
        scan_cycle: {
          value_type: values.cycle,
          value:
            values.cycle === CYCLE_OPTIONS.DAILY
              ? values.dailyTime?.format('HH:mm')
              : values.cycle === CYCLE_OPTIONS.INTERVAL
                ? values.everyHours
                : '',
        },
        model_id: modelId,
        task_type: 'inst',
        driver_type: 'protocol',
      }),
    });
    
  const rules: any = React.useMemo(
    () => createTaskValidationRules({ t, form, taskType: 'vm' }),
    [t, form]
  );

  const fetchOptions = async () => {
    try {
      setInstOptLoading(true);
      const data = await post('/cmdb/api/instance/search/', {
        model_id: modelId,
        page: 1,
        page_size: 10000,
      });
      setInstOptions(
        data.insts.map((item: any) => ({
          label: item.inst_name,
          value: item._id,
          ...item,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch inst:', error);
    } finally {
      setInstOptLoading(false);
    }
  };

  const showFieldModal = async () => {
    try {
      const attrList = await get(`/cmdb/api/model/${modelId}/attr_list/`);
      fieldRef.current?.showModal({
        type: 'add',
        attrList,
        formInfo: {},
        subTitle: '',
        title: t('common.addNew'),
        model_id: modelId,
        list: [],
      });
    } catch (error) {
      console.error('Failed to get attr list:', error);
    }
  };

  useEffect(() => {
    const initForm = async () => {
      if (editId) {
        const values = await fetchTaskDetail(editId);
        form.setFieldsValue(values);
      } else {
        form.setFieldsValue(ADD_FORM_INITIAL_VALUES);
      }
    };
    initForm();
    fetchOptions();
  }, [modelId]);

  const handleTest = async () => {
    try {
      const fields = ['inst', 'proxy', 'account', 'password', 'port'];
      const values = await form.validateFields(fields);

      await post('/cmdb/api/collect/test_connection/', {
        ...values,
        ssl_verify: form.getFieldValue('sslVerify'),
      });
      message.success(t('common.testSuccess'));
    } catch {
      message.error(t('common.testFailed'));
    }
  };

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 5 }}
        onFinish={onFinish}
        initialValues={ADD_FORM_INITIAL_VALUES}
      >
        <BaseTaskForm
          modelId={modelId}
          onClose={onClose}
          submitLoading={submitLoading}
          onTest={handleTest}
          userList={userList}
          organizationList={organizationList}
          onFieldSuccess={fetchOptions}
          showFieldModal={showFieldModal}
        >
          <Form.Item
            name="enterType"
            label={
              <span>
                {t('Collection.VMTask.enterType')}
                <Tooltip title={t('Collection.VMTask.enterTypeTooltip')}>
                  <QuestionCircleOutlined className="ml-1 text-gray-400" />
                </Tooltip>
              </span>
            }
            rules={rules.enterType}
          >
            <Radio.Group>
              <Radio value={ENTER_TYPE.AUTOMATIC}>
                {t('Collection.VMTask.automatic')}
              </Radio>
              <Radio value={ENTER_TYPE.APPROVAL}>
                {t('Collection.VMTask.approvalRequired')}
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="inst"
            label={t('Collection.VMTask.chooseVCenter')}
            rules={rules.inst}
          >
            <Space>
              <Form.Item name="inst" rules={[{ required: true }]} noStyle>
                <Select
                  style={{ width: 400 }}
                  placeholder={t('Collection.k8sTask.selectK8sPlaceholder')}
                  options={instOptions}
                  loading={instOptLoading}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={showFieldModal}
              />
            </Space>
          </Form.Item>

          <Form.Item
            name="proxy"
            label={t('Collection.VMTask.proxy')}
            rules={rules.proxy}
          >
            <Input defaultValue="Direct" />
          </Form.Item>

          <Collapse
            ghost
            defaultActiveKey={['credential']}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
          >
            <Collapse.Panel
              header={
                <div className="text-sm font-medium">
                  {t('Collection.VMTask.credential')}
                </div>
              }
              key="credential"
            >
              <Form.Item
                name="account"
                label={t('Collection.VMTask.account')}
                rules={rules.account}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="password"
                label={t('Collection.VMTask.password')}
                rules={rules.password}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="port"
                label={t('Collection.VMTask.port')}
                rules={rules.port}
              >
                <Input className="w-32" defaultValue="443" />
              </Form.Item>
              <Form.Item
                name="sslVerify"
                label={t('Collection.VMTask.sslVerify')}
                valuePropName="checked"
                rules={rules.sslVerify}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Collapse.Panel>
          </Collapse>
        </BaseTaskForm>
      </Form>
      <FieldModal
        ref={fieldRef}
        userList={userList}
        organizationList={organizationList}
        onSuccess={fetchOptions}
      />
    </Spin>
  );
};

export default VMTask;
