import React, { useEffect } from 'react';
import { Form, Input, Select } from 'antd';
import { useTranslation } from '@/utils/i18n';

const { Option } = Select;

interface CommonFormProps {
  form: any;
  modelOptions?: any[];
  initialValues?: any;
  isTraining?: boolean;
  formType: string;
  visible: boolean;
}

const CommonForm: React.FC<CommonFormProps> = ({ form, modelOptions, initialValues, isTraining, formType, visible }) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!visible) return;

    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
      const defaultValues: any = {};
      if (formType === 'knowledge' && modelOptions && modelOptions.length > 0) {
        defaultValues.embed_model = modelOptions[0].id;
      }
      form.setFieldsValue(defaultValues);
    }
  }, [initialValues, form, modelOptions, formType, visible]);

  return (
    <Form form={form} layout="vertical" name={`${formType}_form`}>
      <Form.Item
        name="name"
        label={t(`${formType}.form.name`)}
        rules={[{ required: true, message: `${t('common.inputMsg')} ${t(`${formType}.form.name`)}!` }]}
      >
        <Input placeholder={`Please ${t('common.input')} ${t(`${formType}.form.name`)}`} />
      </Form.Item>
      {formType === 'knowledge' && modelOptions && (
        <Form.Item
          name="embed_model"
          label={t('knowledge.form.embedModel')}
          tooltip={t('knowledge.form.embedModelTip')}
          rules={[{ required: true, message: `${t('common.selectMsg')} ${t('knowledge.form.embedModel')}!` }]}
        >
          <Select placeholder={`Please ${t('common.select')} ${t('knowledge.form.embedModel')}`} disabled={isTraining}>
            {modelOptions.map((model) => (
              <Option key={model.id} value={model.id} disabled={!model.enabled}>
                {model.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      )}
      <Form.Item
        name="introduction"
        label={t(`${formType}.form.introduction`)}
        rules={[{ required: true, message: `${t('common.inputMsg')} ${t(`${formType}.form.introduction`)}!` }]}
      >
        <Input.TextArea rows={4} placeholder={`Please ${t('common.input')} ${t(`${formType}.form.introduction`)}`} />
      </Form.Item>
    </Form>
  );
};

export default CommonForm;
