'use client';

import React, { useEffect, useRef } from 'react';
import BaseTaskForm, { BaseTaskRef } from './baseTask';
import styles from '../index.module.scss';
import { useTranslation } from '@/utils/i18n';
import { useTaskForm } from '../hooks/useTaskForm';
import { CaretRightOutlined } from '@ant-design/icons';
import { TreeNode } from '@/app/cmdb/types/autoDiscovery';
import { Form, Spin, Input, Switch, Collapse } from 'antd';
import {
  ENTER_TYPE,
  VM_FORM_INITIAL_VALUES,
  createTaskValidationRules,
} from '@/app/cmdb/constants/professCollection';

interface VMTaskFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  selectedNode: TreeNode;
  modelId: string;
  editId?: number | null;
}

const VMTask: React.FC<VMTaskFormProps> = ({
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
    initialValues: VM_FORM_INITIAL_VALUES,
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
        input_method: values.enterType === ENTER_TYPE.AUTOMATIC ? 0 : 1,
        access_point: values.accessPoint || {},
        timeout: values.timeout || 600,
        scan_cycle: formatCycleValue(values),
        model_id: modelId,
        driver_type: driverType,
        task_type: 'vm',
        credential: {
          account: values.account,
          password: values.password,
          port: values.port,
          ssl_verify: values.sslVerify,
        },
      };
    },
  });

  const rules: any = React.useMemo(
    () => createTaskValidationRules({ t, form, taskType: 'vm' }),
    [t, form]
  );

  useEffect(() => {
    const initForm = async () => {
      if (editId) {
        const values = await fetchTaskDetail(editId);
        form.setFieldsValue(values);
      } else {
        form.setFieldsValue(VM_FORM_INITIAL_VALUES);
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
        initialValues={VM_FORM_INITIAL_VALUES}
      >
        <BaseTaskForm
          ref={baseRef}
          nodeId={selectedNode.id}
          modelId={modelId}
          onClose={onClose}
          submitLoading={submitLoading}
          instPlaceholder={`${t('common.select')}${t('Collection.VMTask.chooseVCenter')}`}
          executeIntervalLabel={t('Collection.executeInterval')}
          timeoutProps={{
            min: 0,
            defaultValue: 600,
            addonAfter: t('Collection.k8sTask.second'),
          }}
        >
          <Collapse
            ghost
            defaultActiveKey={['credential']}
            expandIcon={({ isActive }) => (
              <CaretRightOutlined
                rotate={isActive ? 90 : 0}
                className="text-base"
              />
            )}
          >
            <Collapse.Panel
              header={
                <div className={styles.panelHeader}>
                  {t('Collection.credential')}
                </div>
              }
              key="credential"
            >
              <Form.Item
                name="account"
                label={t('Collection.VMTask.account')}
                rules={rules.account}
              >
                <Input placeholder={t('common.inputMsg')} />
              </Form.Item>

              <Form.Item
                name="password"
                label={t('Collection.VMTask.password')}
                rules={rules.password}
              >
                <Input.Password placeholder={t('common.inputMsg')} />
              </Form.Item>

              <Form.Item
                name="port"
                label={t('Collection.VMTask.port')}
                rules={rules.port}
              >
                <Input
                  placeholder={t('common.inputMsg')}
                  className="w-32"
                  defaultValue="443"
                />
              </Form.Item>

              <Form.Item
                name="sslVerify"
                label={t('Collection.VMTask.sslVerify')}
                valuePropName="checked"
                className="mb-0"
                rules={rules.sslVerify}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Collapse.Panel>
          </Collapse>
        </BaseTaskForm>
      </Form>
    </Spin>
  );
};

export default VMTask;
