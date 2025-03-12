import { ModalRef } from '@/app/monitor/types';
import { Form, Button, message, InputNumber, Select } from 'antd';
import React, { useState, useRef, useEffect,useImperativeHandle,forwardRef } from 'react';
import { useTranslation } from '@/utils/i18n';
import { deepClone } from '@/app/monitor/utils/common';
import {
  COLLECT_TYPE_MAP,
  CONFIG_TYPE_MAP,
  INSTANCE_TYPE_MAP,
  TIMEOUT_UNITS,
} from '@/app/monitor/constants/monitor';
import { useSearchParams } from 'next/navigation';
import useApiClient from '@/utils/request';
import { useFormItems } from '@/app/monitor/hooks/intergration';
import { TableDataItem } from '@/app/monitor/types';
const { Option } = Select;
import Permission from '@/components/permission';
import OperateModal from '@/components/operate-modal';
interface ModalProps {
  onSuccess: () => void;
}

const UpdateConfig = forwardRef<ModalRef,ModalProps>(
  ({ onSuccess }, ref ) => {
    const [form] = Form.useForm();
    const formRef = useRef(null);
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const { post, isLoading } = useApiClient();
    const pluginName = searchParams.get('collect_type') || '';
    const objId = searchParams.get('id') || '';
    const objectName = searchParams.get('name') || '';
    const collectType = COLLECT_TYPE_MAP[pluginName];
    const configTypes = CONFIG_TYPE_MAP[pluginName];
    const instanceType = INSTANCE_TYPE_MAP[pluginName];
    const authPasswordRef = useRef<any>(null);
    const privPasswordRef = useRef<any>(null);
    const passwordRef = useRef<any>(null);
    const [authPasswordDisabled, setAuthPasswordDisabled] =
      useState<boolean>(true);
    const [privPasswordDisabled, setPrivPasswordDisabled] =
      useState<boolean>(true);
    const [passwordDisabled, setPasswordDisabled] = useState<boolean>(true);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const [modalVisible,setModalVisible] = useState<boolean>(false);
    const [title,setTitle] = useState<string>('');
    
    useImperativeHandle(ref, () => ({
      showModal: ({type,form,title}) => {
        console.log(type,form);
        
        setModalVisible(true)
        setTitle(title)
        onSuccess()
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

    // 使用自定义 Hook
    const { formItems, configText } = useFormItems({
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

    

    useEffect(() => {
      if (!authPasswordDisabled && authPasswordRef?.current) {
        authPasswordRef.current.focus();
      }
    }, [authPasswordDisabled]);

    useEffect(() => {
      if (!privPasswordDisabled && privPasswordRef?.current) {
        privPasswordRef.current.focus();
      }
    }, [privPasswordDisabled]);

    useEffect(() => {
      if (!passwordDisabled && passwordRef?.current) {
        passwordRef.current.focus();
      }
    }, [passwordDisabled]);

    useEffect(() => {
      if (isLoading) return;
      initData();
    }, [isLoading]);

    const initData = () => {
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

    const handleSave = () => {
      form.validateFields().then((values) => {
        // 处理表单提交逻辑
        const _values = deepClone(values);
        _values.instance_id = getInstId(_values);
        _values.instance_type = instanceType;
        _values.collect_type = collectType;
        _values.config_type = configTypes[0] || '';
        getConfigText(_values);
      });
    };

    const getInstId = (row: TableDataItem) => {
      switch (collectType) {
        case 'host':
          return row.monitor_ip;
        case 'trap':
          return 'trap' + row.monitor_ip;
        case 'web':
          return row.monitor_url;
        case 'ping':
          return row.monitor_url;
        case 'middleware':
          return row.monitor_url;
        case 'docker':
          return row.endpoint;
        case 'database':
          return row.server || `${row.host}:${row.port}`;
        default:
          return objectName + '-' + (row.monitor_ip || '');
      }
    };

    const getConfigText = async (params: TableDataItem) => {
      try {
        setConfirmLoading(true);
        await post(
          `/monitor/api/monitor_instance/${objId}/check_monitor_instance/`,
          {
            instance_id: params.instance_id,
            instance_name: params.instance_id,
          }
        );
        let _configMsg = deepClone(configText);
        if (collectType === 'snmp') {
          _configMsg = _configMsg[`v${params.version}`];
        }
        if (collectType === 'host') {
          _configMsg = params.metric_type.reduce((pre: string, cur: string) => {
            return (pre += _configMsg[cur]);
          }, '');
        }
        // setConfigMsg(replaceTemplate(_configMsg as string, params));
        message.success(t('common.successfullyAdded'));
      } finally {
        setConfirmLoading(false);
      }
    };

    // const replaceTemplate = (
    //   template: string,
    //   data: { [key: string]: string | number }
    // ): string => {
    //   return Object.keys(data).reduce((acc, key) => {
    //     // 使用正则表达式来匹配模板字符串中的 ${key} 或 $key
    //     const regex = new RegExp(`\\$${key}`, 'g');
    //     // 替换匹配到的内容为对象中的值
    //     return acc.replace(regex, data[key].toString());
    //   }, template);
    // };

    const handleCancel = () => {
      setModalVisible(false);
    };

    const handleSubmit = () => {
      // formRef.current
    };
    
    return(
      <OperateModal
        width={600}
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
          <Form form={form} ref={formRef} name="basic" layout="vertical">
            {/* {formItems && (
              <p className="mb-[20px]">
                {t('monitor.intergrations.configureStepIntro')}1111
              </p>
            )} */}
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
          <Permission requiredPermissions={['Add']}>
            <Button type="primary" loading={confirmLoading} onClick={handleSave}>
              {t('monitor.intergrations.generateConfiguration')}
            </Button>
          </Permission>
        </div>
      </OperateModal>
    )
  }
);

UpdateConfig.displayName = "UpdateConfig"

export default UpdateConfig