import React, { useState, useEffect } from 'react';
import { Button, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import SelectorOperateModal from './operateModal';
import useApiClient from '@/utils/request';
import Icon from '@/components/icon';
import styles from './index.module.scss';
import { SelectTool } from '@/app/opspilot/types/tool';

interface ToolSelectorProps {
  selectedToolIds: number[];
  onChange: (selected: number[]) => void;
}

const ToolSelector: React.FC<ToolSelectorProps> = ({ selectedToolIds, onChange }) => {
  const { t } = useTranslation();
  const { get } = useApiClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tools, setTools] = useState<SelectTool[]>([]);

  useEffect(() => {
    fetchData();
  }, [get]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await get('/model_provider_mgmt/skill_tools/');
      setTools(data.map((tool: { display_name: string; id: string; name: string, icon: string }) => ({
        name: tool.name,
        id: tool.name,
        icon: tool.icon || 'duckduckgo1'
      })));
    } catch (error) {
      console.error(t('common.fetchFailed'), error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const handleModalConfirm = (selected: number[]) => {
    onChange(selected);
    setModalVisible(false);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const removeSelectedTool = (toolId: number) => {
    onChange(selectedToolIds.filter((id) => id !== toolId));
  };

  return (
    <div>
      <Button onClick={openModal}>+ {t('common.add')}</Button>
      <div className="grid grid-cols-2 gap-4 mt-2 pb-2">
        {selectedToolIds.map((id) => {
          const tool = tools.find((t) => t.id === id);
          if (!tool) return null;

          return (
            <div key={id} className={`w-full rounded-md px-4 py-2 flex items-center justify-between ${styles.borderContainer}`}>
              <Tooltip title={tool.name}>
                <div className='flex items-center'>
                  <Icon className='text-xl mr-1' type={tool.icon} />
                  <span className="inline-block text-ellipsis overflow-hidden whitespace-nowrap">{tool.name}</span>
                </div>
              </Tooltip>
              <div className="flex items-center space-x-2">
                <DeleteOutlined onClick={() => removeSelectedTool(id)} />
              </div>
            </div>
          );
        })}
      </div>

      <SelectorOperateModal
        title={t('skill.selecteTool')}
        visible={modalVisible}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        loading={loading}
        options={tools}
        isNeedGuide={false}
        selectedOptions={selectedToolIds}
        onOk={handleModalConfirm}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default ToolSelector;
