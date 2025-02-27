'use client';

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Input, Button, Form, message, Select } from 'antd';
import Image from 'next/image';
import OperateModal from '@/components/operate-modal';
import SelectIcon from './selectIcon';
import { getIconUrl } from '@/app/cmdb/utils/common';
import type { FormInstance } from 'antd';
import useApiClient from '@/utils/request';
import { ModelItem, ModelConfig } from '@/app/cmdb/types/assetManage';
import { deepClone } from '@/app/cmdb/utils/common';
const { Option } = Select;
import { useTranslation } from '@/utils/i18n';

interface ModelModalProps {
  onSuccess: (info?: unknown) => void;
  groupList: Array<any>;
}

export interface ModelModalRef {
  showModal: (info: ModelConfig) => void;
}

const ModelModal = forwardRef<ModelModalRef, ModelModalProps>(
  ({ onSuccess, groupList }, ref) => {
    const { post, put } = useApiClient();
    const { t } = useTranslation();
    const formRef = useRef<FormInstance>(null);
    const selectIconRef = useRef<any>(null);
    const [modelVisible, setModelVisible] = useState<boolean>(false);
    const [subTitle, setSubTitle] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [type, setType] = useState<string>('');
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [modelInfo, setModelInfo] = useState<any>({});
    const [modelIcon, setModelIcon] = useState<any>('');
    const [iconId, setIconId] = useState<any>('');

    useEffect(() => {
      if (modelVisible) {
        formRef.current?.resetFields();
        formRef.current?.setFieldsValue(modelInfo);
      }
    }, [modelVisible, modelInfo]);

    useImperativeHandle(ref, () => ({
      showModal: ({ type, modelForm, subTitle, title }) => {
        // 开启弹窗的交互
        setModelVisible(true);
        setSubTitle(subTitle);
        setType(type);
        setTitle(title);
        let icon = getIconUrl({ model_id: '', icn: '' });
        if (type === 'edit') {
          icon = getIconUrl(modelForm);
        }
        setModelIcon(icon);
        setIconId(modelForm.icn || 'icon-cc-host');
        setModelInfo(modelForm);
      },
    }));

    const OperateModel = async (params: ModelItem) => {
      try {
        setConfirmLoading(true);
        const msg: string = t(
          type === 'add' ? 'successfullyAdded' : 'successfullyModified'
        );
        const url: string =
          type === 'add' ? '/cmdb/api/model/' : `/cmdb/api/model/${modelInfo.model_id}/`;
        let requestParams = deepClone(params);
        if (type !== 'add') {
          requestParams = {
            classification_id: params.classification_id,
            model_name: params.model_name,
            icn: params.icn,
          };
        }
        const requestType = type === 'add' ? post : put;
        await requestType(url, requestParams);
        message.success(msg);
        handleCancel();
        onSuccess(params);
      } catch (error) {
        console.log(error);
      } finally {
        setConfirmLoading(false);
      }
    };

    const handleSubmit = () => {
      formRef.current?.validateFields().then((values: ModelItem) => {
        OperateModel({
          ...values,
          icn: iconId,
        });
      });
    };

    const handleCancel = () => {
      setModelVisible(false);
    };

    const onConfirmSelectIcon = (icon: string) => {
      const objId = icon.replace('cc-', '');
      const _iconId = 'icon-' + icon;
      setModelIcon(
        getIconUrl({
          icn: _iconId,
          model_id: objId,
        })
      );
      setIconId(_iconId);
    };

    const onSelectIcon = () => {
      selectIconRef.current?.showModal({
        title: t('Model.selectIcon'),
        defaultIcon: iconId,
      });
    };

    return (
      <div>
        <OperateModal
          title={title}
          subTitle={subTitle}
          visible={modelVisible}
          onCancel={handleCancel}
          footer={
            <div>
              <Button
                type="primary"
                className="mr-[10px]"
                loading={confirmLoading}
                onClick={handleSubmit}
              >
                {t('confirm')}
              </Button>
              <Button onClick={handleCancel}>{t('cancel')}</Button>
            </div>
          }
        >
          <div className="flex items-center justify-center flex-col">
            <div
              className="flex items-center justify-center cursor-pointer w-[80px] h-[80px] rounded-full border-solid border-[1px] border-[var(--color-border)]"
              onClick={onSelectIcon}
            >
              <Image
                src={modelIcon}
                className="block w-auto h-10"
                alt={t('picture')}
                width={60}
                height={60}
              />
            </div>
            <span className="text-[var(--color-text-3)] mt-[10px] mb-[20px]">
              {t('Model.selectIcon')}
            </span>
          </div>
          <Form
            ref={formRef}
            name="basic"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
          >
            <Form.Item<ModelItem>
              label={t('group')}
              name="classification_id"
              rules={[{ required: true, message: t('required') }]}
            >
              <Select
                disabled={type === 'edit'}
                placeholder="Please select a country"
              >
                {groupList.map((item) => {
                  return (
                    <Option
                      value={item.classification_id}
                      key={item.classification_id}
                    >
                      {item.classification_name}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item<ModelItem>
              label={t('id')}
              name="model_id"
              rules={[{ required: true, message: t('required') }]}
            >
              <Input disabled={type === 'edit'} />
            </Form.Item>
            <Form.Item<ModelItem>
              label={t('name')}
              name="model_name"
              rules={[{ required: true, message: t('required') }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </OperateModal>
        <SelectIcon
          ref={selectIconRef}
          onSelect={(icon) => onConfirmSelectIcon(icon)}
        />
      </div>
    );
  }
);
ModelModal.displayName = 'ModelModal';
export default ModelModal;
