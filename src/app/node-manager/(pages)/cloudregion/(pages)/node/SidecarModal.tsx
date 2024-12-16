"use client";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Input, Form, Select, message } from "antd";
import OperateModal from "@/components/operate-modal";
import { useTranslation } from "@/utils/i18n";
import type { FormInstance } from "antd";

//传入modal的参数类型成功的回调
interface ModalProps {
  onSuccess: () => void;
}
//调用弹窗接口传入的类型
interface ModalConfig {
  type: string;
  form?: ConfigurationForm;
}
//引用对象的类型
interface ModalRef {
  showModal: (config: ModalConfig) => void;
}

interface ConfigurationForm {
  name: string;
  key: string;
  cllector: string;
  operatingsystem: string;
  nodecount: string;
}

const SidecarModal = forwardRef<ModalRef, ModalProps>(
  ({ onSuccess }, ref) => {
    const sidecarformRef = useRef<FormInstance>(null);
    //设置弹窗状态
    const [SidecarVisible, setSidecarVisible] =
      useState<boolean>(false);
    //设置表当的数据
    const [sidecarFormData, setSidecarFormData] =
      useState<ConfigurationForm>();
    const [type, setType] = useState<string>("");
    const { t } = useTranslation();
    useImperativeHandle(ref, () => ({
      showModal: ({ type, form }) => {
        // 开启弹窗的交互
        setSidecarVisible(true);
        setType(type);
        setSidecarFormData(form);
      },
    }));




    //初始化表单的数据
    useEffect(() => {
      if (SidecarVisible) {
        sidecarformRef.current?.resetFields()
      }
    }, [SidecarVisible, sidecarFormData]);

    //关闭用户的弹窗(取消和确定事件)
    const handleCancel = () => {
      setSidecarVisible(false);
    };
    const handleConfirm = () => {
      setSidecarVisible(false);
      message.success("成功添加节点成功");
      onSuccess();
      setSidecarVisible(false);
    };

    //选择操作系统
    function handleChangeOperatingsystem(value: string) {
      console.log('选择的操作系统是', value)
    }

    function showConfigurationForm(type: string) {
      switch (type) {
        case "install":
          return (<Form layout="vertical" colon={false}>
            <Form.Item
              name="ipaddress"
              label={t("node-manager.cloudregion.node.Sidecar.ipaddress")}
            >
              <Input className="" />
            </Form.Item>
            <Form.Item

              name="operatingsystem"
              label={t("node-manager.cloudregion.node.Sidecar.system")}
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
            </Form.Item>
            <Form.Item
              name="installationguide"
              label={t("node-manager.cloudregion.node.Sidecar.guide")}
            >
              <div className="border-2 border-black-100 h-[121px]">我是一个展示的区域</div>
            </Form.Item>
          </Form>);
        case "uninstall":
          return (
            <div>
              <h1>1.Windows</h1>
              <div className="border border-black w-[466px] h-[120px] mt-2">我是展示的区域</div>
              <h1 className="mt-2">2.Linux</h1>
              <div className="border border-black w-[466px] h-[120px] mt-2">我是展示的区域</div>
            </div>
          );
      }
    }

    function getOperateModaltitle(type: string) {
      if (type === "install") {
        return t("node-manager.cloudregion.node.Sidecar.install");
      } else {
        return t("node-manager.cloudregion.node.Sidecar.uninstall");
      }
    }

    return (
      <OperateModal
        visible={SidecarVisible}
        onCancel={handleCancel}
        onOk={handleConfirm}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
        title={getOperateModaltitle(type)}
      >
        {showConfigurationForm(type)}
      </OperateModal>
    );
  }
);
SidecarModal.displayName = "RuleModal";
export default SidecarModal;
export type { ModalRef, ConfigurationForm };
