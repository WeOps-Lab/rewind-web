import React, { useState } from 'react';
import { Spin, message, Dropdown, Menu, Modal } from 'antd';
import Icon from '@/components/icon';
import { useTranslation } from '@/utils/i18n';
import styles from './index.module.scss';
import comStyles from '@/app/opspilot/styles/common.module.scss';
import { Model, ModelConfig } from '@/app/opspilot/types/provider';
import useApiClient from '@/utils/request';
import PermissionWrapper from '@/components/permission';
import ConfigModal from '@/app/opspilot/components/provider/configModal';

interface ProviderGridProps {
  models: Model[];
  filterType: string;
  loading: boolean;
  setModels: React.Dispatch<React.SetStateAction<Model[]>>;
}

const ProviderGrid: React.FC<ProviderGridProps> = ({ models, filterType, loading, setModels }) => {
  const { t } = useTranslation();
  const { put, del } = useApiClient();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  const llmIconMap: Record<string, string> = {
    'deep-seek': 'deepseek',
    'chat-gpt': 'chatgpticon',
    'hugging_face': 'huggingface',
    'zhipu': 'a-zhipuAI',
    'default': 'chatgpticon'
  };

  const iconMap: Record<string, string> = {
    embed_provider: 'Embeddings',
    rerank_provider: 'jigoushuzhongxinpaixu',
    ocr_provider: 'ocr',
    default: 'chatgpticon'
  };

  const getModelIcon = (model: Model) => {
    if (filterType === 'llm_model') {
      return llmIconMap[model.llm_model_type || 'default'];
    }
    return iconMap[filterType] || 'chatgpticon';
  };

  const handleMenuClick = (action: string, model: Model) => {
    if (action === 'edit') {
      setSelectedModel(model);
      setIsModalVisible(true);
    } else if (action === 'delete') {
      handleDelete(model);
    }
  };

  const menu = (model: Model) => (
    <Menu className={`${comStyles.menuContainer}`}>
      <Menu.Item key="edit">
        <PermissionWrapper className='w-full' requiredPermissions={['Setting']}>
          <span className='block w-full' onClick={() => handleMenuClick('edit', model)}>{t('common.edit')}</span>
        </PermissionWrapper>
      </Menu.Item>
      {model.is_build_in === false && (<Menu.Item key="delete">
        <PermissionWrapper className='w-full' requiredPermissions={['Delete']}>
          <span className='block w-full' onClick={() => handleMenuClick('delete', model)}>{t('common.delete')}</span>
        </PermissionWrapper>
      </Menu.Item>)}
    </Menu>
  );

  const getConfigField = (type: string): keyof Model | undefined => {
    const configMap: Partial<Record<string, keyof Model>> = {
      llm_model: 'llm_config',
      embed_provider: 'embed_config',
      rerank_provider: 'rerank_config',
      ocr_provider: 'ocr_config',
    };
    return configMap[type]; // 返回可能为 undefined
  };

  const handleEditOk = async (values: any) => {
    if (!selectedModel) return;

    const configField = getConfigField(filterType);
    const updatedModel: Model = {
      ...selectedModel,
      name: values.name,
      llm_model_type: values.type,
      enabled: values.enabled,
    };

    if (filterType === 'llm_model') {
      updatedModel.llm_config = {
        ...selectedModel.llm_config,
        model: values.modelName,
        openai_api_key: values.apiKey,
        openai_base_url: values.url,
      };
    } else {
      if (!configField) {
        throw new Error(`Invalid filterType: ${filterType}`);
      }
      (updatedModel[configField] as ModelConfig) = {
        ...(selectedModel[configField] as ModelConfig),
        base_url: values.url,
      };
    }

    setModalLoading(true);
    try {
      const result = await put(`/model_provider_mgmt/${filterType}/${selectedModel.id}/`, updatedModel);
      if (result && result.id) {
        message.success(t('common.updateSuccess'));
        setModels(prevModels => prevModels.map(model => (model.id === updatedModel.id ? updatedModel : model)));
        setIsModalVisible(false);
      } else {
        message.error(t('common.updateFailed'));
      }
    } catch {
      message.error(t('common.updateFailed'));
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (model: Model) => {
    Modal.confirm({
      title: `${t('provider.deleteConfirm')}`,
      onOk: async () => {
        try {
          await del(`/model_provider_mgmt/${filterType}/${model.id}/`);
          message.success(t('common.delSuccess'));
          setModels(prevModels => prevModels.filter(item => item.id !== model.id));
        } catch {
          message.error(t('common.delFailed'));
        }
      },
    });
  };

  return (
    <>
      <Spin spinning={loading}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {models.map((model) => (
            <div className={`rounded-lg shadow px-4 py-6 relative ${styles.gridContainer}`} key={model.id}>
              <div className="flex justify-between items-start">
                <div style={{flex: '0 0 auto'}}>
                  <Icon type={getModelIcon(model)} className="text-5xl"/>
                </div>
                <div className={`flex-1 ml-2 ${styles.nameContainer}`}>
                  <h3 className={`text-base font-semibold break-words mb-1 ${styles.name}`}>{model.name}</h3>
                  <span className="inline-block mt-1 px-2 py-1 text-xs rounded-xl border">
                    {filterType}
                  </span>
                </div>
                <Dropdown overlay={menu(model)} trigger={['click']} placement="bottomRight">
                  <div className="cursor-pointer">
                    <Icon type="sangedian-copy" className="text-xl" />
                  </div>
                </Dropdown>
              </div>
              <div className="absolute bottom-0 right-0 rounded-lg z-20">
                <span className={`${styles.iconTriangle} ${model.enabled ? styles.enabled : styles.disabled}`}>
                  {model.enabled ? <Icon type="select-line" /> : <Icon type="guanbi" />}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Spin>
      <ConfigModal
        visible={isModalVisible}
        mode="edit"
        filterType={filterType}
        model={selectedModel}
        confirmLoading={modalLoading}
        onOk={handleEditOk}
        onCancel={() => setIsModalVisible(false)}
      />
    </>
  );
};

export default ProviderGrid;
