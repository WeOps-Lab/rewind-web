"use client";
import React, { useRef } from "react";
import { Button, Input, message, Popconfirm } from "antd";
import { Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { useTranslation } from "@/utils/i18n";
import VariableModal, { ModalRef, VariableForm } from "./variableModal";
import { VariableDataType } from "@/app/node-manager/types/cloudregion"
import type { GetProps, PopconfirmProps } from 'antd';
type SearchProps = GetProps<typeof Input.Search>;

function Variable() {
  const variableRef = useRef<ModalRef>(null);
  const { t } = useTranslation();
  // 表格数据
  const columns: TableColumnsType<VariableDataType> = [
    {
      title: t("node-manager.cloudregion.variable.Name"),
      dataIndex: "name",
      width: 180,
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: t("node-manager.cloudregion.variable.Value"),
      dataIndex: "value",
      width: 150,
    },
    {
      title: t("node-manager.cloudregion.variable.Desc"),
      dataIndex: "description",
      width: 200,
    },
    {
      title: t("common.actions"),
      dataIndex: "key",
      width: 200,
      fixed: "right",
      render: (key: string) => (
        <div>
          <Button
            onClick={() => {
              openUerModal("edit", getFormDataById(key) as VariableForm);
            }}
            color="primary"
            variant="link"
          >
            {t("common.edit")}
          </Button>

          <Popconfirm
            title={t("node-manager.cloudregion.variable.deletevariable")}
            description={t("node-manager.cloudregion.variable.deleteinfo")}
            onConfirm={delconfirm}
            onCancel={delcancel}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
          >
            <Button
              color="primary"
              variant="link"
            >
              {t("common.delete")}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const data: VariableDataType[] = [
    {
      key: "1",
      name: "${sidecar.operatingSystem}",
      value: "55",
      description: "这是描述",
    },
    {
      key: "2",
      name: "${sidecar.operatingSystem}",
      value: "55",
      description: "这是描述",
    },
    {
      key: "3",
      name: "${sidecar.operatingSystem}",
      value: "55",
      description: "这是描述",
    },
    {
      key: "4",
      name: "${sidecar.operatingSystem}",
      value: "55",
      description: "这是描述",
    },
  ];

  //处理多选触发的事件逻辑
  const rowSelection: TableProps<VariableDataType>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: VariableDataType[]) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
  };
  //遍历数据，取出要回显的数据
  const getFormDataById = (key: string) => {
    const formData = data.find((item) => item.key === key);
    return formData;
  };

  //根据传入的值打开对应的用户弹窗（添加用户弹窗和编辑用户的弹窗）
  const openUerModal = (type: string, form: VariableForm) => {
    variableRef.current?.showModal({
      type,
      form,
    });
  };
  const onsuccessvariablemodal = () => {
    console.log("onsuccessvariablemodal,成功的回调函数");
  };
  const { Search } = Input;
  const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);
  //删除的确定的弹窗
  const delconfirm: PopconfirmProps['onConfirm'] = (e) => {
    console.log(e);
    message.success('Click on Yes');
  };

  const delcancel: PopconfirmProps['onCancel'] = (e) => {
    console.log(e);
    message.error('Click on No');
  };
  return (
    <div className="w-full h-full">
      <div className="flex justify-end mb-4">
        <Search className="w-64 mr-[8px]" placeholder="input search text" onSearch={onSearch} enterButton />
        <Button
          type="primary"
          onClick={() => {
            openUerModal("add", {
              name: "",
              key: "",
              value: "",
              description: "",
            });
          }}
        >
          +{t("common.add")}
        </Button>

      </div>
      <div className="overflow-x-auto">
        <Table<VariableDataType>
          scroll={{ y: "calc(100vh - 400px)", x: "max-content" }}
          columns={columns}
          dataSource={data}
          rowSelection={rowSelection}
        />
      </div>
      <VariableModal
        ref={variableRef}
        onSuccess={onsuccessvariablemodal}
      ></VariableModal>
    </div>
  );
}


export default Variable;
