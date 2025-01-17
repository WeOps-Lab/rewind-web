"use client";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Input, Form, Select, message, Button } from "antd";
import OperateModal from "@/components/operate-modal";
import { useTranslation } from "@/utils/i18n";
import type { FormInstance } from "antd";
import type { TableDataItem, OptionItem, ModalSuccess, ModalRef } from "@/app/node-manager/types/index";
import useApiCloudRegion from "@/app/node-manager/api/cloudregion";
import { useUserInfoContext } from '@/context/userInfo';
import { Typography } from 'antd';
const { Text } = Typography;

const SidecarModal = forwardRef<ModalRef, ModalSuccess>(
  ({ }, ref) => {
    const sidecarformRef = useRef<FormInstance>(null);
    const { t } = useTranslation();
    const { getsidecarstep } = useApiCloudRegion();
    const commonContext = useUserInfoContext();
    //设置弹窗状态
    const [SidecarVisible, setSidecarVisible] =
      useState<boolean>(false);
    //设置表当的数据
    const [sidecarFormData, setSidecarFormData] =
      useState<TableDataItem>();
    const [type, setType] = useState<string>("");
    const [selectgroup, setSelectgroup] = useState<OptionItem[]>()

    useImperativeHandle(ref, () => ({
      showModal: ({ type }) => {
        // 开启弹窗的交互
        setSidecarVisible(true);
        setType(type);
        //设置组织列表
        const grouptemp: OptionItem[] = []
        commonContext?.groups.forEach((item) => {
          grouptemp.push({
            label: item.name,
            value: item.id
          })
        })
        setSelectgroup(grouptemp)
        setSidecarFormData({
          ipaddress: '',
          operatingsystem: 'linux',
          group: commonContext?.groups[0].id,
          installationguide: ''
        });
      },
    }));

    //初始化表单的数据
    useEffect(() => {
      sidecarformRef.current?.resetFields();
      if (sidecarFormData) {
        sidecarformRef.current?.setFieldsValue(sidecarFormData);
      }
    }, [SidecarVisible, sidecarFormData]);

    //关闭用户的弹窗(取消和确定事件)
    const handleCancel = () => {
      setSidecarVisible(false);
    };

    const handleConfirm = () => {
      sidecarformRef.current?.validateFields().then((values) => {
        const { ipaddress, operatingsystem, group } = values;
        getsidecarstep(ipaddress, operatingsystem, group).then((res) => {
          sidecarformRef.current?.setFieldsValue({
            installationguide: res
          })
          message.success(t("common.quesuccess"));
        })
      });
    };

    const showSidecarForm = (type: string) => {
      const CustomText = ({ value }: { value: string }) => {
        return (
          <Text
            type='secondary'
            copyable={{ tooltips: ['点击复制', '复制成功！'] }}>
            {value}
          </Text>
        )
      }

      if (type === 'uninstall') {
        return (
          <div>
            <h1>1.Windows</h1>
            <Text
              className="h-36 w-full bg-gray-100 inline-block p-4 rounded border-gray-300"
              type='secondary'
              copyable={{ tooltips: ['点击复制', '复制成功！'] }}>
            </Text>
            <h1 className="mt-2">2.Linux</h1>
            <Text
              className="h-36 w-full bg-gray-100 inline-block p-4 rounded border-gray-300"
              type='secondary'
              copyable={{ tooltips: ['点击复制', '复制成功！'] }}>
            </Text>
          </div>
        );
      }
      return (<Form ref={sidecarformRef} layout="vertical" colon={false}>
        <Form.Item
          name="ipaddress"
          label={t("node-manager.cloudregion.node.ipaddress")}
          rules={[
            {
              required: true,
              message: t("common.inputRequired"),
            },
          ]}
        >
          <Input className="" />
        </Form.Item>
        <Form.Item
          name="operatingsystem"
          label={t("node-manager.cloudregion.node.system")}
          rules={[
            {
              required: true,
              message: t("common.selectMsg"),
            },
          ]}
        >
          <Select
            options={[
              { value: 'linux', label: 'Linux' },
              { value: 'windows', label: 'Windows' }
            ]}
          >
          </Select>
        </Form.Item>
        <Form.Item
          name="group"
          label={t("node-manager.cloudregion.node.group")}
          rules={[
            {
              required: true,
              message: t("common.selectMsg"),
            },
          ]}
        >
          <Select
            options={selectgroup}
          >
          </Select>
        </Form.Item>
        <Form.Item
          name="installationguide"
          label={t("node-manager.cloudregion.node.guide")}
        >
          <CustomText value={""}></CustomText>
        </Form.Item>
      </Form>);
    }

    return (
      <OperateModal
        title={t(`node-manager.cloudregion.node.${type}`)}
        visible={SidecarVisible}
        okText={t("common.confirm")}
        cancelText={t("common.cancel")}
        onCancel={handleCancel}
        footer={
          <>
            <Button onClick={handleCancel}>{t(`common.${type === 'install' ? 'cancel' : 'close'}`)}</Button>
            {type === 'install' && <Button type="primary" onClick={handleConfirm}>{t('common.confirm')}</Button>}
          </>
        }
      >
        {showSidecarForm(type)}
      </OperateModal>
    );
  }
);
SidecarModal.displayName = "RuleModal";
export default SidecarModal;
