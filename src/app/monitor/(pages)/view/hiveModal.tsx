'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { ModalRef } from '@/app/monitor/types';
import { MetricItem, NodeThresholdColor } from '@/app/monitor/types/monitor';
import OperateModal from '@/components/operate-modal';
import {
  Button,
  Form,
  Select,
  InputNumber,
  ColorPicker
} from 'antd';
import { useTranslation } from '@/utils/i18n';
import type { FormProps } from 'antd';
import { AggregationColor } from 'antd/es/color-picker/color';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { cloneDeep } from 'lodash';
const { Option } = Select;

interface HiveModalProps {
  [key: string]: any
}

const HiveModal = forwardRef<ModalRef, HiveModalProps>(
  ({ onConfirm }, ref) => {
    const { t } = useTranslation();
    const [title, setTitle] = useState<string>('');
    const [visible, setVisible] = useState<boolean>(false);
    const [hiveConfig, setHiveConfig] = useState<any>(null);
    const [queryMetric, setQueryMetric] = useState<string | null>();
    const [thresholdColors, setThresholdColors] = useState<NodeThresholdColor[]>([
      { name: 'unavailable', value: 70, color: '#ff4d4f' },
      { name: 'inactive', value: 30, color: '#faad14' },
      { name: 'normal', value: 0, color: '#52c41a' },
    ]);

    useImperativeHandle(ref, () => ({
      showModal: ({ title, form }) => {
        // 开启弹窗的交互
        setVisible(true);
        setTitle(title);
        setHiveConfig(form);
      },
    }));

    const handleSubmit = () => {
      console.log(hiveConfig);
      onConfirm(queryMetric,thresholdColors);
      setVisible(false);
    }

    const handleCancel = () => {
      setVisible(false);
    };

    const onFinish: FormProps<any>['onFinish'] = (values) => {
      console.log('Success:', values);
    };

    const onFinishFailed: FormProps<any>['onFinishFailed'] = (errorInfo) => {
      console.log('Failed:', errorInfo);
    };

    const handleQueryMetricChange = (id: string) => {
      setQueryMetric(id);
    };

    const onChange = (value: number, index: number) => {
      const list = cloneDeep(thresholdColors);
      list[index].value = value;
      setThresholdColors(list);
      console.log(list)
    };

    const handleEnumColorChange = (value: AggregationColor, index: number) => {
      const list = cloneDeep(thresholdColors);
      list[index].color = value.toHexString();
      setThresholdColors(list);
      console.log(list)
    }

    return (
      <>
        <OperateModal
          visible={visible}
          title={title}
          width={500}
          onCancel={handleCancel}
          footer={
            <div>
              <Button
                // disabled={!checkedFields.length}
                className="mr-[10px]"
                type="primary"
                onClick={handleSubmit}
              >
                {t('common.confirm')}
              </Button>
              <Button onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          }
        >
          <Form
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 500 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item<any>
              label={t('monitor.views.displayIndicators')}
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Select
                className='text-center w-[160px] '
                value={queryMetric}
                suffixIcon={null}
                placeholder="请选择"
                onChange={handleQueryMetricChange}
              >
                {hiveConfig?.map((item: MetricItem, index: number) => (
                  <Option key={index} value={item.name}>
                    {item.display_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item<any>
              label={t('monitor.events.thresholdColor')}
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <div className='flex justify-center flex-col'>
                {thresholdColors?.map((item, index) => {
                  return (
                    <div className='flex justify-start items-center mb-2' key={item.value}>
                      <ColorPicker
                        className="ml-2 mr-2 h-4"
                        size='small'
                        value={item.color}
                        onChange={(value) => {
                          handleEnumColorChange(value, index)
                        }}
                      />
                      <InputNumber value={item.value} className='w-[60%] mr-2' min={0} max={100} onChange={(value) => onChange(value as number, index)} />
                      <Button className='mr-2' icon={<PlusOutlined />} />
                      {!!index && (
                        <Button icon={<MinusOutlined />} />
                      )}
                    </div>
                  )
                })}
              </div>
            </Form.Item>
          </Form>
        </OperateModal>
      </>
    )
  }
);

HiveModal.displayName = 'HiveModal';
export default HiveModal;