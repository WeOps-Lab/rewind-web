"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Input, message, Space, Typography } from "antd";
import { DownOutlined, ReloadOutlined } from "@ant-design/icons";
import Icon from "@/components/icon";
import type { MenuProps, TableProps } from "antd";
import nodeStyle from "./index.module.scss";
import { Dropdown } from "antd";
import SidecarModal from "./SidecarModal";
import CollectorModal from "./CollectorModal";
import { data, updateitems } from "@/app/node-manager/mockdata/cloudregion/node";
import { useRouter } from 'next/navigation';
import { useTranslation } from "@/utils/i18n";
import type { GetProps } from 'antd';
import { ModalRef, TableDataItem } from "@/app/node-manager/types/index";
import CustomTable from "@/components/custom-table/index"
import { useColumns } from "./useColumns"
import Mainlayout from '../mainlayout/layout'
type OperationKey = 'startcollector' | 'restartcollector' | 'stopcollector' | 'bindingconfig' | 'updateconfig';
type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];
type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

const Node = () => {
  // 选中的用户状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  //设置展开行的状态
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const sidecarRef = useRef<ModalRef>(null)
  const collectorRef = useRef<ModalRef>(null)
  //创建一个路由实例
  const router = useRouter();
  const { t } = useTranslation();
  // 展开行的触发的事件
  const toggleExpandRow = (key: React.Key) => {
    const newExpandedRowKeys = expandedRowKeys.includes(key)
      ? expandedRowKeys.filter((k) => k !== key)
      : [...expandedRowKeys, key];
    setExpandedRowKeys(newExpandedRowKeys);
  };
  const getMokData = (num: number) => {
    const data = [];
    for (let i = 0; i < num; i++) {
      data.push({
        key: i.toString(),
        name: `metricbeat${i}`,
        filename: `文件${i}`
      });
    }
    return data;
  }
  //模拟点击ip展开的数据
  const ipexpandedRowRenderdata = getMokData(4);
  const columns = useColumns({ toggleExpandRow })
  //保存要过滤字段的对应的值
  const [visibleRowKeys, setVisibleRowKeys] = useState<string>();
  const [colbtnshow, setColbtnshow] = useState<boolean>(true)
  //sidecaritems的下拉菜单的数据
  const sidecaritems: MenuProps["items"] = [
    {
      label: t("node-manager.cloudregion.node.install"),
      key: "installSidecar",
    },
    {
      label: t("node-manager.cloudregion.node.uninstall"),
      key: "uninstallSidecar",
    },
  ];
  //collector的下拉菜单的数据
  const collectoritems: MenuProps["items"] = [
    {
      label: t("node-manager.cloudregion.node.bindconfig"),
      key: "bindingconfig",
    },
    {
      label: t("node-manager.cloudregion.node.updataconfig"),
      key: "updateconfig",
    },
    {
      label: t("node-manager.cloudregion.node.start"),
      key: "startcollector",
    },
    {
      label: t("node-manager.cloudregion.node.restart"),
      key: "restartcollector",
    },
    {
      label: t("node-manager.cloudregion.node.stop"),
      key: "stopcollector",
    },
  ];


  useEffect(() => {
    if (selectedRowKeys.length === 0) {
      setColbtnshow(true);
      return
    }
    setColbtnshow(false)
  }, [selectedRowKeys.length])

  //点击下拉菜单触发的事件
  const handleSidecarMenuClick: MenuProps["onClick"] = (e) => {
    if (selectedRowKeys.length === 0 && e.key === "installCollector") {
      message.info("Please select a node first");
      return
    }
    const showModalType = e.key === "installSidecar" ? "install" : "uninstall";
    sidecarRef.current?.showModal({ type: showModalType });
  };
  //点击下拉菜单触发的事件
  const handleCollectorMenuClick: MenuProps["onClick"] = (e) => {
    const obj = {
      bindingconfig: "bindconfig",
      updateconfig: "updataconfig",
      startcollector: "start",
      restartcollector: "restart",
      stopcollector: "stop"
    }
    collectorRef.current?.showModal({ type: obj[e.key as OperationKey] })
  };

  const SidecarmenuProps = {
    items: sidecaritems,
    onClick: handleSidecarMenuClick,
  };
  const CollectormenuProps = {
    items: collectoritems,
    onClick: handleCollectorMenuClick,
  };


  // 改变的触发的事件
  const onChange: TableProps<TableDataItem>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  // 选中改变的触发的事件
  const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRowKeys: TableDataItem[]) => {
    if (newSelectedRowKeys.length === 1) {
      setVisibleRowKeys(selectedRowKeys[0].operatingsystem);
    } else if (newSelectedRowKeys.length === 0) {
      setVisibleRowKeys('');
    }
    setSelectedRowKeys(newSelectedRowKeys);
  }
  //是否禁用checkbox
  const getCheckboxProps = (record: TableDataItem) => {
    let showItem = false;
    if (visibleRowKeys) {
      showItem = record.operatingsystem === visibleRowKeys ? false : true;
    }
    return {
      disabled: showItem, // 是否禁用
    }
  }

  const rowSelection: TableRowSelection<TableDataItem> = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: getCheckboxProps
  };


  //一个根据id获取详细的展开的行的数据
  const getExpandedRowData = () => {
    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {ipexpandedRowRenderdata.map((item) => {
          const metricbeattype = "weiqiyong"
          return (
            <div key={item.key} className="flex h-[32px]">
              <p className="leading-[32px]">{item.name}</p>
              <div className="flex justify-center items-center ml-4 w-[30px] h-[30px">
                <Icon type={metricbeattype} style={{ height: '19px', width: '19px' }}></Icon>
              </div>
              <Button
                onClick={() => {
                  console.log("点击了", item.key);
                  console.log("routerbegin", process.env.NEXTAUTH_URL);
                  router.push(`/node-manager/cloudregion/configuration?id=${item.key}`);
                  console.log("routerend", router);
                }}
                color="primary"
                variant="link"
              >
                {item.filename}
              </Button>
              <Dropdown
                menu={{
                  items: updateitems,
                  selectable: true,
                  defaultSelectedKeys: ['3'],
                  onClick: (item) => {
                    console.log(item.key);
                  }
                }}
              >
                <Typography.Link>
                  <Space>
                    Updata
                    <DownOutlined />
                  </Space>
                </Typography.Link>
              </Dropdown>
            </div>
          )
        })}
      </div>
    );
  };
  const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);
  return (
    <Mainlayout>
      <div className={`${nodeStyle.node} w-full h-full`}>
        <div className="overflow-hidden">
          {/* 顶部的部分 */}
          <div className="flex justify-end w-full overflow-y-hidden mb-4">
            <Search className="w-64 mr-[8px]" placeholder="input search text" enterButton onSearch={onSearch} />
            <Dropdown className="mr-[8px]" menu={SidecarmenuProps}>
              <Button>
                <Space>
                  {t("node-manager.cloudregion.node.sidecar")}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Dropdown disabled={colbtnshow} className="mr-[8px]" menu={CollectormenuProps}>
              <Button>
                <Space>
                  {t("node-manager.cloudregion.node.collector")}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <ReloadOutlined />
          </div>
          <div className="tablewidth">{/* 表格的部分 */}
            <CustomTable
              columns={columns}
              dataSource={data}
              className="min-h-[274px]"
              scroll={{ y: "calc(100vh - 400px)", x: "max-content" }}
              expandable={{
                expandIconColumnIndex: -1,
                expandedRowKeys,
                expandedRowRender: () =>
                  getExpandedRowData() as React.ReactNode,
              }}
              onChange={onChange}
              rowSelection={rowSelection}
            /></div>
          <SidecarModal ref={sidecarRef} onSuccess={function (): void {
            throw new Error("Function not implemented.");
          }}></SidecarModal>
          <CollectorModal ref={collectorRef} onSuccess={function (): void {
            throw new Error("Function not implemented.");
          }}></CollectorModal>
        </div>
      </div>
    </Mainlayout>
  );
}
export default Node;
