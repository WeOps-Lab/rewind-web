import { ModalRef, ModalProps } from '@/app/monitor/types';
import { Form, Button, message, InputNumber, Select } from 'antd';
import { cloneDeep } from 'lodash';
import React, { useState, useRef, useImperativeHandle,forwardRef } from 'react';
import { useTranslation } from '@/utils/i18n';
import { useFormItems } from '@/app/monitor/hooks/intergration';
import OperateModal from '@/components/operate-modal';
import {
  COLLECT_TYPE_MAP,
  CONFIG_TYPE_MAP,
  INSTANCE_TYPE_MAP,
  TIMEOUT_UNITS,
} from '@/app/monitor/constants/monitor';
const { Option } = Select;

const UpdateConfig = forwardRef<ModalRef,ModalProps>(
  ({ onSuccess }, ref ) => {
    const [form] = Form.useForm();
    const { t } = useTranslation();
    const [pluginName,setPluginName] = useState<string>('');
    const [collectType, setCollectType] = useState<string>('');
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [modalVisible,setModalVisible] = useState<boolean>(false);
    const [title,setTitle] = useState<string>('');
    const [type,setType] = useState<string>('');
    const [passwordDisabled, setPasswordDisabled] = useState<boolean>(true);
    const [authPasswordDisabled, setAuthPasswordDisabled] =
      useState<boolean>(true);
    const [privPasswordDisabled, setPrivPasswordDisabled] =
      useState<boolean>(true);
    const formRef = useRef(null);
    const authPasswordRef = useRef<any>(null);
    const privPasswordRef = useRef<any>(null);
    const passwordRef = useRef<any>(null);
    
    useImperativeHandle(ref, () => ({
      showModal: ({type,form,title}) => {
        const _form = cloneDeep(form);
        const _types = getKeyByValueStrict(INSTANCE_TYPE_MAP,_form?.config_type);
        const _collectType = COLLECT_TYPE_MAP[_types];
        const _configTypes = CONFIG_TYPE_MAP[_types];
        setCollectType(_collectType);
        setPluginName(_types as string);
        setTitle(title);
        setType(type);
        setModalVisible(true);
        setConfirmLoading(false);
        initData(_collectType, _configTypes);
      }
    }))

    const handleEditAuthPassword = () => {
      if (authPasswordDisabled) {
        form.setFieldsValue({
          authPassword: '',
        });
      }
      setAuthPasswordDisabled(false);
    };
  
    const handleEditPrivPassword = () => {
      if (privPasswordDisabled) {
        form.setFieldsValue({
          privPassword: '',
        });
      }
      setPrivPasswordDisabled(false);
    };
  
    const handleEditPassword = () => {
      if (passwordDisabled) {
        form.setFieldsValue({
          password: '',
        });
      }
      setPasswordDisabled(false);
    };

    // 获取对应键值
    const getKeyByValueStrict = <T extends Record<string, unknown>>(obj: T,value: T[keyof T]): keyof T => {
      const key = (Object.keys(obj) as Array<keyof T>).find((k) => obj[k] === value);
      if (!key) {
        console.log('未找到对应键');
        return '';
      };
      return key;
    }

    // 根据自定义hook，生成不同的模板
    // 使用自定义 Hook
    const { formItems } = useFormItems({
      collectType,
      columns: [],
      authPasswordRef,
      privPasswordRef,
      passwordRef,
      authPasswordDisabled,
      privPasswordDisabled,
      passwordDisabled,
      handleEditAuthPassword,
      handleEditPrivPassword,
      handleEditPassword,
      pluginName,
    });
    
    const initData = (collectType: string,configTypes:string[]) => {
      form.setFieldsValue({
        interval: 10,
      });
      switch (collectType) {
        case 'host':
          form.setFieldsValue({
            metric_type: configTypes,
          });
          break;
        case 'ipmi':
          form.setFieldsValue({
            protocol: 'lanplus',
          });
          break;
        case 'snmp':
          form.setFieldsValue({
            port: 161,
            version: 2,
            timeout: 10,
          });
        case 'middleware':
          form.setFieldsValue({
            timeout: 10,
          });
      }
    };

    const handleCancel = () => {
      form.resetFields();
      setModalVisible(false);
    };

    const handleSubmit = () => {
      form.validateFields().then((values)=>{
        setConfirmLoading(true);
        onSuccess()
        setTimeout(()=>{
          setConfirmLoading(false)
          console.log(type,values);
          message.success(t('common.successfullyModified'))
          setModalVisible(false)
        },3000)
      })
    };
    
    return(
      <OperateModal
        width={550}
        title={title}
        visible={modalVisible}
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
        <div className="px-[10px]">
          <Form ref={formRef} form={form} name="basic" layout="vertical">
            {formItems}
            <Form.Item required label={t('monitor.intergrations.interval')}>
              <Form.Item
                noStyle
                name="interval"
                rules={[
                  {
                    required: true,
                    message: t('common.required'),
                  },
                ]}
              >
                <InputNumber
                  className="mr-[10px]"
                  min={1}
                  precision={0}
                  addonAfter={
                    <Select style={{ width: 116 }} defaultValue="s">
                      {TIMEOUT_UNITS.map((item: string) => (
                        <Option key={item} value={item}>
                          {item}
                        </Option>
                      ))}
                    </Select>
                  }
                />
              </Form.Item>
              <span className="text-[12px] text-[var(--color-text-3)]">
                {t('monitor.intergrations.intervalDes')}
              </span>
            </Form.Item>
          </Form>
        </div>
      </OperateModal>
    )
  }
);

UpdateConfig.displayName = "UpdateConfig"

export default UpdateConfig