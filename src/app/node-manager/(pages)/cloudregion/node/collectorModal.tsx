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
import type { CollectorItem, IConfiglistprops } from "@/app/node-manager/types/cloudregion";
import useCloudId from "@/app/node-manager/hooks/useCloudid";

const CollectorModal = forwardRef<ModalRef, ModalSuccess>(
  ({ onSuccess }, ref) => {
    const collectorformRef = useRef<FormInstance>(null);
    //创建一个路由对象
    const router = useRouter();
    //设置表当的数据
    const { t } = useTranslation();
    const cloudid = useCloudId();
    const { getnodelist, batchbindcollector, batchoperationcollector, getconfiglist } = useApiCloudRegion();
    const [type, setType] = useState<string>("start");
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
    const [selectedsystem, setSelectedsystem] = useState<string>()


    useImperativeHandle(ref, () => ({
      showModal: ({ type, ids, selectedsystem }) => {
        // 开启弹窗的交互
        setCollectorVisible(true);
        setType(type);
        setSelectedsystem(selectedsystem);
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
            results.forEach((res) => {
              res[0]?.status?.collectors?.forEach((elem: CollectorItem) => {
                collectorlisttemp.push({
                  value: String(elem.collector_id),
                  label: String(elem.collector_name)
                });
              });
            });

            getconfiglist(Number(cloudid)).then((res) => {
              const filtersystem = res.filter((item: IConfiglistprops) => item.operating_system === selectedsystem?.toLowerCase())
              const filtercollector = filtersystem.filter((item: IConfiglistprops) => item.collector_name === collectorlisttemp[0].label)
              const tempdata = filtercollector.map((item: IConfiglistprops) => {
                return {
                  label: item.name,
                  value: item.id
                }
              })
              setConfiglist(tempdata);
            })
            collectorformRef.current?.resetFields();

            // 去除重复label后的处理逻辑
            const uniqueCollectorList = Array.from(
              collectorlisttemp
                .reduce((map, obj) => map.set(obj.label, obj), new Map())
                .values()
            );
            setCollectorlist(uniqueCollectorList);
          })
      }
    }, [collectorVisible, collectorformRef])

    useEffect(() => {
      if (collectorlist.length > 0 || configlist.length > 0) {
        // 数据加载完毕后手动设置表单的字段值
        collectorformRef.current?.setFieldsValue({
          Collector: collectorlist[0]?.value || undefined,
          configration: configlist[0]?.value || undefined,
        });
      }
    }, [collectorlist, configlist]);


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
            batchbindcollector({ node_ids, collector_configuration_id }).then(() => {
              message.success(t(type === "bindconfig" ? 'common.batchbindSuccess' : 'common.updateSuccess'))
            })
          }
        }

        //处理启动
        if (type === "start") {
          const collector_id = collectorlist?.find((item) => item.value === values?.Collector)?.value;
          const node_ids = nodeids;
          if (typeof (collector_id) === "string") {
            batchoperationcollector({ node_ids, collector_id, operation: "start" }).then(() => {
              onSuccess();
            })
          }
        }
        setCollectorVisible(false);
      })
    };

    //选择的采集器
    const handleChangestartcollector = (value: string) => {
      const tempcollector = collectorlist.find((item) => item.value === value)
      getconfiglist(Number(cloudid)).then((res) => {
        const filtersystem = res.filter((item: IConfiglistprops) => item.operating_system === selectedsystem?.toLowerCase())
        const filtercollector = filtersystem.filter((item: IConfiglistprops) => item.collector_name === tempcollector?.label)
        const tempdata = filtercollector.map((item: IConfiglistprops) => {
          return {
            label: item.name,
            value: item.id
          }
        })
        setConfiglist(tempdata);
      })
    }

    //二次确认的弹窗
    const secondconfirm = () => {
      collectorformRef.current?.validateFields().then((values) => {
        const collector_id = collectorlist?.find((item) => item.value === values?.Collector)?.value;
        const node_ids = nodeids;
        if (typeof (collector_id) === "string") {
          batchoperationcollector({ node_ids, collector_id, operation: type }).then(() => {
            message.success(t('node-manager.cloudregion.node.stopsuccess'))
            onSuccess();
          })
        }
        setCollectorVisible(false);
      })
    }


    const navigateToConfig = () => {

      const searchParams = new URLSearchParams(window.location.search);
      const name = searchParams.get('name')
      const cloud_region_id = searchParams.get('cloud_region_id')
      router.push(`/node-manager/cloudregion/configuration?could_region_id=${cloud_region_id}&name=${name}`);
    }
    return (
      <OperateModal
        title={t(`node-manager.cloudregion.node.${type}`)}
        open={collectorVisible}
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
        </Form>{configarr.includes(type) ?
          <><div className="text-xs h-5">
            <p>{t('node-manager.cloudregion.node.btntext1')}<Button className="p-0 mx-1 h-3" type="link" onClick={() => { navigateToConfig() }}>{t('node-manager.cloudregion.node.btntext2')}</Button>{t('node-manager.cloudregion.node.btntext3')}</p>
          </div>
          {
            type === "bindconfig" ? <div className="text-xs h-5">
              <p>{t('node-manager.cloudregion.node.bindaditinfo')}</p>
            </div> : ''
          }
          </> : ''
        }
      </OperateModal>
    );
  }
);
CollectorModal.displayName = "CollectorModal";
export default CollectorModal;
