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
import data from "@/app/node-manager/mockdata/node";
import { ModalSuccess, TableDataItem, ModalRef } from "@/app/node-manager/types/common";
import type { SidecardForm } from "@/app/node-manager/types/cloudregion"
import { useTranslation } from '@/utils/i18n';
import type { GetProps } from 'antd';
import { useApplyColumns } from "./useApplyColumns";
type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;


const ConfigModal = forwardRef<ModalRef, ModalSuccess>(
  ({ onSuccess }, ref) => {
    const configformRef = useRef<FormInstance>(null);
    //设置弹窗状态
    const [configVisible, setConfigVisible] =
      useState<boolean>(false);
    //设置表当的数据
    const [configForm, setConfigForm] = useState<TableDataItem>();
    const [applydata, setApplydata] = useState<SidecardForm[]>([])
    const [type, setType] = useState<string>("");
    const { t } = useTranslation();
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
      configformRef.current?.resetFields();
      configformRef.current?.setFieldsValue(configForm);
    }, [configVisible, configformRef]);

    //关闭用户的弹窗(取消和确定事件)
    const handleCancel = () => {
      setConfigVisible(false);
    };
    const handleConfirm = async () => {
      const data = await configformRef.current?.validateFields();
      console.log('数据', data)
      onSuccess();
      setConfigVisible(false);
    };

    const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);

    //处理应用的事件
    function handleApply() {
      setConfigVisible(false);
      message.success('apply success!')
    }

    //选择操作系统
    function handleChangeOperatingsystem(value: string) {
      console.log('选择的操作系统是', value)
    }
    //选择采集器
    function handleChangeCollector(value: string) {
      console.log('选择的采集器是', value)
    }

    //对操作系统过滤
    function filterSystem(key: string) {
      const selectedItem = data.find((item) => item.key === key);
      if (!selectedItem) {
        return;
      }
      const { operatingsystem } = selectedItem;
      const temporaryformdata = data.filter((item) => item.operatingsystem === operatingsystem);
      setApplydata(temporaryformdata);
    }

    function showConfigForm(type: string) {
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