"use client";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Input, Form, message } from "antd";
import OperateModal from "@/components/operate-modal";
import type { FormInstance } from "antd";
import { useTranslation } from "@/utils/i18n";
import { ModalSuccess, ModalRef } from "@/app/node-manager/types/index";
import type { TableDataItem } from "@/app/node-manager/types/index";
import useApiCloudRegion from "@/app/node-manager/api/cloudregion";
const VariableModal = forwardRef<ModalRef, ModalSuccess>(({ onSuccess }, ref) => {
  const { createvariable, updatevariable } = useApiCloudRegion();
  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);
  //设置弹窗状态
  const [variableVisible, setVariableVisible] = useState<boolean>(false);
  const [variableFormData, setVariableFormData] = useState<TableDataItem>();
  const [type, setType] = useState<string>("");

  useImperativeHandle(ref, () => ({
    showModal: ({ type, form }) => {
      // 开启弹窗的交互
      setVariableVisible(true);
      setType(type);
      setVariableFormData(form);
    },
  }));

  //初始化表单的数据
  useEffect(() => {
    if (variableVisible) {
      formRef.current?.resetFields();
      formRef.current?.setFieldsValue(variableFormData);
    }
  }, [variableVisible, variableFormData]);

  //关闭用户的弹窗(取消和确定事件)
  const handleCancel = () => {
    setVariableVisible(false);
  };

  //添加变量
  const handleConfirm = async () => {
    const id = 1;
    try {
      const data = await formRef.current?.validateFields();
      const tempdata = {
        key: data.name,
        value: data.value,
        description: data.description,
        cloud_region_id: id
      }
      //发起请求的类型（添加和编辑）
      if (type === 'add') {
        createvariable(tempdata).then((res) => {
          message.success(res);
        })
      } else {
        updatevariable(id, tempdata);
      }
      setVariableVisible(false);
      onSuccess();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <OperateModal
      title={type === "add" ? t("common.add") : t("common.edit")}
      visible={variableVisible}
      okText={t("common.confirm")}
      cancelText={t("common.cancel")}
      onCancel={handleCancel}
      onOk={handleConfirm}
    >
      <Form ref={formRef} layout="vertical" colon={false}>
        <Form.Item
          name="name"
          label={t("node-manager.cloudregion.variable.name")}
          rules={[
            {
              pattern: /^[A-Za-z0-9_]+$/,
              message: "仅允许字符 A-Z, a-z, 0-9, 和 _",
            },
            {
              required: true,
              message: "please input variable name",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="value"
          label={t("node-manager.cloudregion.variable.value")}
          rules={[
            {
              required: true,
              message: "please input variable value",
            },]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label={t("node-manager.cloudregion.variable.desc")}
        >
          <Input.TextArea rows={5} />
        </Form.Item>
      </Form>
    </OperateModal>
  );
});
VariableModal.displayName = "RuleModal";
export default VariableModal;
