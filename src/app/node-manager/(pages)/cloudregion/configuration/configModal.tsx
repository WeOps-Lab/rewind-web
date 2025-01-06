"use client";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Input, Form, Select, message } from "antd";
import CustomTable from '@/components/custom-table'
import OperateModal from "@/components/operate-modal";
import type { FormInstance } from "antd";
import { ModalSuccess, TableDataItem, ModalRef } from "@/app/node-manager/types/index";
import { useTranslation } from '@/utils/i18n';
import type { GetProps } from 'antd';
import { useApplyColumns } from "./useApplyColumns";
import useApiCloudRegion from "@/app/node-manager/api/cloudregion";
import { IConfiglistprops, nodeItemtRes, mappedNodeItem } from '@/app/node-manager/types/cloudregion';
import type { OptionItem } from '@/app/node-manager/types/index';
import useCloudId from "@/app/node-manager/hooks/useCloudid";

type SearchProps = GetProps<typeof Input.Search>;
const { Search, TextArea } = Input;

const ConfigModal = forwardRef<ModalRef, ModalSuccess>(
  ({ onSuccess }, ref) => {
    const configformRef = useRef<FormInstance>(null);
    //设置弹窗状态
    const [configVisible, setConfigVisible] =
      useState<boolean>(false);
    //设置表当的数据
    const { t } = useTranslation();
    const cloudid = useCloudId();
    const { createconfig, getconfiglist, getnodelist, applyconfig, updatecollector } = useApiCloudRegion();
    const [configForm, setConfigForm] = useState<TableDataItem>();
    const [applydata, setApplydata] = useState<mappedNodeItem[]>();
    const [colselectitems, setColselectitems] = useState<OptionItem[]>([])
    const [configid, setConfigid] = useState<string>('')
    const [editeConfigId, setEditeConfigId] = useState<string>('')
    const [type, setType] = useState<string>("");
    const [selectedsystem, setSelectedsystem] = useState<string>('Windows');
    //处理应用的事件
    const handleApply = (key: string) => {

      applyconfig(
        cloudid,
        {
          node_id: key,
          collector_configuration_id: configid,
        })
      message.success('apply success!')
      setConfigVisible(true);
    }
    const applycolumns = useApplyColumns({ handleApply })

    useImperativeHandle(ref, () => ({
      showModal: ({ type, form, key, selectedsystem }) => {
        // 开启弹窗的交互 
        setConfigVisible(true);
        setType(type);
        if (type === 'apply' && selectedsystem && key) {
          setConfigid(key)
          setSelectedsystem(selectedsystem)
        } else {
          setEditeConfigId(form?.key)
        }
        setConfigForm(form)
      },
    }));

    //初始化表单的数据
    useEffect(() => {

      if (type === 'apply') {
        getApplydata();
        return
      }
      //add发起请求，设置表单的数据
      if (configVisible && (['add', 'edit'].includes(type))) {
        configformRef.current?.resetFields();
        configformRef.current?.setFieldsValue(configForm);
      }
    }, [configVisible, configForm]);

    //关闭用户的弹窗(取消和确定事件)
    const handleCancel = () => {
      setConfigVisible(false);
    };

    //处理添加和编辑的确定事件
    const handleConfirm = () => {
      // 校验表单
      configformRef.current?.validateFields().then((values) => {
        const { name, collector, cloudid, configinfo } = values
        if (type === 'add') {
          createconfig({
            name,
            collector_id: collector,
            cloud_region_id: Number(cloudid),
            config_template: configinfo,
          })
          onSuccess();
          setConfigVisible(false);
          return;
        }
        updatecollector(
          editeConfigId,
          {
            name,
            config_template: configinfo,
            collector_id: collector,
          }
        )
        onSuccess();
        setConfigVisible(false);

      })
    };

    const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);

    //选择操作系统
    const handleChangeOperatingsystem = (value: string) => {
      const cloud_region_id = 1;
      getconfiglist(cloud_region_id).then((res) => {
        const temporaryformdata = res.filter((item: IConfiglistprops) => {
          if (item.operating_system === value) {
            return {
              Collector: item.collector,
              configinfo: item.config_template
            }
          }
        });
        const uniquedata = uniqueByCollector(temporaryformdata);
        const temdata = uniquedata.map((item: IConfiglistprops) => {
          return { value: item.collector, label: item.collector, template: item.config_template }
        })
        configformRef.current?.setFieldValue("collector", temdata[0].value);
        configformRef.current?.setFieldValue("configinfo", temdata[0].template);

        //设置采集器
        setColselectitems(temdata);
      })

    }
    //选择采集器
    const handleChangeCollector = (value: string) => {
      const tempdata = colselectitems.filter((item) => item.value === value);
      if (tempdata) {
        configformRef.current?.setFieldValue("configinfo", tempdata[0].template);
      }
      console.log('选择的采集器是', value, colselectitems)
    }

    // 去除重复的collector
    const uniqueByCollector = (items: Array<{ collector: string, config_template: string }>) => {
      const itemsMap = new Map();
      items.forEach((item) => {
        // 判断collector是否重复，如果不重复则存入Map
        if (!itemsMap.has(item.collector)) {
          itemsMap.set(item.collector, item);
        }
      });
      // 将Map中的values转化为数组
      return Array.from(itemsMap.values());
    };

    //获取应用列表的数据表格
    const getApplydata = () => {
      const id = 1;
      getnodelist(id)
        .then((res) => {
          const data = res.map((item: nodeItemtRes) => {
            return {
              key: item.id,
              ip: item.ip,
              operatingsystem: item.operating_system,
              sidecar: item.status.status === "0" ? "Error" : "Running",
            };
          });
          const tempdata = data.filter((item: mappedNodeItem) => item.operatingsystem === selectedsystem);
          setApplydata(tempdata);
        })
    }

    const showConfigForm = (type: string) => {

      return (
        <Form ref={configformRef} layout="vertical" colon={false}>
          {type === "apply" ? <div>
            <Search className="w-64 mr-[8px]" placeholder="input search text" enterButton onSearch={onSearch} />
            <CustomTable
              className="mt-4"
              columns={applycolumns}
              dataSource={applydata}
              pagination={{
                pageSize: 20,
              }}
              scroll={{ y: "calc(100vh - 480px)", x: "calc(100vw - 700px)" }}
            />
          </div>
            :
            <><Form.Item
              name="name"
              label={t('node-manager.cloudregion.Configuration.Name')}
              rules={[
                {
                  required: true,
                  message: t("common.inputMsg"),
                },
              ]}
            >
              <Input />
            </Form.Item><Form.Item
              name="operatingsystem"
              label={t('node-manager.cloudregion.Configuration.system')}
              rules={[
                {
                  required: true,
                  message: t("common.selectMsg"),
                },
              ]}
            >
              <Select
                defaultValue="linux"
                options={[
                  { value: 'linux', label: 'Linux' },
                  { value: 'windows', label: 'Windows' }
                ]}
                onChange={handleChangeOperatingsystem}
              >
              </Select>
            </Form.Item><Form.Item
              name="collector"
              label={t('node-manager.cloudregion.Configuration.collector')}
              rules={[
                {
                  required: true,
                  message: t("common.selectMsg"),
                },
              ]}
            >
              <Select
                options={colselectitems}
                onChange={handleChangeCollector}
              >
              </Select>
            </Form.Item><Form.Item
              name="configinfo"
              label=" "
            >
              <TextArea
                rows={8}
                style={{ resize: 'none' }}
                disabled={true} />
            </Form.Item></>
          }
        </Form>
      )
    }

    return (
      <OperateModal
        title={t(`common.${type}`)}
        visible={configVisible}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
        onCancel={handleCancel}
        onOk={handleConfirm}
        width={type === "apply" ? 800 : 600}
      >
        {showConfigForm(type)!}
      </OperateModal>
    );
  }
);

ConfigModal.displayName = "RuleModal";
export default ConfigModal;