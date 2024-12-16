"use client";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Form, Select, message, Button } from "antd";
import OperateModal from "@/components/operate-modal";
import type { FormInstance } from "antd";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/utils/i18n";

//传入modal的参数类型成功的回调
interface ModalProps {
  onSuccess: () => void;
}
//调用弹窗接口传入的类型
interface ModalConfig {
  type: string;
  form: ConfigurationForm;
}
//调用弹窗的类型
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

const ConfigurationModal = forwardRef<ModalRef, ModalProps>(
  ({ onSuccess }, ref) => {
    const configurationformRef = useRef<FormInstance>(null);
    //设置弹窗状态
    const [configurationVisible, setConfigurationVisible] =
      useState<boolean>(false);
    //创建一个路由对象
    const router = useRouter();
    //设置表当的数据
    const [type, setType] = useState<string>("");
    const { t } = useTranslation();
    useImperativeHandle(ref, () => ({
      showModal: ({ type }) => {
        // 开启弹窗的交互
        setConfigurationVisible(true);
        setType(type);
      },
    }));



    //初始化表单的数据
    useEffect(() => {
      configurationformRef.current?.resetFields();
    }, [configurationVisible]);

    //关闭用户的弹窗(取消和确定事件)
    const handleCancel = () => {
      setConfigurationVisible(false);
    };
    const handleConfirm = () => {
      if (type === 'stop') {
        message.success("Successfully");
        onSuccess();
        setConfigurationVisible(false);
        return;
      }
      setConfigurationVisible(false);
      message.success("Successfully");
      onSuccess();
      setConfigurationVisible(false);
    };

    //选择操作系统
    function handleChangestartcollector(value: string) {
      console.log('选择的操作系统是', value)
    }
    //选择采集器


    function showConfigurationForm(type: string) {
      switch (type) {
        case "start":
          return (<Form ref={configurationformRef} layout="vertical" colon={false}>
            <Form.Item
              name="Collector"
              label={t("node-manager.cloudregion.node.Collector.title")}
            >
              <Select
                defaultValue="采集器列表"
                options={[
                  { value: 'collector1', label: '采集器1' },
                  { value: 'collector2', label: '采集器2' }
                ]}
                onChange={handleChangestartcollector}
              >
              </Select>

            </Form.Item>
            <Form.Item
              name="configration"
              label={t("node-manager.cloudregion.node.Collector.config")}
            >
              <Select
                defaultValue="配置文件列表"
                options={[
                  { value: 'configration', label: '配置文件1' },
                  { value: 'configration1', label: '配置文件2' },
                  { value: 'configration2', label: '配置文件3' }
                ]}
                onChange={handleChangestartcollector}
              >
              </Select>
              <p>{t('collectorform.pinfo1')}<Button className="p-0" type="link" onClick={() => { router.push("/system-manager/managenode/cloudregion/configuration") }}>{t('collectorform.pinfo2')}</Button>{t('collectorform.pinfo3')}</p>
            </Form.Item>

          </Form>);
        case "updata":
          return (
            <Form ref={configurationformRef} layout="vertical" colon={false}>
              <Form.Item
                name="Collector"
                label={t("node-manager.cloudregion.node.Collector.title")}
              >
                <Select
                  defaultValue="采集器列表"
                  options={[

                    { value: 'collector1', label: '采集器1' },
                    { value: 'collector2', label: '采集器2' }
                  ]}
                  onChange={handleChangestartcollector}
                >
                </Select>
              </Form.Item>
              <Form.Item
                name="configration"
                label={t("node-manager.cloudregion.node.Collector.config")}
              >
                <Select
                  defaultValue="配置文件列表"
                  options={[
                    { value: 'configuration1', label: '配置文件1' },
                    { value: 'configuration2', label: '配置文件2' }
                  ]}
                  onChange={handleChangestartcollector}
                >
                </Select>
                <p>{t('collectorform.pinfo1')}<Button className="p-0 mx-1" type="link" onClick={() => { router.push("/system-manager/managenode/cloudregion/configuration") }}>{t('collectorform.pinfo2')}</Button>{t('collectorform.pinfo3')}</p>
              </Form.Item>

            </Form>
          );
        case "stop":
          return (
            <Form ref={configurationformRef} layout="vertical" colon={false}>
              <Form.Item
                name="Collector"
                label={t("node-manager.cloudregion.node.Collector.title")}
              >
                <Select
                  defaultValue="采集器列表"
                  options={[
                    { value: 'collector1', label: '采集器1' },
                    { value: 'collector2', label: '采集器2' }
                  ]}
                  onChange={handleChangestartcollector}
                >
                </Select>
              </Form.Item>
            </Form>
          );
      }
    }

    function getOperateModaltitle(type: string) {
      if (type === "start") {
        return t("node-manager.cloudregion.node.Collector.start");
      } else if (type === "updata") {
        return t("node-manager.cloudregion.node.Collector.updata");
      } else {
        return t("node-manager.cloudregion.node.Collector.stop");
      }
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
export type { ModalRef, ConfigurationForm };
