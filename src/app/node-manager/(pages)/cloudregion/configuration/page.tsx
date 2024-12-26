"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Input, message, Popconfirm } from "antd";
import type { TableProps } from "antd";
import CustomTable from "@/components/custom-table"
import ConfigModal from "./ConfigModal";
import { ModalRef } from "@/app/node-manager/types/index";
import { IConfiglistprops } from '@/app/node-manager/types/cloudregion'
import { useTranslation } from "@/utils/i18n";
import type { GetProps } from 'antd';
import { useConfigColumns } from "./useConfigColumns"
import Mainlayout from '../mainlayout/layout';
import { PlusOutlined } from "@ant-design/icons";
import useApiClient from "@/utils/request";
import useApiCloudRegion from "@/app/node-manager/api/cloudregion";
type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

const Configration = () => {
  const configurationRef = useRef<ModalRef>(null);
  const modifydeleteconfigurationref = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();
  const { isLoading } = useApiClient();
  const { getconfiglist, batchdeletecollector } = useApiCloudRegion();
  const [selectedconfigurationRowKeys, setSelectedconfigurationRowKeys] =
    useState<React.Key[]>([]);
  const [data, setData] = useState([{
    key: '1',
    name: '文件1',
    collector: 'Metricbeat1',
    operatingsystem: 'Windows',
    nodecount: 3,
    configinfo: '文件1的配置信息',
  }])
  const [configfrom] = useState({
    name: "",
    key: data[0].key,
    collector: data[0].collector,
    operatingsystem: data[0].operatingsystem,
    configinfo: data[0].configinfo,
  });
  //云区域的默认的id
  const cloud_region_id = 1;
  //点击编辑配置文件的触发事件
  const configurationClick = (key: string) => {
    debugger
    const configurationformdata = data.find((item) => item.key === key);
    configurationRef.current?.showModal({
      type: "edit",
      form: configurationformdata,
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

  //批量删除的确定的弹窗
  const modifydeleteconfirm = () => {
    batchdeletecollector({
      ids: selectedconfigurationRowKeys as string[]
    })
    getConfiglist();
  }

  // 表格的列
  const { columns, deletestate, handleDeleteCollector } = useConfigColumns({
    configurationClick,
    applyconfigurationClick
  });

  const emptytabledata = {
    name: "",
    key: "",
    collector: "",
    operatingsystem: "",
    nodecount: "",
  };

  //组件初始化渲染
  useEffect(() => {
    if (!isLoading) {
      return
    }
    getConfiglist();
  }, []);

  //删除配置文件刷新页面
  useEffect(() => {
    if (!deletestate) {
      return
    }
    getConfiglist();
    handleDeleteCollector(false);
  }, [deletestate])

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

  //获取配置文件列表
  const getConfiglist = () => {
    getconfiglist(Number(cloud_region_id)).then((res) => {
      const data = res.map((item: IConfiglistprops) => {
        return {
          key: item.id,
          name: item.name,
          collector: item.collector,
          operatingsystem: item.operating_system,
          nodecount: item.node_count,
          configinfo: item.config_template
        }
      })
      setData(data)
    })
  }

  //点击添加的配置文件的触发事件
  const addconfigurationClick = () => {
    configurationRef.current?.showModal({
      type: "add",
      form: configfrom,
    });
  }

  const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);

  const delcancel = (e: any) => {
    console.log(e);
    message.error('Click on No');
  }
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
            onConfirm={modifydeleteconfirm}
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
          <CustomTable<any>
            scroll={{ x: "calc(100vw - 300px)", y: "calc(100vh - 440px)" }}
            columns={columns}
            dataSource={data}
            rowSelection={rowSelection}
          />
        </div>
        {/* 弹窗组件（添加，编辑，应用）用于刷新页面 */}
        <ConfigModal
          ref={configurationRef}
          onSuccess={() => {
            getConfiglist();
            debugger
            console.log(data)
          }}
        ></ConfigModal>
      </div>
    </Mainlayout>
  );
}

export default Configration;
