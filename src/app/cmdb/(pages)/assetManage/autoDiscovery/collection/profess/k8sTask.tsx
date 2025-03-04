'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/utils/i18n';
import { useCommon } from '@/app/cmdb/context/common';
import { withCommon } from '@/app/cmdb/context/withCommon';
import { FieldModalRef } from '@/app/cmdb/types/assetManage';
import useApiClient from '@/utils/request';
import FieldModal from '@/app/cmdb/(pages)/assetData/list/fieldModal';
import styles from './index.module.scss';
import dayjs from 'dayjs';
import {
  Form,
  Input,
  Radio,
  Select,
  Button,
  Tooltip,
  Space,
  TimePicker,
  Collapse,
  InputNumber,
  message,
  Spin,
} from 'antd';
import {
  QuestionCircleOutlined,
  CaretRightOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  CYCLE_OPTIONS,
  FORM_INITIAL_VALUES,
  createValidationRules,
} from './constants';

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
  const { post, get, put } = useApiClient();
  const commonContext = useCommon();
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList = authList.current;
  const users = useRef(commonContext?.userList || []);
  const userList = users.current;
  const fieldRef = useRef<FieldModalRef>(null);
  const rules = React.useMemo(() => createValidationRules(t), [t]);
  const [form] = Form.useForm();
  const [instOptLoading, setK8sOptLoading] = useState(false);
  const [instOptions, setK8sOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const fetchK8sOptions = async () => {
    try {
      setK8sOptLoading(true);
      const data = await post('/cmdb/api/instance/search/', {
        model_id: modelId,
        page: 1,
        page_size: 10000,
      });
      setK8sOptions(
        data.insts.map((item: any) => ({
          label: item.inst_name,
          value: item._id,
          ...item,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch inst:', error);
    } finally {
      setK8sOptLoading(false);
    }
  };

  const fetchTaskDetail = async (id: number) => {
    try {
      setLoading(true);
      const data = await get(`/cmdb/api/collect/${id}/`);
      const cycleValue = data.scan_cycle?.value_type || CYCLE_OPTIONS.ONCE;
      const formData = {
        ...data,
        name: data.name,
        inst: data.instances?.[0]?._id,
        timeout: data.timeout,
        cycle: cycleValue,
        ...(cycleValue === CYCLE_OPTIONS.DAILY && {
          dailyTime: dayjs(data.scan_cycle.value, 'HH:mm'),
        }),
        ...(cycleValue === CYCLE_OPTIONS.INTERVAL && {
          intervalMinutes: Number(data.scan_cycle.value),
        }),
      };
      return formData;
    } catch (error) {
      console.error('Failed to fetch task detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initForm = async () => {
      if (editId) {
        const values = await fetchTaskDetail(editId);
        form.setFieldsValue(values);
      } else {
        form.setFieldsValue(FORM_INITIAL_VALUES);
      }
    };
    initForm();
    fetchK8sOptions();
  }, [modelId]);

  const showFieldModal = async () => {
    try {
      const attrList = await get(`/cmdb/api/model/${modelId}/attr_list/`);
      fieldRef.current?.showModal({
        type: 'add',
        attrList,
        formInfo: {},
        subTitle: '',
        title: t('add'),
        model_id: modelId,
        list: [],
      });
    } catch (error) {
      console.error('Failed to get attr list:', error);
    }
  };

  const formatCycleValue = (values: any) => {
    const { cycle, intervalMinutes } = values;
    if (cycle === CYCLE_OPTIONS.ONCE) {
      return {
        value_type: 'close',
        value: '',
      };
    } else if (cycle === CYCLE_OPTIONS.INTERVAL && intervalMinutes) {
      return {
        value_type: 'cycle',
        value: intervalMinutes,
      };
    } else if (cycle === CYCLE_OPTIONS.DAILY) {
      return {
        value_type: 'timing',
        value: values.dailyTime?.format('HH:mm') || '',
      };
    }
    return {
      value_type: 'close',
      value: '',
    };
  };

  const onFinish = async (values: any) => {
    try {
      const params = {
        name: values.name,
        instances: [instOptions.find((item) => item.value === values.inst)],
        timeout: values.timeout || 60,
        input_method: 0,
        task_type: 'k8s',
        driver_type: 'protocol',
        ip_range: '',
        scan_cycle: formatCycleValue(values),
        model_id: modelId,
        params: {},
      };

      if (editId) {
        await put(`/cmdb/api/collect/${editId}/`, params);
      } else {
        await post('/cmdb/api/collect/', params);
      }
      message.success(t('successfullyAdded'));
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 5 }}
        onFinish={onFinish}
        initialValues={{ ...FORM_INITIAL_VALUES }}
      >
        <div className={styles.sectionTitle}>
          {t('Collection.k8sTask.baseSetting')}
        </div>
        <div className={styles.mainContent}>
          <Form.Item
            label={t('Collection.k8sTask.name')}
            name="name"
            rules={rules.name}
          >
            <Input
              placeholder={t('Collection.k8sTask.namePlaceholder')}
              className="max-w-md"
            />
          </Form.Item>

          <Form.Item
            label={t('Collection.k8sTask.scanCycle')}
            name="cycle"
            rules={rules.cycle}
          >
            <Radio.Group>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Radio value={CYCLE_OPTIONS.DAILY}>
                    {t('Collection.dailyAt')}
                    <Form.Item name="dailyTime" noStyle>
                      <TimePicker className="w-40 ml-2" format="HH:mm" />
                    </Form.Item>
                  </Radio>
                </div>
                <div className="flex items-center">
                  <Radio value={CYCLE_OPTIONS.INTERVAL}>
                    <Space>
                      {t('Collection.k8sTask.everyMinute')}
                      <Form.Item
                        name="intervalMinutes"
                        noStyle
                        rules={rules.intervalMinutes}
                      >
                        <InputNumber
                          className="w-20"
                          min={5}
                          placeholder={t(
                            'Collection.k8sTask.minutePlaceholder'
                          )}
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
                  min={0}
                  addonAfter={t('Collection.k8sTask.second')}
                />
              </Form.Item>
            </Collapse.Panel>
          </Collapse>
        </div>

        <Form.Item>
          <div className="flex justify-end space-x-4">
            <Button
              type="primary"
              htmlType="submit"
              className="!rounded-button whitespace-nowrap"
            >
              {t('Collection.confirm')}
            </Button>
            <Button
              className="!rounded-button whitespace-nowrap"
              onClick={onClose}
            >
              {t('Collection.cancel')}
            </Button>
          </div>
        </Form.Item>
      </Form>

      <FieldModal
        ref={fieldRef}
        userList={userList}
        organizationList={organizationList}
        onSuccess={fetchK8sOptions}
      />
    </Spin>
  );
};

export default withCommon(K8sTaskForm);
