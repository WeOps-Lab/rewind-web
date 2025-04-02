import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { ModalRef, ModalSuccess, TableDataItem } from "@/app/node-manager/types";
import { Form, Button, Input, Select, Upload, message, Popconfirm } from "antd";
import { CloudUploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { FormInstance } from "antd/lib";
import { useTranslation } from "@/utils/i18n";
import OperateModal from "@/components/operate-modal";
import useApiCollector from "@/app/node-manager/api/collector";
const { TextArea } = Input;
const { Dragger } = Upload;

const CollectorModal = forwardRef<ModalRef, ModalSuccess>(({ onSuccess }, ref) => {
  const { t } = useTranslation();
  const { addCollector, deleteCollector, editCollecttor } = useApiCollector();
  const formRef = useRef<FormInstance>(null);
  const [form] = Form.useForm();
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    system: '',
    description: '',
    service_type: '',
    executable_path: '',
    execute_parameters: '',
  })
  //需要二次弹窗确定的类型
  const Popconfirmarr = ["delete"];

  useImperativeHandle(ref, () => ({
    showModal: ({ type, form, title }) => {
      const {
        id,
        name,
        tagList,
        description,
        service_type,
        executable_path,
        execute_parameters } = form as TableDataItem;
      const system = tagList?.length ? tagList[0] : 'windows';
      setId(id as string);
      setType(type);
      setTitle(title as string);
      setFormData({
        name,
        system,
        description,
        service_type,
        executable_path,
        execute_parameters,
      })
      setVisible(true);
      if (type === 'edit' || type === 'delete') {
        console.log(type, form)
        formRef.current?.setFieldsValue({
          name,
          system,
          description
        });
      }
    }
  }));

  useEffect(() => {
    formRef.current?.resetFields();
  }, [formRef])

  const handleCancel = () => {
    setVisible(false);
  };

  const onSubmit = () => {
    if (Popconfirmarr.includes(type)) {
      return;
    }
    setConfirmLoading(true);
    formRef.current?.validateFields().then((values) => {
      const {
        name,
        system,
        description,
      } = values;
      if (type === 'add') {
        addCollector({
          id: `${name}_${system}`,
          name: name,
          service_type: 'exec',
          node_operating_system: system,
          introduction: description
        }).then(() => {
          setConfirmLoading(false);
          setVisible(false);
        }).catch((e) => {
          console.log(e);
          setConfirmLoading(false);
        })
      } else if (type === 'edit') {
        const { service_type,
          executable_path,
          execute_parameters, } = formData;
        editCollecttor({
          id,
          name: name,
          node_operating_system: system,
          introduction: description,
          service_type: service_type,
          executable_path: executable_path,
          execute_parameters: execute_parameters,
        }).then(() => {
          setConfirmLoading(false);
          setVisible(false);
        }).catch((e) => {
          console.log(e);
          setConfirmLoading(false);
        })
      }
    });
    onSuccess();
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
  };

  //删除确认的弹窗
  const deleteConfirm = () => {
    setConfirmLoading(true);
    formRef.current?.validateFields().then(() => {
      deleteCollector({ id })
        .then(() => {
          setConfirmLoading(false);
          setVisible(false);
          onSuccess();
        })
        .catch((e) => {
          console.log(e);
          setConfirmLoading(false);
        })
    })
  }

  return (
    <div>
      <OperateModal
        title={t(`node-manager.collector.${title}`)}
        visible={visible}
        onCancel={handleCancel}
        footer={
          <div>
            {
              Popconfirmarr.includes(type) ?
                <Popconfirm
                  title={t(`node-manager.collector.${type}`)}
                  description={t(`node-manager.collector.${type}Info`)}
                  okText={t("common.confirm")}
                  cancelText={t("common.cancel")}
                  onConfirm={deleteConfirm}
                >
                  <Button
                    className="mr-[10px]"
                    type="primary"
                    loading={confirmLoading}
                    danger
                  >
                    {t("common.delete")}
                  </Button>
                </Popconfirm>
                : <Button type="primary" className="mr-[10px]" loading={confirmLoading} onClick={onSubmit}>{t('common.confirm')}</Button>
            }
            <Button onClick={handleCancel}>{t('common.cancel')}</Button>
          </div>
        }
      >
        <Form
          ref={formRef}
          form={form}
          initialValues={formData}
          layout="vertical"
        >
          {(['edit', 'add', 'delete'].includes(type)) && (<>
            <Form.Item<any>
              label={t('node-manager.cloudregion.variable.name')}
              name="name"
              rules={[{ required: true, validator: validateName }]}
            >
              <Input disabled={type === 'delete'} />
            </Form.Item>
            <Form.Item<any>
              label={t('node-manager.cloudregion.Configuration.system')}
              name="system"
              rules={[{ required: true }]}
            >
              <Select
                disabled={type !== 'add'}
                options={[
                  { value: 'linux', label: 'linux' },
                  { value: 'windows', label: 'windows' }
                ]}>
              </Select>
            </Form.Item>
            <Form.Item<any>
              label={t('node-manager.cloudregion.Configuration.description')}
              name="description"
              rules={[{ required: true, validator: validateDescription }]}
            >
              <TextArea disabled={type === 'delete'} />
            </Form.Item>
          </>)}
          {type === 'upload' && (<>
            <Form.Item<any>
              label={t('node-manager.collector.version')}
              name="version"
              rules={[{ required: true, validator: validdateVersion }]}
            >
              <Input />
            </Form.Item>
            <Form.Item<any>
              label={t('node-manager.collector.importFile')}
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