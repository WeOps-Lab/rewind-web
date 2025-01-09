"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Input, Popconfirm } from "antd";
import type { TableProps } from "antd";
import CustomTable from "@/components/custom-table"
import ConfigModal from "./configModal";
import { ModalRef } from "@/app/node-manager/types/index";
import type { IConfiglistprops } from '@/app/node-manager/types/cloudregion';
import type { CollectorItem, CollectorListResponse } from "@/app/node-manager/types/collector"
import { useTranslation } from "@/utils/i18n";
import type { GetProps } from 'antd';
import { useConfigColumns } from "./useConfigColumns"
import Mainlayout from '../mainlayout/layout';
import { PlusOutlined } from "@ant-design/icons";
import useApiClient from "@/utils/request";
import useApiCloudRegion from "@/app/node-manager/api/cloudregion";
import useApiCollector from "@/app/node-manager/api/collector/index"
import useCloudId from "@/app/node-manager/hooks/useCloudid";
import type { ConfigDate } from '@/app/node-manager/types/cloudregion';
import configstyle from './index.module.scss'
type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

const Configration = () => {

  const configurationRef = useRef<ModalRef>(null);
  const modifydeleteconfigurationref = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();
  const { isLoading } = useApiClient();
  const cloudid = useCloudId();
  const { getCollectorlist } = useApiCollector();
  const { getconfiglist, batchdeletecollector } = useApiCloudRegion();
  const [selectedconfigurationRowKeys, setSelectedconfigurationRowKeys] =
    useState<React.Key[]>([]);
  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<ConfigDate[]>([])
  const [addform, setAddform] = useState<CollectorListResponse[]>([])

  //点击编辑配置文件的触发事件
  const configurationClick = (key: string) => {
    const configurationformdata = data.find((item) => item.key === key);
    configurationRef.current?.showModal({
      type: "edit",
      form: configurationformdata,
    });
  }

  //点击应用的配置文件的触发事件
  const applyconfigurationClick = (key: string, selectedsystem: string) => {
    configurationRef.current?.showModal({
      type: "apply",
      key,
      selectedsystem
    });
  }

  //批量删除的确定的弹窗
  const modifydeleteconfirm = () => {
    batchdeletecollector({
      ids: selectedconfigurationRowKeys as string[]
    }).then(() => {
      getConfiglist();
    })
  }

  // 表格的列
  const { columns, deletestate, handleDeleteCollector } = useConfigColumns({
    configurationClick,
    applyconfigurationClick
  });

  const emptytabledata = {
    name: "",
    key: "",
    collector: addform[0]?.label,
    operatingsystem: 'linux',
    configinfo: addform[0]?.template
  };

  //组件初始化渲染
  useEffect(() => {
    if (!isLoading) {
      const searchParams = new URLSearchParams(window.location.search);
      const id = searchParams.get("id");
      if (!id) {
        getConfiglist();
      }
    }
  }, [isLoading]);

  //为了给添加时，初始化一个form数据
  useEffect(() => {
    getCollectorlist({ node_operating_system: 'linux' }).then((res: CollectorItem[]) => {
      const tempdate: CollectorListResponse[] = res.map((item: CollectorItem) => {
        return { value: item.name, label: item.name, template: item.default_template }
      })
      setAddform(tempdate)
    })
  }, [])

  //删除配置文件刷新页面
  useEffect(() => {
    if (!deletestate) {
      return
    }
    getConfiglist();
    handleDeleteCollector(false);
  }, [deletestate])

  //判断是否是点击配置文件来查询的
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("id");
    if (typeof id === 'string') {
      getConfiglist(id);
    }
  }, []);

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
    //禁止选中
    getCheckboxProps: (record: any) => {
      return {
        disabled: record.nodecount,
        name: record.name,
      };
    }
  };

  //获取配置文件列表
  const getConfiglist = (search?: string) => {
    getconfiglist(Number(cloudid), search).then((res) => {
      setLoading(true)
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
    }).finally(() => {
      setLoading(false)
    })
  }

  //点击添加的配置文件的触发事件
  const addconfigurationClick = () => {
    configurationRef.current?.showModal({
      type: "add",
      form: emptytabledata,
    });
  }

  //搜索框的触发事件
  const onSearch: SearchProps['onSearch'] = (value) => {
    getConfiglist(value);
  };

  const delcancel = (e: any) => {
    console.log(e);
  }
  return (
    <Mainlayout>
      <div className={`${configstyle.config} w-full h-full`}>
        <div className="flex justify-end mb-4">
          <Search className="w-64 mr-[8px]" placeholder="input search text" enterButton onSearch={onSearch} />
          <Button
            className="mr-[8px]"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              addconfigurationClick();
            }}
          >
            {t("common.add")}
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
        <div className="tablewidth">
          <CustomTable<any>
            loading={loading}
            className="h-3/4"
            scroll={{ y: "calc(100vh - 400px)", x: "calc(100vw - 288px)" }}
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
          }}
        ></ConfigModal>
      </div>
    </Mainlayout>
  );
}

export default Configration;
