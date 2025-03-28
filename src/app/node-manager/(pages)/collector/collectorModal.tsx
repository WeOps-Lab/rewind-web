import React, { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { ModalRef } from "@/app/node-manager/types";
import { Form, Button, Input, Select } from "antd";
import { FormInstance } from "antd/lib";
import { useTranslation } from "@/utils/i18n";
import OperateModal from "@/components/operate-modal";
const { Option } = Select;
const { TextArea } = Input;

interface ModalConfig {
  [key: string]: any
}

const CollectorModal = forwardRef<ModalRef, ModalConfig>(({ onSuccess }, ref) => {
  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);
  const [title, setTitle] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>(null);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);



  useImperativeHandle(ref, () => ({
    showModal: ({ type, form, title }) => {
      console.log(type, form, title);
      setTitle(title as string);
      setFormData(form);
    }
  }));

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = () => {
    setConfirmLoading(true);
    onSuccess();
  }


  return (
    <div>
      <OperateModal
        width={700}
        title={title}
        visible={visible}
        onCancel={handleCancel}
        footer={
          <div>
            <Button
              className="mr-[10px]"
              type="primary"
              loading={confirmLoading}
              onClick={handleSubmit}
            >
              {t('common.confirm')}
            </Button>
            <Button onClick={handleCancel}>{t('common.cancel')}</Button>
          </div>
        }
      >
        <Form
          ref={formRef}
          layout="vertical"
        >
          <Form.Item<any>
            label={t('common.name')}
            name="name"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input name={formData?.name} />
          </Form.Item>
          <Form.Item<any>
            label={t('common.name')}
            name="system"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select>
              <Option >
                {'单选Windows/Linux'}
              </Option>
            </Select>
          </Form.Item>
          <Form.Item<any>
            label={t('common.name')}
            name="introduction"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <TextArea value={formData?.introduction} />
          </Form.Item>
        </Form>
      </OperateModal>
    </div>
  )
});

CollectorModal.displayName = 'CollectorModal';
export default CollectorModal;