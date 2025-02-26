'use client';
import React, { useState, useEffect } from'react';
import { Form } from 'antd';
const { useForm } = Form;
import { useTranslation } from '@/utils/i18n';
import useApiClient from '@/utils/request';
import EntityList from '@/components/entity-list';
import DynamicForm from '@/components/dynamic-form';
import OperateModal from '@/components/operate-modal';
import { useUserInfoContext } from '@/context/userInfo';
import { TOOL_ICON_MAP } from '@/app/opspilot/constants/tool';
import { Tool, FormValues } from '@/app/opspilot/types/tool';

const ToolListPage: React.FC = () => {
  const { t } = useTranslation();
  const { get, patch } = useApiClient();
  const { groups } = useUserInfoContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolData, setToolData] = useState<Tool[]>([]);

  const [form] = useForm();

  useEffect(() => {
    fetchData();
  }, [get]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await get('/model_provider_mgmt/skill_tools/');
      setToolData(data.map((tool: { display_name: string; id: string; description: string; name: keyof typeof TOOL_ICON_MAP, team: string[] }) => ({
        name: tool.display_name,
        id: tool.id,
        description: tool.description,
        icon: TOOL_ICON_MAP[tool.name] || 'duckduckgo1',
        team: tool.team || []
      })));
    } catch (error) {
      console.error(t('common.fetchFailed'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = () => {
    form.validateFields().then(async (values: FormValues) => {
      if (!selectedTool?.id) return;
      await patch(`/model_provider_mgmt/skill_tools/${selectedTool.id}/`, values);
      form.resetFields();
      setIsModalVisible(false);
      setToolData([]);
      fetchData();
    }).catch((error) => {
      console.log('common.valFailed:', error);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const singleAction = (tool: Tool) => {
    return {
      text: t('common.settings'),
      onClick: () => showModal(tool)
    };
  };

  const showModal = (tool: Tool) => {
    setSelectedTool(tool);
    setIsModalVisible(true);
    Promise.resolve().then(() => {
      console.log('selectedTool', selectedTool);
      form.setFieldsValue({
        team: tool.team
      });
    })
  };

  const formFields = [
    {
      name: 'team',
      type: 'select',
      label: t('common.group'),
      placeholder: `${t('common.selectMsg')}${t('common.group')}`,
      options: groups.map(group => ({ value: group.id, label: group.name })),
      mode: 'multiple',
      rules: [{ required: true, message: `${t('common.selectMsg')}${t('common.group')}` }]
    }
  ];

  return (
    <div className="w-full h-full">
      <EntityList<Tool>
        data={toolData}
        loading={loading}
        displayTagBelowName={false}
        singleAction={singleAction}
      />
      <OperateModal
        title={selectedTool ? selectedTool.name : `${t('common.edit')}`}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <DynamicForm
          form={form}
          fields={formFields}
          initialValues={{ team: selectedTool?.team || [] }}
        />
      </OperateModal>
    </div>
  );
};

export default ToolListPage;
