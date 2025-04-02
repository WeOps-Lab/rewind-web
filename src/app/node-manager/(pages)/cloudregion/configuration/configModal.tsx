'use client';
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Input, Form, Select, message } from 'antd';
import CustomTable from '@/components/custom-table';
import OperateModal from '@/components/operate-modal';
import type { FormInstance } from 'antd';
import {
  ModalSuccess,
  TableDataItem,
  ModalRef,
} from '@/app/node-manager/types/index';
import { useTranslation } from '@/utils/i18n';
import type { GetProps } from 'antd';
import { useApplyColumns } from './useApplyColumns';
import useApiCloudRegion from '@/app/node-manager/api/cloudregion';
import {
  nodeItemtRes,
  mappedNodeItem,
  VarSourceItem,
  VarResItem,
} from '@/app/node-manager/types/cloudregion';
import type { OptionItem } from '@/app/node-manager/types/index';
import useCloudId from '@/app/node-manager/hooks/useCloudid';
import useApiCollector from '@/app/node-manager/api/collector/index';
import CodeEditor from '@/app/node-manager/components/codeEditor';
import useConfigModalColumns from './configModalColumns';

type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

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
    createconfig,
    getnodelist,
    applyconfig,
    updatecollector,
    getvariablelist,
  } = useApiCloudRegion();
  const [configForm, setConfigForm] = useState<TableDataItem>();
  const [applydata, setApplydata] = useState<mappedNodeItem[]>();
  const [colselectitems, setColselectitems] = useState<OptionItem[]>([]);
  const [configid, setConfigid] = useState<string>('');
  const [editeConfigId, setEditeConfigId] = useState<string>('');
  const [type, setType] = useState<string>('add');
  const [selectedsystem, setSelectedsystem] = useState<string>('Windows');
  const [vardataSource, setVardataSource] = useState<VarSourceItem[]>([]);
  const [nodes, setNodes] = useState<string[]>([]);

  //处理应用的事件
  const handleApply = (key: string) => {
    applyconfig(cloudid, {
      node_id: key,
      collector_configuration_id: configid,
    }).then(() => {
      message.success(t('common.applysuccess'));
    });
    setConfigVisible(true);
  };
  const applycolumns = useApplyColumns({ handleApply, nodes });

  useImperativeHandle(ref, () => ({
    showModal: ({ type, form, key, selectedsystem, nodes }) => {
      // 开启弹窗的交互
      setConfigVisible(true);
      setType(type);
      if (type === 'apply' && selectedsystem && key && nodes) {
        //配置文件运用到那个节点
        setNodes(nodes);
        setConfigid(key);
        setSelectedsystem(selectedsystem);
      } else {
        setEditeConfigId(form?.key);
      }
      setConfigForm(form);
    },
  }));

  //初始化表单的数据
  useEffect(() => {
    if (type === 'apply') {
      getApplydata();
      return;
    }

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
    if (configVisible && ['add', 'edit'].includes(type)) {
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

  const handleCreate = (
    name: string,
    configinfo: string,
    collector: string
  ) => {
    createconfig({
      name,
      collector_id: collector,
      cloud_region_id: Number(cloudid),
      config_template: configinfo,
    }).then(() => {
      onSuccess();
      message.success(t('common.addSuccess'));
    });
  };

  const handleUpdate = (
    name: string,
    collector: string,
    configinfo: string
  ) => {
    updatecollector(editeConfigId, {
      name,
      config_template: configinfo,
      collector_id: collector,
    }).then(() => {
      onSuccess();
      message.success(t('common.updateSuccess'));
    });
  };

  //处理添加和编辑的确定事件
  const handleConfirm = () => {
    // 校验表单
    configformRef.current?.validateFields().then((values) => {
      const { name, collector, configinfo } = values;
      if (type === 'add') {
        handleCreate(name, configinfo, collector);
        setConfigVisible(false);
        return;
      }
      handleUpdate(name, collector, configinfo);
      setConfigVisible(false);
    });
  };

  const onSearch: SearchProps['onSearch'] = (value) => {
    getnodelist({ cloud_region_id: Number(cloudid), name: value }).then(
      (res) => {
        const data = res.map((item: nodeItemtRes) => {
          return {
            key: item.id,
            ip: item.ip,
            operatingsystem: item.operating_system,
            sidecar: !item.status.status ? 'Error' : 'Running',
          };
        });
        const tempdata = data.filter(
          (item: mappedNodeItem) => item.operatingsystem === selectedsystem
        );
        setApplydata(tempdata);
      }
    );
  };

  //选择操作系统
  const handleChangeOperatingsystem = (value: string) => {
    getCollectorlist({ node_operating_system: value }).then((res) => {
      const tempdate = res.map((item: any) => {
        return {
          value: item.id,
          label: item.name,
          template: item.default_template,
        };
      });
      configformRef.current?.setFieldValue('collector', tempdate[0].value);
      configformRef.current?.setFieldValue('configinfo', tempdate[0].template);
      //设置采集器
      setColselectitems(tempdate);
    });
  };

  //选择采集器
  const handleChangeCollector = (value: string) => {
    const tempdata = colselectitems.filter((item) => item.value === value);
    if (tempdata) {
      configformRef.current?.setFieldValue('configinfo', tempdata[0].template);
    }
  };

  //获取应用列表的数据表格
  const getApplydata = () => {
    getnodelist({ cloud_region_id: Number(cloudid) }).then((res) => {
      const data = res.map((item: nodeItemtRes) => {
        return {
          key: item.id,
          ip: item.ip,
          operatingsystem: item.operating_system,
          sidecar: !item.status.status ? 'Running' : 'Error',
        };
      });
      const tempdata = data.filter(
        (item: mappedNodeItem) => item.operatingsystem === selectedsystem
      );
      setApplydata(tempdata);
    });
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

  const showConfigForm = (type: string) => {
    return (
      <Form
        ref={configformRef}
        layout="vertical"
        initialValues={{ operatingsystem: 'linux' }}
        colon={false}
      >
        {type === 'apply' ? (
          <div className="w-full h-full overflow-hidden">
            <div className="sticky top-0 z-10">
              <Search
                className="w-64 mr-[8px] h-[40px]"
                placeholder="input search text"
                enterButton
                onSearch={onSearch}
              />
            </div>
            <div
              className="overflow-y-auto mt-2"
              style={{ maxHeight: 'calc(100% - 50px)' }}
            >
              <CustomTable
                columns={applycolumns}
                dataSource={applydata}
                pagination={{
                  pageSize: 10,
                }}
              />
            </div>
          </div>
        ) : (
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
              name="operatingsystem"
              label={t('node-manager.cloudregion.Configuration.system')}
              rules={[
                {
                  required: true,
                  message: t('common.selectMsg'),
                },
              ]}
            >
              <Select
                defaultValue="linux"
                options={[
                  { value: 'linux', label: 'Linux' },
                  { value: 'windows', label: 'Windows' },
                ]}
                onChange={handleChangeOperatingsystem}
              ></Select>
            </Form.Item>
            <Form.Item
              name="collector"
              label={t('node-manager.cloudregion.Configuration.collector')}
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
        )}
      </Form>
    );
  };

  return (
    <OperateModal
      title={t(`common.${type}`)}
      open={configVisible}
      okText={t('common.confirm')}
      cancelText={t('common.cancel')}
      onCancel={handleCancel}
      onOk={handleConfirm}
      width={800}
    >
      {showConfigForm(type) || ' '}
    </OperateModal>
  );
});

ConfigModal.displayName = 'RuleModal';
export default ConfigModal;
