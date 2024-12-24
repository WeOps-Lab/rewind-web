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
import { data } from "@/app/node-manager/mockdata/cloudregion/node";
import { ModalSuccess, TableDataItem, ModalRef } from "@/app/node-manager/types/index";
import type { SidecardForm } from "@/app/node-manager/types/cloudregion"
import { useTranslation } from '@/utils/i18n';
import type { GetProps } from 'antd';
import { useApplyColumns } from "./useApplyColumns";
import useApiCloudRegion from "@/app/node-manager/api/cloudregion";
import {IConfiglistprops} from '@/app/node-manager/types/cloudregion';
type SearchProps = GetProps<typeof Input.Search>;
const { Search, TextArea } = Input;



const ConfigModal = forwardRef<ModalRef, ModalSuccess>(
  ({ onSuccess }, ref) => {
    const configformRef = useRef<FormInstance>(null);
    //设置弹窗状态
    const [configVisible, setConfigVisible] =
      useState<boolean>(false);
    //设置表当的数据
    const [configForm, setConfigForm] = useState<TableDataItem>();
    const [applydata, setApplydata] = useState<SidecardForm[]>([]);
    const [colselectitems, setColselectitems] = useState<SidecardForm[]>([])
    const [type, setType] = useState<string>("");
    const { t } = useTranslation();
    const {createconfig,getconfiglist}=useApiCloudRegion();

    //处理应用的事件
    const handleApply = () => {
      setConfigVisible(true);
      message.success('apply success!')
    }
    const applycolumns = useApplyColumns({ handleApply })

    useImperativeHandle(ref, () => ({
      showModal: ({ type, form, key }) => {
        // 开启弹窗的交互 
        setConfigVisible(true);
        setType(type);
        if (type === 'apply') {
          if (key) {
            filterSystem(key)
            return
          }
        }
        setConfigForm(form)
      },
    }));


    //初始化表单的数据
    useEffect(() => {
      // configformRef.current?.resetFields();
      configformRef.current?.setFieldsValue(configForm);
     
    }, [configVisible]);

    //关闭用户的弹窗(取消和确定事件)
    const handleCancel = () => {
      setConfigVisible(false);
    };
    const handleConfirm = async () => {
      const data = await configformRef.current?.validateFields();
      if(type==='add'){
        console.log('fdhhf')
        createconfig({
          name:data.name,
          collector_id:data.collector,
          cloud_region_id:1,
          config_template:'fdfdfd'})
        return
      }
      setConfigVisible(false);
      onSuccess();
    };

    const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);


    //选择操作系统
    const handleChangeOperatingsystem = (value: string) => {
      getconfiglist(1).then((res) => {
        const temporaryformdata = res.filter((item:IConfiglistprops) =>{
          if(item.operating_system === value){
            return {
              Collector:item.collector,
              configinfo:item.config_template
            }
          }
        });
        const temdata=temporaryformdata.map((item:IConfiglistprops)=>{
          return { value: item.collector, label: item.collector }
        })
        //设置采集器
        setColselectitems(temdata);
        console.log('temporaryformdata', temporaryformdata)
      })
      
    }
    //选择采集器
    const handleChangeCollector = (value: string) => {
      console.log('选择的采集器是', value)
    }

    //对操作系统过滤
    const filterSystem = (key: string) => {
      const selectedItem = data.find((item) => item.key === key);
      if (!selectedItem) {
        return;
      }
      const { operatingsystem } = selectedItem;
      const temporaryformdata = data.filter((item) => item.operatingsystem === operatingsystem);
      setApplydata(temporaryformdata);
    }

    const showConfigForm = (type: string) => {
      if (type === "apply") {
        return (
          <div className="w-full h-full">
            <div>
              <Search className="w-64 mr-[8px]" placeholder="input search text" enterButton onSearch={onSearch} />
            </div>
            <div className="mt-4"><CustomTable
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
      return (<Form ref={configformRef} layout="vertical" colon={false}>
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
            options={colselectitems}
            onChange={handleChangeCollector}
          >
          </Select>
        </Form.Item>
        <Form.Item
          name="configinfo"
          label=" "
        >
          <TextArea
            rows={8}
            style={{ resize: 'none' }}
            disabled={true}
          />
        </Form.Item>
      </Form>);
    }

    return (
      <OperateModal
        title={t(`common.${type}`)}
        visible={configVisible}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
        onCancel={handleCancel}
        onOk={handleConfirm}
      >
        {showConfigForm(type)}
      </OperateModal>
    );
  }
);
ConfigModal.displayName = "RuleModal";
export default ConfigModal;