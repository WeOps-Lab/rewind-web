'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import BaseTaskForm, { BaseTaskRef } from './baseTask';
import styles from '../index.module.scss';
import { useTranslation } from '@/utils/i18n';
import { useTaskForm } from '../hooks/useTaskForm';
import { TreeNode } from '@/app/cmdb/types/autoDiscovery';
import {
  ENTER_TYPE,
  SNMP_FORM_INITIAL_VALUES,
  createTaskValidationRules,
} from '@/app/cmdb/constants/professCollection';
import { Form, Spin, Input, Select, Collapse, InputNumber } from 'antd';

interface SNMPTaskFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  selectedNode: TreeNode;
  modelId: string;
  editId?: number | null;
}

const SNMPTask: React.FC<SNMPTaskFormProps> = ({
  onClose,
  onSuccess,
  selectedNode,
  modelId,
  editId,
}) => {
  const { t } = useTranslation();
  const baseRef = useRef<BaseTaskRef>(null);
  const [snmpVersion, setSnmpVersion] = useState('V2');
  const [securityLevel, setSecurityLevel] = useState('authNoPriv');

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
    initialValues: SNMP_FORM_INITIAL_VALUES,
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
        instances: instance?.origin && [instance.origin],
        input_method: values.enterType === ENTER_TYPE.AUTOMATIC ? 0 : 1,
        access_point: values.accessPoint || {},
        timeout: values.timeout || 600,
        scan_cycle: formatCycleValue(values),
        model_id: modelId,
        driver_type: driverType,
        task_type: 'snmp',
        credential: {
          username: values.username,
          password: values.password,
          port: values.port,
          ssl: values.sslVerify,
        },
      };
    },
  });

  const rules: any = React.useMemo(
    () => createTaskValidationRules({ t, form, taskType: 'snmp' as const }),
    [t, form]
  );

  useEffect(() => {
    const initForm = async () => {
      if (editId) {
        const values = await fetchTaskDetail(editId);
        form.setFieldsValue(values);
      } else {
        form.setFieldsValue(SNMP_FORM_INITIAL_VALUES);
      }
    };
    initForm();
  }, [modelId]);

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 6 }}
        onFinish={onFinish}
        initialValues={SNMP_FORM_INITIAL_VALUES}
      >
        <BaseTaskForm
          ref={baseRef}
          nodeId={selectedNode.id}
          modelId={modelId}
          onClose={onClose}
          submitLoading={submitLoading}
          instPlaceholder={`${t('common.select')}${t('Collection.SNMPTask.chooseSNMP')}`}
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
                label={t('Collection.SNMPTask.version')}
                name="snmpVersion"
                rules={rules.snmpVersion}
                required
              >
                <Select value={snmpVersion} onChange={setSnmpVersion}>
                  <Select.Option value="V2">V2</Select.Option>
                  <Select.Option value="V2C">V2C</Select.Option>
                  <Select.Option value="V3">V3</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="port"
                label={t('Collection.SNMPTask.port')}
                rules={rules.port}
              >
                <InputNumber
                  min={1}
                  max={65535}
                  placeholder={t('common.inputMsg')}
                  className="w-32"
                  defaultValue={161}
                />
              </Form.Item>

              {(snmpVersion === 'V2' || snmpVersion === 'V2C') && (
                <Form.Item
                  label={t('Collection.SNMPTask.communityString')}
                  name="communityString"
                  rules={rules.communityString}
                  required
                >
                  <Input.Password placeholder={t('common.inputMsg')} />
                </Form.Item>
              )}

              {snmpVersion === 'V3' && (
                <>
                  <Form.Item
                    label={t('Collection.SNMPTask.securityLevel')}
                    name="securityLevel"
                    required
                  >
                    <Select value={securityLevel} onChange={setSecurityLevel}>
                      <Select.Option value="authNoPriv">
                        authNoPriv
                      </Select.Option>
                      <Select.Option value="authPriv">authPriv</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label={t('Collection.SNMPTask.userName')}
                    name="userName"
                    rules={rules.userName}
                    required
                  >
                    <Input placeholder={t('common.inputMsg')} />
                  </Form.Item>

                  <Form.Item
                    label={t('Collection.SNMPTask.authPassword')}
                    name="authPassword"
                    rules={rules.authPassword}
                    required
                  >
                    <Input.Password placeholder={t('common.inputMsg')} />
                  </Form.Item>

                  <Form.Item
                    label={t('Collection.SNMPTask.hashAlgorithm')}
                    name="hashAlgorithm"
                    required
                  >
                    <Select defaultValue="MD5">
                      <Select.Option value="MD5">MD5</Select.Option>
                      <Select.Option value="SHA">SHA</Select.Option>
                    </Select>
                  </Form.Item>

                  {securityLevel === 'authPriv' && (
                    <>
                      <Form.Item
                        label={t('Collection.SNMPTask.encryptAlgorithm')}
                        name="encryptionAlgorithm"
                        required
                      >
                        <Select defaultValue="AES">
                          <Select.Option value="AES">AES</Select.Option>
                          <Select.Option value="DES">DES</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label={t('Collection.SNMPTask.encryptKey')}
                        name="encryptKey"
                        rules={rules.encryptKey}
                        required
                      >
                        <Input.Password placeholder={t('common.inputMsg')} />
                      </Form.Item>
                    </>
                  )}
                </>
              )}
            </Collapse.Panel>
          </Collapse>
        </BaseTaskForm>
      </Form>
    </Spin>
  );
};

export default SNMPTask;
