'use client';
import React, { useState, useEffect } from 'react';
import { Form, message, Button, Menu, Modal } from 'antd';
import { Store } from 'antd/lib/form/interface';
import { useTranslation } from '@/utils/i18n';
import useApiClient from '@/utils/request';
import EntityList from '@/components/entity-list';
import DynamicForm from '@/components/dynamic-form';
import OperateModal from '@/components/operate-modal';
import { useUserInfoContext } from '@/context/userInfo';
import { Tool } from '@/app/opspilot/types/tool';
import PermissionWrapper from "@/components/permission";
import styles from '@/app/opspilot/styles/common.module.scss'

interface TagOption {
  value: string;
  label: string;
}

const ToolListPage: React.FC = () => {
  const { useForm } = Form;
  const { t } = useTranslation();
  const { get, patch, post, del } = useApiClient();
  const { groups, selectedGroup } = useUserInfoContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolData, setToolData] = useState<Tool[]>([]);
  const [filteredToolData, setFilteredToolData] = useState<Tool[]>([]);
  const [allTags, setAllTags] = useState<TagOption[]>([]);

  const [form] = useForm();

  const formFields = [
    {
      name: 'name',
      type: 'input',
      label: t('tool.name'),
      placeholder: `${t('common.inputMsg')}${t('tool.name')}`,
      rules: [{ required: true, message: `${t('common.inputMsg')}${t('tool.name')}` }],
    },
    {
      name: 'tags',
      type: 'select',
      label: t('tool.label'),
      placeholder: `${t('common.selectMsg')}${t('tool.label')}`,
      options: [
        {
          value: 'search',
          label: t('tool.search')
        },
        {
          value: 'general',
          label: t('tool.general')
        },
        {
          value: 'maintenance',
          label: t('tool.maintenance')
        },
        {
          value: 'media',
          label: t('tool.media')
        },
        {
          value: 'collaboration',
          label: t('tool.collaboration')
        },
        {
          value: 'other',
          label: t('tool.other')
        }
      ],
      mode: 'multiple',
      rules: [{ required: true, message: `${t('common.selectMsg')}${t('tool.label')}` }],
    },
    {
      name: 'url',
      type: 'input',
      label: t('tool.mcpUrl'),
      placeholder: `${t('common.inputMsg')}${t('tool.mcpUrl')}`,
      rules: [{ required: true, message: `${t('common.inputMsg')}${t('tool.mcpUrl')}` }],
    },
    {
      name: 'team',
      type: 'select',
      label: t('common.group'),
      placeholder: `${t('common.selectMsg')}${t('common.group')}`,
      options: groups.map((group) => ({ value: group.id, label: group.name })),
      mode: 'multiple',
      rules: [{ required: true, message: `${t('common.selectMsg')}${t('common.group')}` }],
    },
    {
      name: 'description',
      type: 'textarea',
      label: t('tool.description'),
      rows: 4,
      placeholder: `${t('common.inputMsg')}${t('tool.description')}`,
      rules: [{ required: true, message: `${t('common.inputMsg')}${t('tool.description')}` }],
    },
  ];

  useEffect(() => {
    fetchData();
  }, [get]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await get('/model_provider_mgmt/skill_tools/');
      const uniqueTags = Array.from(new Set(data.flatMap((tool: any) => tool.tags))) as string[];
      setAllTags(uniqueTags.map((tag: string) => ({ value: tag, label: t(`tool.${tag}`) })));

      const tools = data.map((tool: any) => ({
        ...tool,
        icon: tool.icon || 'duckduckgo1',
        tags: tool.tags,
        tagList: tool.tags.map((key: string) => t(`tool.${key}`))
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
        try {
          setConfirmLoading(true);
          const queryParams = {
            ...values,
            params: {
              name: values.name,
              url: values.url
            }
          }
          if (!selectedTool?.id) {
            await post('/model_provider_mgmt/skill_tools/', queryParams)
          } else {
            await patch(`/model_provider_mgmt/skill_tools/${selectedTool.id}/`, queryParams);
          }
          form.resetFields();
          setIsModalVisible(false);
          fetchData();
          message.success(t('common.saveSuccess'));
        } catch (error: any) {
          if (error.errorFields && error.errorFields.length) {
            const firstFieldErrorMessage = error.errorFields[0].errors[0];
            message.error(firstFieldErrorMessage || t('common.valFailed'));
          } else {
            message.error(t('common.saveFailed'));
          }
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

  const menuActions = (tool: Tool) => {
    return (
      <Menu className={`${styles.menuContainer}`}>
        <Menu.Item key="edit">
          <PermissionWrapper requiredPermissions={['Edit']}>
            <span className="block w-full" onClick={() => showModal(tool)}>{t('common.edit')}</span>
          </PermissionWrapper>
        </Menu.Item>
        {!tool.is_build_in && (<Menu.Item key="delete">
          <PermissionWrapper requiredPermissions={['Delete']}>
            <span className="block w-full" onClick={() => handleDelete(tool)}>{t('common.delete')}</span>
          </PermissionWrapper>
        </Menu.Item>)}
      </Menu>
    );
  };

  const showModal = (tool: Tool | null) => {
    setSelectedTool(tool);
    setIsModalVisible(true);
    Promise.resolve().then(() => {
      form.setFieldsValue({
        ...tool,
        url: tool?.params?.url,
        team: tool ? tool.team : [selectedGroup?.id],
      });
    });
  };

  const handleDelete = (tool: Tool) => {
    Modal.confirm({
      title: `${t('tool.deleteConfirm')}`,
      onOk: async () => {
        try {
          await del(`/model_provider_mgmt/skill_tools/${tool.id}/`);
          fetchData();
          message.success(t('common.delSuccess'));
        } catch {
          message.error(t('common.delFailed'));
        }
      },
    });
  }

  const changeFilter = (selectedTags: string[]) => {
    if (selectedTags.length === 0) {
      setFilteredToolData(toolData);
    } else {
      const filteredData = toolData.filter((tool) =>
        tool.tags.some((tag: string) => selectedTags.includes(tag))
      );
      setFilteredToolData(filteredData);
    }
  };

  return (
    <div className="w-full h-full">
      <EntityList<Tool>
        data={filteredToolData}
        loading={loading}
        menuActions={menuActions}
        operateSection={
          <PermissionWrapper requiredPermissions={['Add']}>
            <Button type="primary" className="ml-2" onClick={() => showModal(null)}>
              {t('common.add')}
            </Button>
          </PermissionWrapper>
        }
        filter={true}
        filterLoading={loading}
        filterOptions={allTags}
        changeFilter={changeFilter}
      />
      <OperateModal
        title={selectedTool ? `${t('common.edit')}${selectedTool.name}` : `${t('tool.addTool')}`}
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
