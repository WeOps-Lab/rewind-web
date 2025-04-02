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
const initData = {
  name: '',
  system: '',
  description: '',
  service_type: '',
  executable_path: '',
  execute_parameters: '',
}

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
  const [formData, setFormData] = useState<TableDataItem>(initData);
  //需要二次弹窗确定的类型
  const Popconfirmarr = ["delete"];

  useImperativeHandle(ref, () => ({
    showModal: ({ type, form, title }) => {
      console.log(type, form)
      setId(form?.id as string);
      setType(type);
      setTitle(title as string);
      setFormData(form as TableDataItem)
      setVisible(true);
      if (type === 'edit' || type === 'delete') {
        const { name, system, description } = form as TableDataItem;
        setFormData({
          ...form,
          name: name,
          system: system ? system : 'windows',
          description: description ? description : '--'
        });
      } else {
        setFormData({
          ...form,
          name: '',
          system: 'windows',
          description: ''
        });
      }
    }
  }));

  useEffect(() => {
    formRef.current?.resetFields();
    formRef.current?.setFieldsValue(formData);
  }, [formRef, formData])

  const handleCancel = () => {
    formRef.current?.resetFields();
    setVisible(false);
  };

  const onSubmit = () => {
    if (Popconfirmarr.includes(type)) {
      return;
    }
    setConfirmLoading(true);
    formRef.current?.validateFields().then((values) => {
      const param = {
        id: id ? id : `${values.name}_${values.system}`,
        name: values.name,
        service_type: formData.service_type ? formData.service_type : 'exec',
        node_operating_system: values.system,
        introduction: values.description,
        executable_path: formData.executable_path ? formData.executable_path : 'text/',
        execute_parameters: formData.execute_parameters ? formData.execute_parameters : 'text',
      };
      if (type === 'add') {
        addCollector(param).then(() => {
          setConfirmLoading(false);
          setVisible(false);
          onSuccess();
        }).catch((e) => {
          console.log(e);
          setConfirmLoading(false);
        })
      } else if (type === 'edit') {
        editCollecttor(param).then(() => {
          setConfirmLoading(false);
          setVisible(false);
          onSuccess();
        }).catch((e) => {
          console.log(e);
          setConfirmLoading(false);
        })
      }
    }).catch(()=>{
      setConfirmLoading(false);
    });
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
              rules={[{ required: true, message: t('common.inputRequired') }]}
            >
              <Input disabled={type === 'delete'} />
            </Form.Item>
            <Form.Item<any>
              label={t('node-manager.cloudregion.Configuration.system')}
              name="system"
              rules={[{ required: true, message: t('common.inputRequired') }]}
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
              rules={[{ required: true, message: t('common.inputRequired') }]}
            >
              <TextArea disabled={type === 'delete'} />
            </Form.Item>
          </>)}
          {type === 'upload' && (<>
            <Form.Item<any>
              label={t('node-manager.collector.version')}
              name="version"
              rules={[{ required: true, message: t('common.inputRequired') }]}
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