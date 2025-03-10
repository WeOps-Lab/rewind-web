'use client';

import React from 'react';
import { CaretRightOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import { CYCLE_OPTIONS } from '@/app/cmdb/constants/professCollection';
import { createTaskValidationRules } from '@/app/cmdb/constants/professCollection';
import styles from '../index.module.scss';
import {
  Form,
  Radio,
  TimePicker,
  InputNumber,
  Space,
  Collapse,
  Tooltip,
  Input,
  Button,
} from 'antd';
  
interface BaseTaskFormProps {
  children?: React.ReactNode;
  showAdvanced?: boolean;
  timeoutProps?: {
    min?: number;
    defaultValue?: number;
    addonAfter?: string;
  };
  modelId: string;
  userList: any[];
  organizationList: any[];
  submitLoading?: boolean;
  onClose: () => void;
  onTest?: () => void;
  onFieldSuccess?: () => void;
  showFieldModal?: (instId?: string) => void;
}

const BaseTaskForm: React.FC<BaseTaskFormProps> = ({
  children,
  showAdvanced = true,
  submitLoading,
  timeoutProps = {
    min: 0,
    defaultValue: 600,
    addonAfter: '',
  },
  onClose,
  onTest,
}) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  
  const rules = React.useMemo(
    () => createTaskValidationRules({ t, form }),
    [t, form]
  );

  return (
    <>
      <div className={styles.sectionTitle}>{t('Collection.baseSetting')}</div>
      <div className={styles.mainContent}>
        <Form.Item
          name="taskName"
          label={t('Collection.taskNameLabel')}
          rules={rules.taskName}
        >
          <Input placeholder={t('Collection.taskNamePlaceholder')} />
        </Form.Item>
        <Form.Item
          label={t('Collection.cycle')}
          name="cycle"
          rules={rules.cycle}
        >
          <Radio.Group>
            <div className="space-y-3">
              <div className="flex items-center">
                <Radio value={CYCLE_OPTIONS.DAILY}>
                  {t('Collection.dailyAt')}
                  <Form.Item
                    name="dailyTime"
                    noStyle
                    dependencies={['cycle']}
                    rules={rules.dailyTime}
                  >
                    <TimePicker
                      className="w-40 ml-2"
                      format="HH:mm"
                      placeholder={t('Collection.selectTime')}
                    />
                  </Form.Item>
                </Radio>
              </div>
              <div className="flex items-center">
                <Radio value={CYCLE_OPTIONS.INTERVAL}>
                  <Space>
                    {t('Collection.k8sTask.everyMinute')}
                    <Form.Item
                      name="intervalValue"
                      noStyle
                      dependencies={['cycle']}
                      rules={rules.intervalValue}
                    >
                      <InputNumber
                        className="w-20"
                        min={5}
                        placeholder={t('Collection.k8sTask.minutePlaceholder')}
                      />
                    </Form.Item>
                    {t('Collection.k8sTask.executeInterval')}
                  </Space>
                </Radio>
              </div>
              <Radio value={CYCLE_OPTIONS.ONCE}>
                {t('Collection.k8sTask.executeOnce')}
              </Radio>
            </div>
          </Radio.Group>
        </Form.Item>

        {children}

        {showAdvanced && (
          <Collapse
            ghost
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
                  {t('Collection.advanced')}
                </div>
              }
              key="advanced"
            >
              <Form.Item
                label={
                  <span>
                    {t('Collection.timeout')}
                    <Tooltip title={t('Collection.timeoutTooltip')}>
                      <QuestionCircleOutlined className="ml-1" />
                    </Tooltip>
                  </span>
                }
                name="timeout"
                rules={rules.timeout}
              >
                <InputNumber
                  className="w-32"
                  min={timeoutProps.min}
                  defaultValue={timeoutProps.defaultValue}
                  addonAfter={timeoutProps.addonAfter}
                />
              </Form.Item>
            </Collapse.Panel>
          </Collapse>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        {onTest && (
          <Button
            className="!rounded-button whitespace-nowrap"
            onClick={onTest}
          >
            {t('Collection.test')}
          </Button>
        )}
        <Button
          type="primary"
          htmlType="submit"
          className="!rounded-button whitespace-nowrap"
          loading={submitLoading}
        >
          {t('Collection.confirm')}
        </Button>
        <Button
          className="!rounded-button whitespace-nowrap"
          onClick={onClose}
          disabled={submitLoading}
        >
          {t('Collection.cancel')}
        </Button>
      </div>
    </>
  );
};

export default BaseTaskForm;
