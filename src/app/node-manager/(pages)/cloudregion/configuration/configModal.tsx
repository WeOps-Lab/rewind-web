'use client';
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Input, Form, Select, Button, message } from 'antd';
import CustomTable from '@/components/custom-table';
import OperateModal from '@/components/operate-modal';
import type { FormInstance } from 'antd';
import {
  ModalSuccess,
  TableDataItem,
  ModalRef,
} from '@/app/node-manager/types/index';
import { useTranslation } from '@/utils/i18n';
import useApiCloudRegion from '@/app/node-manager/api/cloudregion';
import {
  VarSourceItem,
  VarResItem,
} from '@/app/node-manager/types/cloudregion';
import type { OptionItem } from '@/app/node-manager/types/index';
import useCloudId from '@/app/node-manager/hooks/useCloudid';
import useApiCollector from '@/app/node-manager/api/collector/index';
import CodeEditor from '@/app/node-manager/components/codeEditor';
import { useConfigModalColumns } from '@/app/node-manager/hooks/configuration';

const ConfigModal = forwardRef<ModalRef, ModalSuccess>(({ onSuccess }, ref) => {
  const configformRef = useRef<FormInstance>(null);
  //设置弹窗状态
  const [configVisible, setConfigVisible] = useState<boolean>(false);
  const columns = useConfigModalColumns();
  //设置表当的数据
  const { t } = useTranslation();
  const { getCollectorlist } = useApiCollector();
  const cloudid = useCloudId();
  const {
    updatecollector,
    getvariablelist,
  } = useApiCloudRegion();
  const [configForm, setConfigForm] = useState<TableDataItem>();
  const [colselectitems, setColselectitems] = useState<OptionItem[]>([]);
  const [editeConfigId, setEditeConfigId] = useState<string>('');
  const [type, setType] = useState<string>('add');
  const [vardataSource, setVardataSource] = useState<VarSourceItem[]>([]);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({
    showModal: ({ type, form }) => {
      // 开启弹窗的交互
      setConfigVisible(true);
      setType(type);
      setEditeConfigId(form?.key);
      setConfigForm(form);
    },
  }));

  //初始化表单的数据
  useEffect(() => {
    //获取变量列表
    getvariablelist(Number(cloudid)).then((res) => {
      const tempdata: VarSourceItem[] = [];
      res.forEach((item: VarResItem) => {
        tempdata.push({
          key: item.id,
          name: item.key,
          description: item.description || '--',
        });
      });
      setVardataSource(tempdata);
    });
    //add发起请求，设置表单的数据
    if (configVisible && ['edit'].includes(type)) {
      configformRef.current?.resetFields();
      configformRef.current?.setFieldsValue(configForm);
    }

    //获取系统的类型，并根据系统的类型设置采集器的列表
    getCollectorlist({
      node_operating_system: configForm?.operatingsystem,
    }).then((res) => {
      const tempdate = res.map((item: any) => {
        return {
          value: item.id,
          label: item.name,
          template: item.default_template,
        };
      });
      if (!configformRef.current?.getFieldValue('collector')) {
        configformRef.current?.setFieldValue('collector', tempdate[0].value);
      }
      setColselectitems(tempdate);
    });
  }, [configVisible, configForm]);

  //关闭用户的弹窗(取消和确定事件)
  const handleCancel = () => {
    setConfigVisible(false);
  };

  const handleUpdate = (
    name: string,
    collector: string,
    nodes: string[],
    configinfo: string
  ) => {
    updatecollector(editeConfigId, {
      name,
      config_template: configinfo,
      collector_id: collector,
    }).then(() => {
      onSuccess();
      setConfirmLoading(false);
      setConfigVisible(false);
      message.success(t('common.updateSuccess'));
    });
  };

  //处理添加和编辑的确定事件
  const handleConfirm = () => {
    // 校验表单
    configformRef.current?.validateFields().then((values) => {
      console.log(values);
      setConfirmLoading(true);
      const { name, nodes, collector, configinfo } = values;
      handleUpdate(name, nodes, collector, configinfo);
    });
  };

  //选择采集器
  const handleChangeCollector = (value: string) => {
    const tempdata = colselectitems.filter((item) => item.value === value);
    if (tempdata) {
      configformRef.current?.setFieldValue('configinfo', tempdata[0].template);
    }
  };

  const ConfigEditorWithParams = ({
    value,
    vardataSource,
    columns,
    onChange,
  }: {
    value: string;
    vardataSource: VarSourceItem[];
    columns: any;
    onChange: any;
  }) => {
    const handleEditorChange = (newValue: string | undefined) => {
      if (newValue !== undefined) {
        onChange(newValue);
      }
    };
    return (
      <div className="flex">
        {/* 左侧输入区域 */}
        <CodeEditor
          value={value}
          onChange={handleEditorChange}
          className="mr-4"
          width="400px"
          height="250px"
          mode="python"
          theme="monokai"
          name="editor"
        />

        {/* 右侧参数说明和表格 */}
        <div className="flex flex-col w-full overflow-hidden">
          {/* 标题和描述 */}
          <h1 className="font-bold flex-shrink-0 text-sm">
            {t('node-manager.cloudregion.Configuration.parameterdes')}
          </h1>
          <p className="flex-shrink-0 text-xs mt-[4px] mb-[10px]">
            {t('node-manager.cloudregion.Configuration.varconfig')}
          </p>
          <CustomTable
            size="small"
            className="w-full"
            scroll={{ y: '160px' }}
            dataSource={vardataSource}
            columns={columns}
          />
        </div>
      </div>
    );
  };

  const showConfigForm = () => {
    return (
      <Form
        ref={configformRef}
        layout="vertical"
        initialValues={{ operatingsystem: 'linux' }}
        colon={false}
      >
        <>
          <Form.Item
            name="name"
            label={t('common.name')}
            rules={[
              {
                required: true,
                message: t('common.inputMsg'),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="nodes"
            label={t('common.node')}
            rules={[
              {
                required: true,
                message: t('common.inputMsg'),
              },
            ]}
          >
            <Input />
          </Form.Item>
          {/* <Form.Item
              name="sidecar"
              label={t('node-manager.cloudregion.Configuration.sidecar')}
              rules={[
                {
                  required: true,
                  message: t('common.inputMsg'),
                },
              ]}
            >
              <Input />
            </Form.Item> */}
          <Form.Item
            name="collector"
            // label={t('node-manager.cloudregion.Configuration.collector')}
            label={t('node-manager.cloudregion.Configuration.sidecar')}
            rules={[
              {
                required: true,
                message: t('common.selectMsg'),
              },
            ]}
          >
            <Select
              options={colselectitems}
              onChange={handleChangeCollector}
            ></Select>
          </Form.Item>
          <Form.Item
            name="configinfo"
            label={t('node-manager.cloudregion.Configuration.template')}
            rules={[
              {
                required: true,
                message: t('common.inputMsg'),
              },
            ]}
          >
            {
              <ConfigEditorWithParams
                vardataSource={vardataSource}
                columns={columns}
                value={''}
                onChange={undefined}
              ></ConfigEditorWithParams>
            }
          </Form.Item>
        </>
        {/* )} */}
      </Form>
    );
  };

  return (
    <OperateModal
      title={t(`common.${type}`)}
      open={configVisible}
      onCancel={handleCancel}
      width={800}
      footer={
        <div>
          <Button type="primary" className="mr-[10px]" loading={confirmLoading} onClick={handleConfirm}>{t('common.confirm')}</Button>
          <Button onClick={handleCancel}>{t('common.cancel')}</Button>
        </div>
      }
    >
      {showConfigForm() || ' '}
    </OperateModal>
  );
});

ConfigModal.displayName = 'RuleModal';
export default ConfigModal;
