import React from 'react';
import { Form, Input as AntdInput, Switch, message, Select } from 'antd';
import { useTranslation } from '@/utils/i18n';
import { useUserInfoContext } from '@/context/userInfo';
import { Model, ModelConfig } from '@/app/opspilot/types/provider';
import { MODEL_TYPE_OPTIONS } from '@/app/opspilot/constants/provider';
import OperateModal from '@/components/operate-modal';

interface ProviderModalProps {
  visible: boolean;
  mode: 'add' | 'edit';
  filterType: string;
  model?: Model | null;
  confirmLoading: boolean;
  onOk: (values: any) => Promise<void>;
  onCancel: () => void;
}

const ProviderModal: React.FC<ProviderModalProps> = ({
  visible,
  mode,
  filterType,
  model,
  confirmLoading,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { groups, selectedGroup } = useUserInfoContext();

  React.useEffect(() => {
    if (!visible) return;
    if (mode === 'edit' && model) {
      const configField = getConfigField(filterType);
      const config = model[configField] as ModelConfig | undefined;
      form.setFieldsValue({
        name: model.name || '',
        modelName: model.llm_config?.model || '',
        type: model.llm_model_type || '',
        team: model.team,
        apiKey: model.llm_config?.openai_api_key || '',
        url: filterType === 'llm_model' ? model.llm_config?.openai_base_url || '' : config?.base_url || '',
        enabled: model.enabled || false,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        type: 'chat-gpt',
        enabled: true
      });
    }
  }, [visible]);

  const getConfigField = (type: string) => {
    const configMap: Record<string, keyof Model> = {
      llm_model: 'llm_config',
      embed_provider: 'embed_config',
      rerank_provider: 'rerank_config',
      ocr_provider: 'ocr_config',
    };
    return configMap[type];
  };

  const handleOk = () => {
    form.validateFields()
      .then(onOk)
      .catch((info) => {
        message.error(t('common.valFailed'));
        console.error(info);
      });
  };

  return (
    <OperateModal
      title={t(mode === 'add' ? 'common.add' : 'common.edit')}
      visible={visible}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      onCancel={onCancel}
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={t('provider.form.name')}
          rules={[{ required: true, message: `${t('common.input')}${t('provider.form.name')}` }]}
        >
          <AntdInput placeholder={`${t('common.input')}${t('provider.form.name')}`} />
        </Form.Item>
        {filterType === 'llm_model' && (<Form.Item
          name="modelName"
          label={t('provider.form.modelName')}
          rules={[{ required: true, message: `${t('common.input')}${t('provider.form.modelName')}` }]}
        >
          <AntdInput placeholder={`${t('common.input')}${t('provider.form.modelName')}`} />
        </Form.Item>)}
        {filterType === 'llm_model' && (<Form.Item
          name="type"
          label={t('provider.form.type')}
          rules={[{ required: true, message: `${t('common.selectMsg')}${t('provider.form.type')}` }]}
          initialValue="chat-gpt"
        >
          <Select placeholder={`${t('common.selectMsg')}${t('provider.form.type')}`}>
            {Object.entries(MODEL_TYPE_OPTIONS).map(([value, displayText]) => (
              <Select.Option key={value} value={value}>
                {displayText}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>)}
        <Form.Item
          name="url"
          label={t('provider.form.url')}
          rules={[{ required: true, message: `${t('common.inputMsg')}${t('provider.form.url')}` }]}
        >
          <AntdInput placeholder={`${t('common.inputMsg')} ${t('provider.form.url')}`} />
        </Form.Item>
        {filterType === 'llm_model' && (
          <Form.Item
            name="apiKey"
            label={t('provider.form.key')}
            rules={[{ required: true, message: `${t('common.inputMsg')}${t('provider.form.key')}` }]}
          >
            <AntdInput.Password visibilityToggle={false} />
          </Form.Item>
        )}
        <Form.Item
          name="enabled"
          label={t('provider.form.enabled')}
          valuePropName="checked"
        >
          <Switch size="small" />
        </Form.Item>
        <Form.Item
          name="team"
          label={t('provider.form.group')}
          rules={[{ required: true, message: `${t('common.selectMsg')}${t('provider.form.group')}` }]}
          initialValue={selectedGroup ? [selectedGroup?.id] : []}
        >
          <Select
            mode="multiple"
            placeholder={`${t('common.selectMsg')}${t('provider.form.group')}`}
          >
            {groups.map(group => (
              <Select.Option key={group.id} value={group.id}>
                {group.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </OperateModal>
  );
};

export default ProviderModal;
