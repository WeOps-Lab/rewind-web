'use client';

import React from 'react';
import {
  Form,
  Modal,
  Input,
  Radio,
  Switch,
  Button,
  Tooltip,
  TimePicker,
  Collapse,
} from 'antd';
import {
  QuestionCircleOutlined,
  PlusOutlined,
  CaretRightOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import styles from './index.module.scss';

interface AddTaskProps {
  visible: boolean;
  onClose: () => void;
}

const { Panel } = Collapse;

const AddTask: React.FC<AddTaskProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const onFinish = () => {
    onClose();
  };

  return (
    <Modal
      title={t('Collection.addTaskTitle')}
      open={visible}
      footer={null}
      onCancel={onClose}
      destroyOnClose
      width={800}
      styles={{ body: { overflowY: 'auto', maxHeight: 'calc(80vh - 108px)' } }}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 4 }}
        onFinish={onFinish}
        className="mr-4"
      >
        <div className={styles.sectionTitle}>{t('Collection.baseSetting')}</div>
        <Form.Item
          name="taskName"
          label={t('Collection.taskNameLabel')}
          rules={[
            { required: true, message: t('Collection.taskNamePlaceholder') },
          ]}
        >
          <Input placeholder={t('Collection.taskNamePlaceholder')} />
        </Form.Item>
        <Form.Item
          name="cycle"
          label={t('Collection.cycle')}
          rules={[{ required: true, message: t('Collection.selectTime') }]}
        >
          <Radio.Group>
            <div className="space-y-3">
              <div className="flex items-center">
                <Radio value="daily">{t('Collection.dailyAt')}</Radio>
                <Form.Item
                  noStyle
                  name="selectTime"
                  rules={[
                    { required: true, message: t('Collection.selectTime') },
                  ]}
                >
                  <TimePicker
                    className="w-40 ml-2"
                    format="HH:mm"
                    placeholder={t('Collection.selectTime')}
                  />
                </Form.Item>
              </div>
              <div className="flex items-center">
                <Radio value="every">{t('Collection.every')}</Radio>
                <Form.Item
                  noStyle
                  name="everyHours"
                  rules={[{ required: true, message: t('Collection.hour') }]}
                >
                  <Input className="w-16 mx-2" defaultValue="6" />
                </Form.Item>
                <span>{t('Collection.hour')}</span>
              </div>
              <div>
                <Radio value="once">{t('Collection.once')}</Radio>
              </div>
            </div>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="enterType"
          label={
            <span>
              {t('Collection.enterType')}
              <Tooltip title={t('Collection.enterTypeTooltip')}>
                <QuestionCircleOutlined className="ml-1 text-gray-400" />
              </Tooltip>
            </span>
          }
          rules={[{ required: true }]}
        >
          <Radio.Group>
            <Radio value="automatic">{t('Collection.automatic')}</Radio>
            <Radio value="approval">{t('Collection.approvalRequired')}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="vCenter"
          label={t('Collection.chooseVCenter')}
          rules={[{ required: true, message: t('Collection.chooseVCenter') }]}
        >
          <Input
            addonAfter={<Button type="default" icon={<PlusOutlined />} />}
            defaultValue="vc1"
          />
        </Form.Item>
        <Form.Item
          name="proxy"
          label={t('Collection.proxy')}
          rules={[{ required: true, message: t('Collection.proxy') }]}
        >
          <Input defaultValue="Direct" />
        </Form.Item>

        <Collapse
          defaultActiveKey={['credential', 'advanced']}
          ghost
          className="mb-6"
          expandIcon={({ isActive }) => (
            <CaretRightOutlined
              rotate={isActive ? 90 : 0}
              className="text-base"
            />
          )}
        >
          <Panel
            header={
              <div className={styles.panelHeader}>
                {t('Collection.credential')}
              </div>
            }
            key="credential"
          >
            <Form.Item
              name="account"
              label={t('Collection.account')}
              rules={[{ required: true, message: t('Collection.account') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label={t('Collection.password')}
              rules={[{ required: true, message: t('Collection.password') }]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="port"
              label={t('Collection.port')}
              rules={[{ required: true, message: t('Collection.port') }]}
            >
              <Input className="w-32" defaultValue="443" />
            </Form.Item>
            <Form.Item
              name="sslVerify"
              label={t('Collection.sslVerify')}
              valuePropName="checked"
              rules={[{ required: true }]}
            >
              <Switch defaultChecked />
            </Form.Item>
          </Panel>
          <Panel
            header={
              <div className={styles.panelHeader}>
                {t('Collection.advanced')}
              </div>
            }
            key="advanced"
          >
            <Form.Item
              name="timeout"
              label={
                <span>
                  {t('Collection.timeout')}
                  <Tooltip title={t('Collection.timeoutTooltip')}>
                    <QuestionCircleOutlined className="ml-1 text-gray-400" />
                  </Tooltip>
                </span>
              }
              rules={[{ required: true, message: t('Collection.timeout') }]}
            >
              <Input className="w-32" defaultValue="600" />
            </Form.Item>
          </Panel>
        </Collapse>

        <Form.Item>
          <div className="flex justify-end space-x-4">
            <Button className="!rounded-button whitespace-nowrap">
              {t('Collection.test')}
            </Button>
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
    </Modal>
  );
};

export default AddTask;
