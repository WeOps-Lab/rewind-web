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
import useApiCloudRegion from "@/app/node-manager/api/cloudregion";
import type { OptionItem } from "@/app/node-manager/types/index";
import type { CollectorItem } from "@/app/node-manager/types/cloudregion";
import useCloudId from "@/app/node-manager/hooks/useCloudid";

const CollectorModal = forwardRef<ModalRef, ModalSuccess>(
  ({ onSuccess }, ref) => {
    const collectorformRef = useRef<FormInstance>(null);
    //创建一个路由对象
    const router = useRouter();
    //设置表当的数据
    const { t } = useTranslation();
    const cloudid = useCloudId();
    const { getnodelist, batchbindcollector, batchoperationcollector } = useApiCloudRegion();
    const [type, setType] = useState<string>("");
    const [nodeids, setNodeids] = useState<string[]>([""]);
    //设置弹窗状态
    const [collectorVisible, setCollectorVisible] =
      useState<boolean>(false);
    //用于控制配置文件的显示
    const configarr = ["bindconfig", "updataconfig"]
    //需要二次弹窗确定的类型
    const Popconfirmarr = ["restart", "stop"]
    //用于存储配置文件列表
    const [configlist, setConfiglist] = useState<OptionItem[]>([])
    //用于存储采集器的列表
    const [collectorlist, setCollectorlist] = useState<OptionItem[]>([])


    useImperativeHandle(ref, () => ({
      showModal: ({ type, ids }) => {
        // 开启弹窗的交互
        setCollectorVisible(true);
        setType(type);
        if (ids) {
          setNodeids(ids);
        }
      },
    }));

    //根据id获取配置，并设置表单数据
    useEffect(() => {
      if (!collectorVisible) {
        return;
      }
      if (nodeids) {
        //获取配置文件列表和采集器的列表
        const collectorPromises = nodeids.map((item) => getnodelist(Number(cloudid), item));
        Promise.all(collectorPromises)
          .then((results) => {
            const collectorlisttemp: OptionItem[] = [];
            const configlisttemp: OptionItem[] = [];
            results.forEach((res) => {
              res[0]?.status?.collectors?.forEach((elem: CollectorItem) => {
                collectorlisttemp.push({
                  value: String(elem.collector_id),
                  label: String(elem.collector_name)
                });
                configlisttemp.push({
                  value: String(elem.configuration_id),
                  label: String(elem.configuration_name)
                });
              });
            });
            collectorformRef.current?.resetFields();
            setConfiglist(configlisttemp);
            setCollectorlist(collectorlisttemp);
            collectorformRef.current?.setFieldsValue({
              Collector: collectorlisttemp[0]?.label,
              configration: configlisttemp[0]?.label
            });
          })
          .catch((error) => {
            console.error("Error fetching data: ", error);
          });
      }
    }, [collectorVisible, collectorformRef])

    //关闭用户的弹窗(取消和确定事件)
    const handleCancel = () => {
      setCollectorVisible(false);
    };

    //点击确定按钮的相关逻辑处理
    const handleConfirm = () => {
      if (Popconfirmarr.includes(type)) {
        return
      }

      //表单验证
      collectorformRef.current?.validateFields().then((values) => {
        //处理更新和绑定配置
        if (["bindconfig", "updataconfig"].includes(type)) {
          const collector_configuration_id = configlist?.find((item) => item.label === values?.configration)?.value;
          const node_ids = nodeids;
          if (typeof (collector_configuration_id) === "string") {
            batchbindcollector({ node_ids, collector_configuration_id })
          }
        }

        //处理启动
        if (type === "start") {
          const collector_id = collectorlist?.find((item) => item.value === values?.Collector)?.value;
          const node_ids = nodeids;
          if (typeof (collector_id) === "string") {
            batchoperationcollector({ node_ids, collector_id, operation: "start" })
          }
        }
        message.success("Successfully");
        onSuccess();
        setCollectorVisible(false);
      })
    };

    //选择操作系统
    const handleChangestartcollector = (value: string) => {
      console.log('选择的操作系统是', value)
    }

    //二次确认的弹窗
    const secondconfirm = () => {
      collectorformRef.current?.validateFields().then((values) => {
        const collector_id = collectorlist?.find((item) => item.value === values?.Collector)?.value;
        const node_ids = nodeids;
        if (typeof (collector_id) === "string") {
          batchoperationcollector({ node_ids, collector_id, operation: type })
        }
        message.success("Successfully");
        onSuccess();
        setCollectorVisible(false);
      })
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
            rules={[
              {
                required: true,
                message: t("common.selectMsg"),
              },
            ]}
          >
            <Select
              options={collectorlist}
              onChange={handleChangestartcollector}
            >
            </Select>
          </Form.Item>
          {configarr.includes(type) && <Form.Item
            name="configration"
            label={t("node-manager.cloudregion.node.config")}
            rules={[
              {
                required: true,
                message: t("common.selectMsg"),
              },
            ]}
          >
            <Select
              options={configlist}
              onChange={handleChangestartcollector}
            >
            </Select>
          </Form.Item>
          }
          <p>{t('node-manager.cloudregion.node.btntext1')}<Button className="p-0 mx-1" type="link" onClick={() => { router.push("/node-manager/cloudregion/configuration") }}>{t('node-manager.cloudregion.node.btntext2')}</Button>{t('node-manager.cloudregion.node.btntext3')}</p>
        </Form>
      </OperateModal>
    );
  }
);
CollectorModal.displayName = "CollectorModal";
export default CollectorModal;
