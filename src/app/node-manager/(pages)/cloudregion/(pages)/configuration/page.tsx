"use client";
import React, { useEffect, useRef, useState } from "react";
import type { PopconfirmProps } from 'antd';
import { Button, Input, message, Popconfirm } from "antd";
import { Table } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import ConfigurationModal, {
  ModalRef
} from "./ConfigurationModal";
import { ConfigurationDataType } from "@/app/node-manager/types/cloudregion";
import { useTranslation } from "@/utils/i18n";
import type { GetProps } from 'antd';
type SearchProps = GetProps<typeof Input.Search>;

function Configration() {
  const [selectedconfigurationRowKeys, setSelectedconfigurationRowKeys] =
    useState<React.Key[]>([]);
  const configurationRef = useRef<ModalRef>(null);
  const modifydeleteconfigurationref = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();
  const { Search } = Input;
  const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);
  // 表格数据
  const columns: TableColumnsType<ConfigurationDataType> = [
    {
      title: t("node-manager.cloudregion.Configuration.name"),
      dataIndex: "name",
      fixed: "left",
      width: 180,
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: t("node-manager.cloudregion.Configuration.Collector"),
      dataIndex: "collector",
      width: 300,
    },
    {
      title: t("node-manager.cloudregion.Configuration.System"),
      dataIndex: "operatingsystem",
      width: 200,
    },
    {
      title: t("node-manager.cloudregion.Configuration.count"),
      dataIndex: "nodecount",
      width: 200,
    },
    {
      title: t("common.Actions"),
      dataIndex: "key",
      fixed: "right",
      width: 180,
      render: (key) => (
        <div className="flex">
          <Button
            onClick={() => {
              applyconfigurationClick(key);
            }}
            color="primary"
            variant="link"
          >
            {t("common.apply")}
          </Button>
          <Button
            onClick={() => {
              configurationClick(key);
            }}
            color="primary"
            variant="link"
          >
            {t("common.edit")}
          </Button>
          <Popconfirm
            title={t("node-manager.cloudregion.Configuration.deltitle")}
            description={t("node-manager.cloudregion.Configuration.deleteinfo")}
            onConfirm={deleteconfirm}
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

  const data: ConfigurationDataType[] = [
    {
      key: "1",
      name: "文件1",
      collector: "Metricbeat1",
      operatingsystem: "Windows",
      nodecount: 3,
    },
    {
      key: "2",
      name: "文件2",
      collector: "Metricbeat2",
      operatingsystem: "Linux",
      nodecount: 6,
    },
    {
      key: "3",
      name: "文件3",
      collector: "Metricbeat3",
      operatingsystem: "Linux",
      nodecount: 2,
    },
    {
      key: "4",
      name: "文件4",
      collector: "Metricbeat4",
      operatingsystem: "Windows",
      nodecount: 3,
    },
    {
      key: "5",
      name: "文件5",
      collector: "Metricbeat",
      operatingsystem: "Windows",
      nodecount: 5,
    },
    {
      key: "6",
      name: "文件6",
      collector: "Metricbeat6",
      operatingsystem: "Windows",
      nodecount: 1,
    },
    {
      key: "7",
      name: "文件7",
      collector: "Metricbeat7",
      operatingsystem: "Windows",
      nodecount: 3,
    },
  ];

  const emptytabledata = {
    name: "",
    key: "",
    collector: "",
    operatingsystem: "",
    nodecount: "",
  };

  //组价初始渲染
  useEffect(() => {
    const disableButton = (
      ref: React.RefObject<HTMLButtonElement>,
      condition: boolean
    ) => {
      if (condition) {
        ref.current?.setAttribute("disabled", "true");
      } else {
        ref.current?.removeAttribute("disabled");
      }
    };
    const isDisabled = selectedconfigurationRowKeys?.length === 0;
    disableButton(modifydeleteconfigurationref, isDisabled);
    console.log("fhdhfhd", selectedconfigurationRowKeys);
  }, [selectedconfigurationRowKeys]);

  //处理多选触发的事件逻辑
  const rowSelection: TableProps<ConfigurationDataType>["rowSelection"] = {
    onChange: (
      selectedRowKeys: React.Key[],
      selectedRows: ConfigurationDataType[]
    ) => {
      setSelectedconfigurationRowKeys(selectedRowKeys);
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
  };

  //点击编辑配置文件的触发事件
  function configurationClick(key: string) {
    const configurationformdata = data.filter((item) => {
      if (item.key === key) {
        return item;
      }
    });
    const configurationform = configurationformdata[0];
    configurationRef.current?.showModal({
      type: "edit",
      form: configurationform,
    });
  }
  //点击添加的配置文件的触发事件
  function addconfigurationClick() {
    configurationRef.current?.showModal({
      type: "add"
    });
  }

  //点击应用的配置文件的触发事件
  function applyconfigurationClick(key: string) {
    configurationRef.current?.showModal({
      type: "apply",
      form: emptytabledata,
      key: key,
    });
  }
  //删除的确定的弹窗
  const deleteconfirm: PopconfirmProps['onConfirm'] = (e) => {
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
          className="mr-[8px]"
          type="primary"
          onClick={() => {
            addconfigurationClick();
          }}
        >
          +{t("common.add")}
        </Button>
        <Popconfirm
          title={t("node-manager.cloudregion.Configuration.modifydeltitle")}
          description={t("node-manager.cloudregion.Configuration.modifydelinfo")}
          onConfirm={deleteconfirm}
          onCancel={delcancel}
          okText={t("common.confirm")}
          cancelText={t("common.cancel")}
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
        <Table<ConfigurationDataType>
          scroll={{ x: "calc(100vw - 600px)", y: "calc(100vh - 440px)" }}
          columns={columns}
          dataSource={data}
          rowSelection={rowSelection}
        />
      </div>
      {/* 弹窗组件（添加，编辑，应用） */}
      <ConfigurationModal
        ref={configurationRef}
        onSuccess={() => {
          console.log("我是一个配置成功的回调");
        }}
      ></ConfigurationModal>
    </div>
  );
}


export default Configration;
