'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/utils/i18n';
import { useCommon } from '@/app/cmdb/context/common';
import { FieldModalRef } from '@/app/cmdb/types/assetManage';
import useApiClient from '@/utils/request';
import FieldModal from '@/app/cmdb/(pages)/assetData/list/fieldModal';
import { Form, Select, Button, Space, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import BaseTaskForm from './baseTask';
import { useTaskForm } from '../hooks/useTaskForm';
import {
  FORM_INITIAL_VALUES,
  createTaskValidationRules,
} from '@/app/cmdb/constants/professCollection';
interface K8sTaskFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  modelId: string;
  editId?: number | null;
}

const K8sTaskForm: React.FC<K8sTaskFormProps> = ({
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
  const [instOptLoading, setOptLoading] = useState(false);
  const [instOptions, setOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const {
    form,
    loading,
    submitLoading,
    fetchTaskDetail,
    formatCycleValue,
    onFinish,
  } = useTaskForm({
    modelId,
    editId,
    onSuccess,
    onClose,
    initialValues: FORM_INITIAL_VALUES,
    formatValues: (values) => ({
      name: values.taskName,
      instances: [instOptions.find((item) => item.value === values.inst)],
      timeout: values.timeout || 60,
      input_method: 0,
      task_type: 'k8s',
      driver_type: 'protocol',
      ip_range: '',
      scan_cycle: formatCycleValue(values),
      model_id: modelId,
      params: {},
    }),
  });

  const rules = React.useMemo(
    () => createTaskValidationRules({ t, form, taskType: 'k8s' }),
    [t, form]
  );

  const fetchOptions = async () => {
    try {
      setOptLoading(true);
      const data = await post('/cmdb/api/instance/search/', {
        model_id: modelId,
        page: 1,
        page_size: 10000,
      });
      setOptions(
        data.insts.map((item: any) => ({
          label: item.inst_name,
          value: item._id,
          ...item,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch inst:', error);
    } finally {
      setOptLoading(false);
    }
  };

  useEffect(() => {
    const initForm = async () => {
      if (editId) {
        const values = await fetchTaskDetail(editId);
        console.log('values:', values);
        form.setFieldsValue(values);
      } else {
        form.setFieldsValue(FORM_INITIAL_VALUES);
      }
    };
    initForm();
    fetchOptions();
  }, [modelId]);

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

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 5 }}
        onFinish={onFinish}
        initialValues={FORM_INITIAL_VALUES}
      >
        <BaseTaskForm
          modelId={modelId}
          onClose={onClose}
          submitLoading={submitLoading}
          userList={userList}
          organizationList={organizationList}
          onFieldSuccess={fetchOptions}
          timeoutProps={{
            min: 0,
            defaultValue: 60,
            addonAfter: t('Collection.k8sTask.second'),
          }}
          showFieldModal={showFieldModal}
        >
          <Form.Item label={t('Collection.k8sTask.selectK8S')} required>
            <Space>
              <Form.Item name="inst" rules={rules.inst} noStyle>
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

export default K8sTaskForm;
