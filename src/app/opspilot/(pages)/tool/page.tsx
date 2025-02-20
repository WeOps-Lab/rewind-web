'use client';
import React, { useState } from'react';
import { Input, Modal, Form } from 'antd';
import { useTranslation } from '@/utils/i18n';
import EntityList from '@/components/entity-list';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  tag: string[];
}

interface FormValues {
  name: string;
  description: string;
}

const ToolListPage: React.FC = () => {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const toolData: Tool[] = [
    {
      id: '1',
      name: 'Tool 1',
      description: '这是中文的描述,中文的描述,中文的描述,中文的描述,中文的描述,还是不够,再来一点描述描述天呐还是不够,再来一点描述....',
      icon: 'duckduckgo1',
      tag: ['tag1', 'tag2']
    },
    {
      id: '2',
      name: 'Tool 2',
      description: 'This is a description for Tool 2, This is a description for Tool 2, This is a description for Tool 2',
      icon: 'duckduckgo1',
      tag: ['tag3', 'tag4']
    }
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values: FormValues) => {
      // 处理表单提交逻辑，例如保存到数据库
      console.log('表单提交的值:', values);
      form.resetFields();
      setIsModalVisible(false);
    }).catch((error) => {
      console.log('表单验证错误:', error);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const singleAction = () => {
    return {
      text: t('common.settings'),
      onClick: () => showModal()
    };
  };

  const handleCardClick = (card: any) => {
    console.log('cardClick', card);
  }

  return (
    <div className="w-full min-h-screen">
      <EntityList<Tool>
        data={toolData}
        loading={false}
        singleAction={singleAction}
        displayTagBelowName={true}
        onCardClick={handleCardClick}
      />
      <Modal
        title={t('common.settings')}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ name: '', description: '' }}
        >
          <Form.Item
            name="name"
            label={t('common.name')}
            rules={[{ required: true, message: t('common.pleaseEnterName') }]}
          >
            <Input placeholder={t('common.enterName')} />
          </Form.Item>
          <Form.Item
            name="description"
            label={t('common.description')}
            rules={[{ required: true, message: t('common.pleaseEnterDescription') }]}
          >
            <Input.TextArea placeholder={t('common.enterDescription')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ToolListPage;
