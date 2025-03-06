'use client';
import React, { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { Store } from 'antd/lib/form/interface';
const { useForm } = Form;
import { useTranslation } from '@/utils/i18n';
import useApiClient from '@/utils/request';
import EntityList from '@/components/entity-list';
import DynamicForm from '@/components/dynamic-form';
import OperateModal from '@/components/operate-modal';
import { useUserInfoContext } from '@/context/userInfo';
import { Tool } from '@/app/opspilot/types/tool';

interface TagOption {
  value: string;
  label: string;
}

const ToolListPage: React.FC = () => {
  const { t } = useTranslation();
  const { get, patch } = useApiClient();
  const { groups } = useUserInfoContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolData, setToolData] = useState<Tool[]>([]);
  const [filteredToolData, setFilteredToolData] = useState<Tool[]>([]);
  const [allTags, setAllTags] = useState<TagOption[]>([]);

  const [form] = useForm();

  useEffect(() => {
    fetchData();
  }, [get]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await get('/model_provider_mgmt/skill_tools/');
      const uniqueTags = Array.from(new Set(data.flatMap((tool: any) => tool.tags))) as string[];
      setAllTags(uniqueTags.map((tag: string) => ({ value: tag, label: tag })));

      const tools = data.map((tool: any) => ({
        name: tool.display_name,
        id: tool.id,
        description: tool.description,
        icon: tool.icon || 'duckduckgo1',
        team: tool.team || [],
        tag: tool.tags || [],
      }));

      setToolData(tools);
      setFilteredToolData(tools);
    } catch (error) {
      console.error(t('common.fetchFailed'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(async (values: Store) => {
        if (!selectedTool?.id) return;
        try {
          setConfirmLoading(true);
          await patch(`/model_provider_mgmt/skill_tools/${selectedTool.id}/`, values);
          form.resetFields();
          setIsModalVisible(false);
          fetchData();
          message.success(t('common.updateSuccess'));
        } catch {
          message.error(t('common.updateFailed'));
        } finally {
          setConfirmLoading(false);
        }
      })
      .catch((error) => {
        console.error('common.valFailed:', error);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const singleAction = (tool: Tool) => {
    return {
      text: t('common.settings'),
      onClick: () => showModal(tool),
    };
  };

  const showModal = (tool: Tool) => {
    setSelectedTool(tool);
    setIsModalVisible(true);
    Promise.resolve().then(() => {
      form.setFieldsValue({
        team: tool.team,
      });
    });
  };

  const changeFilter = (selectedTags: string[]) => {
    if (selectedTags.length === 0) {
      setFilteredToolData(toolData);
    } else {
      const filteredData = toolData.filter((tool) =>
        tool.tag.some((tag: string) => selectedTags.includes(tag))
      );
      setFilteredToolData(filteredData);
    }
  };

  const formFields = [
    {
      name: 'team',
      type: 'select',
      label: t('common.group'),
      placeholder: `${t('common.selectMsg')}${t('common.group')}`,
      options: groups.map((group) => ({ value: group.id, label: group.name })),
      mode: 'multiple',
      rules: [{ required: true, message: `${t('common.selectMsg')}${t('common.group')}` }],
    },
  ];

  return (
    <div className="w-full h-full">
      <EntityList<Tool>
        data={filteredToolData}
        loading={loading}
        singleAction={singleAction}
        filter={true}
        filterLoading={loading}
        filterOptions={allTags}
        changeFilter={changeFilter}
      />
      <OperateModal
        title={selectedTool ? selectedTool.name : `${t('common.edit')}`}
        visible={isModalVisible}
        confirmLoading={confirmLoading}
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
