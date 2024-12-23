"use client";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Input, Form } from "antd";
import OperateModal from "@/components/operate-modal";
import type { FormInstance } from "antd";
import { useTranslation } from "@/utils/i18n";
import { ModalSuccess, ModalRef } from "@/app/node-manager/types/index";
import type { TableDataItem } from "@/app/node-manager/types/index";
const VariableModal = forwardRef<ModalRef, ModalSuccess>(({ }, ref) => {
  const formRef = useRef<FormInstance>(null);
  //设置弹窗状态
  const [variableVisible, setVariableVisible] = useState<boolean>(false);
  const [variableFormData, setVariableFormData] = useState<TableDataItem>();
  const [type, setType] = useState<string>("");
  const { t } = useTranslation();
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
    formRef.current?.resetFields();
    formRef.current?.setFieldsValue(variableFormData);
  }, [variableVisible]);

  //关闭用户的弹窗(取消和确定事件)
  const handleCancel = () => {
    setVariableVisible(false);
  };
  const handleConfirm = () => {
    setVariableVisible(false);
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
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="value"
          label={t("node-manager.cloudregion.variable.value")}
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
