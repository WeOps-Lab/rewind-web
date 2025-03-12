'use client';

import React, { useEffect, useRef } from 'react';
import BaseTaskForm, { BaseTaskRef } from './baseTask';
import { useTranslation } from '@/utils/i18n';
import { Form, Spin } from 'antd';
import { useTaskForm } from '../hooks/useTaskForm';
import { K8S_FORM_INITIAL_VALUES } from '@/app/cmdb/constants/professCollection';
import { TreeNode } from '@/app/cmdb/types/autoDiscovery';

interface K8sTaskFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  selectedNode: TreeNode;
  modelId: string;
  editId?: number | null;
}

const K8sTaskForm: React.FC<K8sTaskFormProps> = ({
  onClose,
  onSuccess,
  selectedNode,
  modelId,
  editId,
}) => {
  const { t } = useTranslation();
  const baseRef = useRef<BaseTaskRef>(null);

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
    initialValues: K8S_FORM_INITIAL_VALUES,
    onSuccess,
    onClose,
    formatValues: (values) => {
      const instance = baseRef.current?.instOptions.find(
        (item: any) => item.value === values.instId
      );
      const driverType = selectedNode.tabItems?.find(
        (item) => item.id === modelId
      )?.type;

      return {
        name: values.taskName,
        instances: [instance],
        timeout: values.timeout || 60,
        driver_type: driverType,
        scan_cycle: formatCycleValue(values),
        model_id: modelId,
        task_type: 'k8s',
        input_method: 0,
        ip_range: '',
        params: {},
      };
    },
  });

  useEffect(() => {
    const initForm = async () => {
      if (editId) {
        const values = await fetchTaskDetail(editId);
        form.setFieldsValue(values);
      } else {
        form.setFieldsValue(K8S_FORM_INITIAL_VALUES);
      }
    };
    initForm();
  }, [modelId]);

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 5 }}
        onFinish={onFinish}
        initialValues={K8S_FORM_INITIAL_VALUES}
      >
        <BaseTaskForm
          ref={baseRef}
          nodeId={selectedNode.id}
          modelId={modelId}
          onClose={onClose}
          submitLoading={submitLoading}
          instPlaceholder={`${t('common.select')}${t('Collection.k8sTask.selectK8S')}`}
          executeIntervalLabel={t('Collection.k8sTask.executeInterval')}
          timeoutProps={{
            min: 0,
            defaultValue: 60,
            addonAfter: t('Collection.k8sTask.second'),
          }}
        ></BaseTaskForm>
      </Form>
    </Spin>
  );
};

export default K8sTaskForm;
