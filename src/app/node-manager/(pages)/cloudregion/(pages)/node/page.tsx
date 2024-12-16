"use client";
import React, { useRef, useState } from "react";
import { Button, Input, message, Space, Table, Tag } from "antd";
import { DownOutlined, ReloadOutlined } from "@ant-design/icons";
import Icon from "@/components/icon";
import type { MenuProps, TableColumnsType, TableProps } from "antd";
import nodeStyle from "./index.module.scss";
import { Dropdown } from "antd";
import SidecarModal, { ModalRef } from "./SidecarModal";
import CollectorModal from "./CollectorModal";
import data from "../../mokdata/cloudregion";
import { useRouter } from 'next/navigation';
import { useTranslation } from "@/utils/i18n";
import type { GetProps } from 'antd';
type TableRowSelection<T extends object = object> =
  TableProps<T>["rowSelection"];
type SearchProps = GetProps<typeof Input.Search>;

interface nodeDataType {
  key: React.Key;
  ip: string;
  operatingsystem: string;
  sidecar: string;
}

function Collectordetail() {
  //hook函数的使用
  // 选中的用户状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  //设置展开行的状态
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const sidecarRef = useRef<ModalRef>(null)
  const collectorRef = useRef<ModalRef>(null)
  //创建一个路由实例
  const router = useRouter();
  const { t } = useTranslation();
  //模拟点击ip展开的数据
  const ipexpandedRowRenderdata = getMokData(4);
  function getMokData(num: number) {
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

  // 用户表格数据
  const columns: TableColumnsType<nodeDataType> = [
    {
      title: t("node-manager.cloudregion.node.ip"),
      dataIndex: "ip",
      render: (text, record) => (
        <a onClick={() => toggleExpandRow(record.key)}>{text}</a>
      ),
    },
    {
      title: t("node-manager.cloudregion.node.system"),
      dataIndex: "operatingsystem",
      filters: [
        {
          text: "Windows",
          value: "Windows",
        },
        {
          text: "Linux",
          value: "Linux",
        },
      ],
      onFilter: (value, record) =>
        record.operatingsystem.indexOf(value as string) === 0,
    },
    {
      title: t("node-manager.cloudregion.node.sidecar"),
      dataIndex: "sidecar",
      filters: [
        {
          text: "Running",
          value: "Running",
        },
        {
          text: "Error",
          value: "Error",
        },
      ],
      onFilter: (value, record) =>
        record.sidecar.indexOf(value as string) === 0,
      render: (key: string) => {
        if (key === "Running") {
          return (
            <Tag bordered={false} color="success">
              {key}
            </Tag>
          );
        }
        return (
          <Tag bordered={false} color="error">
            {key}
          </Tag>
        );
      },
    },
  ];

  //sidecaritems的下拉菜单的数据
  const sidecaritems: MenuProps["items"] = [
    {
      label: t("node-manager.cloudregion.node.Sidecar.install"),
      key: "installSidecar",
    },
    {
      label: t("node-manager.cloudregion.node.Sidecar.uninstall"),
      key: "uninstallSidecar",
    },
  ];
  //sidecaritems的下拉菜单的数据
  const collectoritems: MenuProps["items"] = [
    {
      label: t("node-manager.cloudregion.node.Collector.start"),
      key: "startcollector",
    },
    {
      label: t("node-manager.cloudregion.node.Collector.updata"),
      key: "updateconfiguration",
    },
    {
      label: t("node-manager.cloudregion.node.Collector.stop"),
      key: "stopcollector",
    },
  ];


  //点击下拉菜单触发的事件
  const handleSidecarMenuClick: MenuProps["onClick"] = (e) => {
    if (selectedRowKeys.length === 0 && e.key === "installCollector") {
      message.info("Please select a node first");
      return
    }

    if (e.key === "installSidecar") {
      sidecarRef.current?.showModal({ type: "install" })
    } else {
      sidecarRef.current?.showModal({ type: "uninstall" })
    }
  };
  //点击下拉菜单触发的事件
  const handleCollectorMenuClick: MenuProps["onClick"] = (e) => {
    if (selectedRowKeys.length === 0) {
      message.info("Please select a node first");
      return
    }
    if (e.key === "startcollector") {
      collectorRef.current?.showModal({ type: "start" })
    } else if (e.key === "updateconfiguration") {
      collectorRef.current?.showModal({ type: "updata" })
    } else {
      collectorRef.current?.showModal({ type: "stop" })
    }
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
  const onChange: TableProps<nodeDataType>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  // 选中改变的触发的事件
  function onSelectChange(newSelectedRowKeys: React.Key[]) {
    console.log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys); // 更新状态
  }

  const rowSelection: TableRowSelection<nodeDataType> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // 展开行的触发的事件
  const toggleExpandRow = (key: React.Key) => {
    const newExpandedRowKeys = expandedRowKeys.includes(key)
      ? expandedRowKeys.filter((k) => k !== key)
      : [...expandedRowKeys, key];
    setExpandedRowKeys(newExpandedRowKeys);
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
            </div>
          )
        })}
      </div>
    );
  };
  const { Search } = Input;

  const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);
  return (
    <div className={`${nodeStyle.node} w-full h-full`}>
      <div className="overflow-hidden">
        {/* 顶部的部分 */}
        <div className="flex justify-end w-full overflow-y-hidden">
          <Search className="mb-4 w-64 mr-[8px]" placeholder="input search text" onSearch={onSearch} enterButton />
          <Dropdown className="mb-4 mr-[8px]" menu={SidecarmenuProps}>
            <Button>
              <Space>
                {t("node-manager.cloudregion.node.Sidecar.title")}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
          <Dropdown className="mb-4 mr-[8px]" menu={CollectormenuProps}>
            <Button>
              <Space>
                {t("node-manager.cloudregion.node.Collector.title")}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
          <ReloadOutlined className="mb-4" />
        </div>
        <div className="tablewidth">{/* 表格的部分 */}
          <Table<nodeDataType>
            columns={columns}
            dataSource={data}
            className="min-h-[274px]"
            scroll={{ y: "calc(100vh - 400px)", x: "calc(100% - 400px)" }}
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
  );
}
export default Collectordetail;
