import React, { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { ModalRef } from "@/app/node-manager/types";
import { Form, Button, Input, Select, Upload, message } from "antd";
import { CloudUploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { FormInstance } from "antd/lib";
import { useTranslation } from "@/utils/i18n";
import OperateModal from "@/components/operate-modal";
const { TextArea } = Input;
const { Dragger } = Upload;

interface ModalConfig {
  [key: string]: any
}

const CollectorModal = forwardRef<ModalRef, ModalConfig>(({ handleSubmit }, ref) => {
  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>(null);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [initValue, setInitValue] = useState<any>({ system: 'single', name: '', description: '' });

  useImperativeHandle(ref, () => ({
    showModal: ({ type, form, title }) => {
      console.log(type, form, title);
      setTitle(title as string);
      setType(type);
      setFormData(form);
      setVisible(true);
      if (type === 'edit') setInitValue(
        { system: 'single', name: form?.name, description: form?.description }
      );
    }
  }));

  const handleCancel = () => {
    setVisible(false);
  };

  const onSubmit = () => {
    console.log(formData);
    setConfirmLoading(true);
    formRef.current?.validateFields().then((values) => {
      console.log(values);
    })
    setConfirmLoading(false);
    setVisible(false)
    handleSubmit();
  };

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    action: '',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (status === 'done') {
        message.success(`${info.file.name} file upload success`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed`);
      }
    }
  };

  const validateName = async (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error(t('common.inputRequired')));
    }
    return Promise.resolve();
  };

  const validateDescription = async (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error(t('common.inputRequired')));
    }
    return Promise.resolve();
  };

  const validdateVersion = async (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error(t('common.inputRequired')));
    }
    return Promise.resolve();
  };

  const validateUpload = async (_: any, value: any) => {
    if (!value) {
      return Promise.reject(new Error(t('common.inputRequired')));
    }
    return Promise.resolve();
  }

  return (
    <div>
      <OperateModal
        title={t(`node-manager.cloudregion.Configuration.${title}`)}
        visible={visible}
        onCancel={handleCancel}
        footer={
          <div>
            <Button
              className="mr-[10px]"
              type="primary"
              loading={confirmLoading}
              onClick={onSubmit}
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
          initialValues={initValue}
        >
          {(type === 'edit' || type === 'add') && (<>
            <Form.Item<any>
              label={t('node-manager.cloudregion.variable.name')}
              name="name"
              rules={[{ required: true, validator: validateName }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<any>
              label={t('node-manager.cloudregion.Configuration.system')}
              name="system"
              rules={[{ required: true }]}
            >
              <Select
                disabled
                options={[{ value: 'single', label: '单选Windows/Linux' }]}>
              </Select>
            </Form.Item>
            <Form.Item<any>
              label={t('node-manager.cloudregion.Configuration.description')}
              name="description"
              rules={[{ required: true, validator: validateDescription }]}
            >
              <TextArea />
            </Form.Item>
          </>)}
          {type === 'upload' && (<>
            <Form.Item<any>
              label={t('node-manager.cloudregion.Configuration.version')}
              name="version"
              rules={[{ required: true, validator: validdateVersion }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<any>
              label={t('node-manager.cloudregion.Configuration.importFile')}
              name="upload"
              rules={[{ required: true, validator: validateUpload }]}
            >
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <CloudUploadOutlined />
                </p>
                <p className="flex justify-center content-center items-center">{t('common.uploadText')}<Button type="link">点击上传</Button></p>
              </Dragger>
            </Form.Item>
          </>)}
        </Form>
      </OperateModal>
    </div>
  )
});

CollectorModal.displayName = 'CollectorModal';
export default CollectorModal;