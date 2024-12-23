"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Input, message, Popconfirm } from "antd";
import type { TableProps } from "antd";
import CustomTable from "@/components/custom-table"
import ConfigModal from "./ConfigModal";
import { ModalRef } from "@/app/node-manager/types/index";
import { useTranslation } from "@/utils/i18n";
import type { GetProps } from 'antd';
import { data } from "@/app/node-manager/mockdata/cloudregion/config";
import { useConfigColumns } from "./useConfigColumns"
import Mainlayout from '../mainlayout/layout';
import { PlusOutlined } from "@ant-design/icons";
type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;
const Configration = () => {
  const [selectedconfigurationRowKeys, setSelectedconfigurationRowKeys] =
    useState<React.Key[]>([]);
  const configurationRef = useRef<ModalRef>(null);
  const modifydeleteconfigurationref = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();
  //点击编辑配置文件的触发事件
  const configurationClick = (key: string) => {
    const configurationformdata = data.filter((item) => item.key === key);
    const configurationform = configurationformdata[0];
    configurationRef.current?.showModal({
      type: "edit",
      form: configurationform,
    });
  }
  //点击应用的配置文件的触发事件
  const applyconfigurationClick = (key: string) => {
    configurationRef.current?.showModal({
      type: "apply",
      form: emptytabledata,
      key: key,
    });
  }
  //删除的确定的弹窗
  const deleteconfirm = (e: any) => {
    console.log(e);
    message.success('Click on Yes');
  }

  const delcancel = (e: any) => {
    console.log(e);
    message.error('Click on No');
  }
  // 表格的列
  const columns = useConfigColumns({
    configurationClick,
    applyconfigurationClick,
    deleteconfirm,
    delcancel
  });

  const emptytabledata = {
    name: "",
    key: "",
    collector: "",
    operatingsystem: "",
    nodecount: "",
  };

  //组价初始渲染
  useEffect(() => {
    //图标进行禁用
    const isDisabled = selectedconfigurationRowKeys?.length === 0;
    if (isDisabled) {
      modifydeleteconfigurationref.current?.setAttribute("disabled", isDisabled.toString());
      return;
    }
    modifydeleteconfigurationref.current?.removeAttribute("disabled");
  }, [selectedconfigurationRowKeys]);

  //处理多选触发的事件逻辑
  const rowSelection: TableProps<TableProps>["rowSelection"] = {
    onChange: (
      selectedRowKeys: React.Key[],
      selectedRows: TableProps[]
    ) => {
      setSelectedconfigurationRowKeys(selectedRowKeys);
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
  };


  //点击添加的配置文件的触发事件
  const addconfigurationClick = () => {
    configurationRef.current?.showModal({
      type: "add",
      form: {
        name: "fddf",
        operatingsystem: "linux",
        collector: 'mericbeat',
        configinfo: '我是一个需要展示内容的区域'

      },
    });
  }

  const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);

  return (
    <Mainlayout>
      <div className="w-full h-full">
        <div className="flex justify-end mb-4">
          <Search className="w-64 mr-[8px]" placeholder="input search text" enterButton onSearch={onSearch} />
          <Button
            className="mr-[8px]"
            type="primary"
            onClick={() => {
              addconfigurationClick();
            }}
          >
            <PlusOutlined />{t("common.add")}
          </Button>
          <Popconfirm
            title={t("node-manager.cloudregion.Configuration.modifydeltitle")}
            description={t("node-manager.cloudregion.Configuration.modifydelinfo")}
            okText={t("common.confirm")}
            cancelText={t("common.cancel")}
            onConfirm={deleteconfirm}
            onCancel={delcancel}
          >
            <Button
              className="mr-[8px]"
              ref={modifydeleteconfigurationref}
            >
              {t("common.modifydelete")}
            </Button>
          </Popconfirm>
        </div>
        <div>
          <CustomTable
            scroll={{ x: "calc(100vw - 300px)", y: "calc(100vh - 440px)" }}
            columns={columns}
            dataSource={data}
            rowSelection={rowSelection}
          />
        </div>
        {/* 弹窗组件（添加，编辑，应用） */}
        <ConfigModal
          ref={configurationRef}
          onSuccess={() => {
            console.log("我是一个配置成功的回调");
          }}
        ></ConfigModal>
      </div>
    </Mainlayout>
  );
}

export default Configration;
