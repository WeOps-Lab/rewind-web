"use client";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Form, Select, message, Button, Popconfirm } from "antd";
import OperateModal from "@/components/operate-modal";
import type { FormInstance } from "antd";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/utils/i18n";
import { ModalSuccess, ModalRef } from "@/app/node-manager/types/index"

const CollectorModal = forwardRef<ModalRef, ModalSuccess>(
  ({ onSuccess }, ref) => {
    const collectorformRef = useRef<FormInstance>(null);
    //创建一个路由对象
    const router = useRouter();
    //设置表当的数据
    const { t } = useTranslation();
    const [type, setType] = useState<string>("");
    //设置弹窗状态
    const [collectorVisible, setCollectorVisible] =
      useState<boolean>(false);
    const configarr = ["bindconfig", "updataconfig"]
    const Popconfirmarr = ["restart", "stop"]
    useImperativeHandle(ref, () => ({
      showModal: ({ type }) => {
        // 开启弹窗的交互
        setCollectorVisible(true);
        setType(type);
      },
    }));

    //初始化表单的数据
    useEffect(() => {
      collectorformRef.current?.resetFields();
    }, [collectorVisible]);


    //关闭用户的弹窗(取消和确定事件)
    const handleCancel = () => {
      setCollectorVisible(false);
    };
    //点击确定按钮的相关逻辑处理
    const handleConfirm = () => {
      if (Popconfirmarr.includes(type)) {
        return
      }
      //处理绑定配置，更新配置，启动探针
      if (type === "bindconfig") {
        message.success("Successfully");
      }
      setCollectorVisible(false);
      onSuccess();
      setCollectorVisible(false);
    };

    //选择操作系统
    const handleChangestartcollector = (value: string) => {
      console.log('选择的操作系统是', value)
    }
    //二次确认的弹窗
    const secondconfirm = () => {
      setCollectorVisible(false);
      message.success("Successfully");
    }
    return (
      <OperateModal
        title={t(`node-manager.cloudregion.node.${type}`)}
        visible={collectorVisible}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
        onCancel={handleCancel}
        footer={[
          <Button
            key="back"
            onClick={handleCancel}>{t('common.cancel')}</Button>,
          Popconfirmarr.includes(type) ?
            <Popconfirm
              title={t(`node-manager.cloudregion.node.${type}`)}
              description={t(`node-manager.cloudregion.node.${type}info`)}
              okText={t("common.confirm")}
              cancelText={t("common.cancel")}
              onConfirm={secondconfirm}
            >
              <Button
                type="primary"
              >
                {t("common.confirm")}
              </Button>
            </Popconfirm>
            : <Button type="primary" onClick={handleConfirm}>{t('common.confirm')}</Button>
        ]}
      >
        <Form ref={collectorformRef} layout="vertical" colon={false}>
          <Form.Item
            name="Collector"
            label={t("node-manager.cloudregion.node.collector")}
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
          {configarr.includes(type) && <Form.Item
            name="configration"
            label={t("node-manager.cloudregion.node.config")}
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
            <p>{t('node-manager.cloudregion.node.btntext1')}<Button className="p-0 mx-1" type="link" onClick={() => { router.push("/node-manager/cloudregion/configuration") }}>{t('node-manager.cloudregion.node.btntext2')}</Button>{t('node-manager.cloudregion.node.btntext3')}</p>
          </Form.Item>
          }
        </Form>
      </OperateModal>
    );
  }
);
CollectorModal.displayName = "RuleModal";
export default CollectorModal;
