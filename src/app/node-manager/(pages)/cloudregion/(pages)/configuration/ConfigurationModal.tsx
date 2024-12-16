"use client";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Input, Form, Select, Table, Tag, Button, message } from "antd";
import OperateModal from "@/components/operate-modal";
import type { FormInstance, TableColumnsType } from "antd";
import data from "../../mokdata/cloudregion";
import {
  ConfigurationModalSuccess,
  ModalRefConfiguration, sidecarinfotype, ConfigurationDataType,
  SidecardForm
} from "@/app/node-manager/types/cloudregion"
import { useTranslation } from '@/utils/i18n';
import type { GetProps } from 'antd';
type SearchProps = GetProps<typeof Input.Search>;


const ConfigurationModal = forwardRef<ModalRefConfiguration, ConfigurationModalSuccess>(
  ({ onSuccess }, ref) => {
    const configurationformRef = useRef<FormInstance>(null);
    //设置弹窗状态
    const [configurationVisible, setConfigurationVisible] =
      useState<boolean>(false);
    //设置表当的数据
    const [configurationFormData, setConfigurationFormData] =
      useState<ConfigurationDataType>();
    const [applydata, setApplydata] = useState<SidecardForm[]>([])
    const [type, setType] = useState<string>("");
    const { Search } = Input;
    const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);
    const { t } = useTranslation()
    useImperativeHandle(ref, () => ({
      showModal: ({ type, form, key }) => {
        // 开启弹窗的交互 
        setConfigurationVisible(true);
        setType(type);
        if (type === 'apply') {
          if (key) {
            canFilterOperatingSystem(key)
          }
        } else if (type === 'edit') {
          setConfigurationFormData(form)
        }

      },
    }));

    //数据
    // 用户表格数据
    const applycolumns: TableColumnsType = [
      {
        title: t('node-manager.cloudregion.Configuration.ip'),
        dataIndex: "ip",
      },
      {
        title: t('node-manager.cloudregion.Configuration.System'),
        dataIndex: "operatingsystem",
      },
      {
        title: t('node-manager.cloudregion.Configuration.sidecar'),
        dataIndex: "sidecar",
        className: "table-cell-center",
        render: (key: string) => {
          if (key === "Running") {
            return (
              <Tag bordered={false} color="success">
                {key}
              </Tag>
            );
          }
          return (
            <Tag bordered={false} color="error">
              {key}
            </Tag>
          );
        },
      },
      {
        title: t('common.Actions'),
        dataIndex: "key",
        fixed: "right",
        render: (key: string, sidecarinfo) => {
          function show(sidecarinfo: { sidecar: string }) {
            if (sidecarinfo.sidecar === 'Running') {
              return false
            } else {
              return true
            }
          }
          const showbtn = show(sidecarinfo as sidecarinfotype)
          return (<Button disabled={showbtn} type="link" onClick={() => { setConfigurationVisible(false); message.success('add success!') }}>Apply</Button>)
        },
      },
    ];
    //初始化表单的数据
    useEffect(() => {
      configurationformRef.current?.resetFields()
      if (configurationVisible && type === 'edit') {
        configurationformRef.current?.setFieldsValue(configurationFormData);
      } else {
        configurationformRef.current?.setFieldsValue({
          operatingsystem: 'linux',
          collector: 'mericbeat',
        })
      }
    }, [configurationVisible, configurationformRef]);

    //关闭用户的弹窗(取消和确定事件)
    const handleCancel = () => {
      setConfigurationVisible(false);
    };
    const handleConfirm = async () => {
      const data = await configurationformRef.current?.validateFields();
      console.log('数据', data)
      onSuccess();
      setConfigurationVisible(false);
    };

    //选择操作系统
    function handleChangeOperatingsystem(value: string) {
      console.log('选择的操作系统是', value)
    }
    //选择采集器
    function handleChangeCollector(value: string) {
      console.log('选择的采集器是', value)
    }

    function showConfigurationForm(type: string) {
      switch (type) {
        case "add":
          return (<Form ref={configurationformRef} layout="vertical" colon={false}>
            <Form.Item
              name="name"
              label={t('node-manager.cloudregion.Configuration.Name')}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="operatingsystem"
              label={t('node-manager.cloudregion.Configuration.system')}
            >
              <Select
                options={[
                  { value: 'linux', label: 'Linux' },
                  { value: 'windows', label: 'Windows' }
                ]}
                onChange={handleChangeOperatingsystem}
              >
              </Select>
            </Form.Item>
            <Form.Item
              name="collector"
              label={t('node-manager.cloudregion.Configuration.collector')}
            >
              <Select
                options={[
                  { value: 'mericbeat', label: 'Mericbeat' },
                  { value: 'mericbeat1', label: 'Mericbeat1' },
                ]}
                onChange={handleChangeCollector}
              >
              </Select>
            </Form.Item>
            <Form.Item
              name="collector"
              label=" "
            >
              <div className="h-[231px] bg-orange-200"></div>
            </Form.Item>
          </Form>);
        case "edit":
          return (
            <Form ref={configurationformRef} layout="vertical" colon={false}>
              <Form.Item
                name="name"
                label={t('node-manager.cloudregion.Configuration.Name')}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="operatingsystem"
                label={t('node-manager.cloudregion.Configuration.system')}
              >
                <Select
                  options={[
                    { value: 'linux', label: 'Linux' },
                    { value: 'windows', label: 'Windows' }
                  ]}
                  onChange={handleChangeOperatingsystem}
                >
                </Select>
              </Form.Item>
              <Form.Item
                name="collector"
                label={t('node-manager.cloudregion.Configuration.collector')}
              >
                <Select
                  options={[
                    { value: 'mericbeat', label: 'Mericbeat' },
                    { value: 'mericbeat1', label: 'Mericbeat1' },
                  ]}
                  onChange={handleChangeCollector}
                >
                </Select>
              </Form.Item>
              <Form.Item
                name="collector"
                label=" "
              >
                <div className="h-[231px] bg-orange-200"></div>
              </Form.Item>
            </Form>
          );
        case "apply":
          return (

            <div className="w-full h-full">
              <div>
                <Search className="w-64 mr-[8px]" placeholder="input search text" onSearch={onSearch} enterButton />
              </div>
              <div className="mt-4"><Table
                columns={applycolumns}
                dataSource={applydata}
                pagination={{
                  pageSize: 20,
                }}
                scroll={{ y: "calc(100vh - 400px)", x: "600px" }}
              /></div>
            </div>
          );
      }
    }

    function getOperateModaltitle(type: string) {
      if (type === "add") {
        return t("common.add");
      } else if (type === "edit") {
        return t("common.edit");;
      } else {
        return t("common.apply");
      }
    }

    //对操作系统过滤
    function canFilterOperatingSystem(key: string) {
      const operatingsystem = data.filter((item) => {
        if (item.key === key) {
          return item.operatingsystem
        }
      })
      const temporaryformdata = data.filter((item) => {
        if (item.operatingsystem === operatingsystem[0].operatingsystem) {
          return item
        }
      })
      setApplydata(temporaryformdata)
    }
    return (
      <OperateModal
        title={getOperateModaltitle(type)}
        visible={configurationVisible}
        onCancel={handleCancel}
        onOk={handleConfirm}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
      >
        {showConfigurationForm(type)}
      </OperateModal>
    );
  }
);
ConfigurationModal.displayName = "RuleModal";
export default ConfigurationModal;
export type { ModalRefConfiguration as ModalRef };
