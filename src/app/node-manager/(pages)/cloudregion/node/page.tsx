"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Input, message, Space, Typography } from "antd";
import { DownOutlined, ReloadOutlined } from "@ant-design/icons";
import Icon from "@/components/icon";
import type { MenuProps, TableProps } from "antd";
import nodeStyle from "./index.module.scss";
import { Dropdown } from "antd";
import SidecarModal from "./sidecarModal";
import CollectorModal from "./collectorModal";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/utils/i18n";
import type { GetProps } from "antd";
import { ModalRef, TableDataItem } from "@/app/node-manager/types/index";
import CustomTable from "@/components/custom-table/index";
import { useColumns } from "./useColumns";
import Mainlayout from "../mainlayout/layout";
import useApiClient from "@/utils/request";
import useApiCloudRegion from "@/app/node-manager/api/cloudregion";
import { data } from "@/app/node-manager/mockdata/cloudregion/node";
import type { CollectorItem, NodeExpanddata } from "@/app/node-manager/types/cloudregion";
import useCloudId from "@/app/node-manager/hooks/useCloudid";

type OperationKey = 'startcollector' | 'restartcollector' | 'stopcollector' | 'bindingconfig' | 'updateconfig';
type TableRowSelection<T extends object = object> = TableProps<T>["rowSelection"];
type SearchProps = GetProps<typeof Input.Search>;

const { Search } = Input;

const Node = () => {
  const sidecarRef = useRef<ModalRef>(null);
  const collectorRef = useRef<ModalRef>(null);
  const router = useRouter();
  const { t } = useTranslation();
  const cloudid = useCloudId();
  const { isLoading } = useApiClient();
  const { getnodelist, batchbindcollector } = useApiCloudRegion();
  const [nodelist, setNodelist] = useState<TableDataItem[]>(data);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [expandedDataMapping, setExpandedDataMapping] = useState<Record<string, NodeExpanddata[]>>({});
  const [updateDropdownMapping, setUpdateDropdownMapping] = useState<Record<string, { key: string, label: string }[]>>({});
  const [loading, setLoading] = useState<boolean>(true)

  const toggleExpandRow = (key: React.Key) => {
    //主要通过点击行的展开和收起，来发起请求
    const newExpandedRowKeys = expandedRowKeys.includes(key)
      ? expandedRowKeys.filter((k) => k !== key)
      : [...expandedRowKeys, key];

    if (!newExpandedRowKeys.includes(key)) {
      setExpandedRowKeys(newExpandedRowKeys);
      return;
    }

    getnodelist(Number(cloudid), key as string).then((res) => {
      const data = res[0].status.collectors.map((item: CollectorItem) => {
        return {
          nodeid: key,
          key: item.configuration_id,
          name: item.collector_name,
          filename: item.configuration_name,
          status: item.message,
        };
      });

      setExpandedDataMapping((prev) => ({
        ...prev,
        [String(key)]: data,
      }));

      const tempdata = data.map((elem: { key: string; filename: string; }) => {
        return {
          key: elem.key,
          label: elem.filename || '--',
        };
      });

      setUpdateDropdownMapping((prev) => ({
        ...prev,
        [String(key)]: tempdata,
      }));

      setExpandedRowKeys(newExpandedRowKeys);
    });
  };

  const columns = useColumns({ toggleExpandRow });
  const [visibleRowKeys, setVisibleRowKeys] = useState<string>();
  const [colbtnshow, setColbtnshow] = useState<boolean>(true);

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
    if (isLoading) {
      getNodelist();
    }
  }, [isLoading]);

  useEffect(() => {
    if (!selectedRowKeys.length) {
      setColbtnshow(true);
      return;
    }
    setColbtnshow(false);
  }, [selectedRowKeys.length]);

  const handleSidecarMenuClick: MenuProps["onClick"] = (e) => {
    if (!selectedRowKeys.length && e.key === "installCollector") {
      message.info("Please select a node first");
      return;
    }
    const showModalType = e.key === "installSidecar" ? "install" : "uninstall";
    sidecarRef.current?.showModal({ type: showModalType });
  };

  const handleCollectorMenuClick: MenuProps["onClick"] = (e) => {
    const obj = {
      bindingconfig: "bindconfig",
      updateconfig: "updataconfig",
      startcollector: "start",
      restartcollector: "restart",
      stopcollector: "stop",
    };
    collectorRef.current?.showModal({
      type: obj[e.key as OperationKey],
      ids: selectedRowKeys as string[],
    });
  };

  const SidecarmenuProps = {
    items: sidecaritems,
    onClick: handleSidecarMenuClick,
  };

  const CollectormenuProps = {
    items: collectoritems,
    onClick: handleCollectorMenuClick,
  };

  const onChange: TableProps<TableDataItem>["onChange"] = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRowKeys: TableDataItem[]) => {
    if (newSelectedRowKeys.length === 1) {
      setVisibleRowKeys(selectedRowKeys[0].operatingsystem);
    } else if (newSelectedRowKeys.length === 0) {
      setVisibleRowKeys("");
    }
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const getCheckboxProps = (record: TableDataItem) => {
    let showItem = false;
    if (visibleRowKeys) {
      showItem = record.operatingsystem === visibleRowKeys ? false : true;
    }
    return {
      disabled: showItem,
    };
  };

  const rowSelection: TableRowSelection<TableDataItem> = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: getCheckboxProps,
  };

  //单个配置文件的更新
  const updateConfig = (data: {
    node_ids: string[];
    collector_configuration_id: string
  }) => {
    batchbindcollector(data);
    getNodelist();
    message.success("success update");

  }

  //获取节点的展开的行
  const getExpandedRowData = (key: React.Key) => {
    let data: NodeExpanddata[] = [];
    let items: any[] = [];
    if (key) {
      data = expandedDataMapping[String(key)] || [];
      items = updateDropdownMapping[String(key)] || [];
    }
    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {data.map((item) => {
          const statusMapping: { [key: string]: string } = {
            Running: "yunhangzhongx",
            Stopped: "yichang-yichang",
            Default: "weiqiyong",
          };
          const metricbeattype = statusMapping[item.status] || statusMapping.Default;
          return (
            <div key={item.key} className="flex h-[32px]">
              <p className="leading-[32px] w-32 text-center">{item.name}</p>
              <div className="flex justify-center items-center ml-4 w-[30px] h-[30px">
                <Icon
                  type={metricbeattype}
                  style={{ height: "19px", width: "19px" }}
                ></Icon>
              </div>
              <Button
                className="w-32"
                color="primary"
                variant="link"
                onClick={() => {
                  router.push(`/node-manager/cloudregion/configuration?id=${item.key}`);
                }}
              >
                {item.filename || '--'}
              </Button>
              <Dropdown
                className="w-32"
                menu={{
                  items,
                  selectable: true,
                  defaultSelectedKeys: ['3'],
                  onClick: () => {
                    updateConfig({
                      node_ids: [item.nodeid],
                      collector_configuration_id: item.key
                    });
                  }
                }}
              >
                <Typography.Link>
                  <Space>
                    {t('common.update')}
                  </Space>
                </Typography.Link>
              </Dropdown>
            </div>
          );
        })}
      </div>
    );
  };

  const onSearch: SearchProps["onSearch"] = (value) => {
    getNodelist(value);
  };

  const updatenodelist = () => {
    getNodelist();
  };

  const getNodelist = (search?: string) => {
    getnodelist(Number(cloudid), search)
      .then((res) => {
        setLoading(true)
        const data = res.map((item: any) => {
          return {
            key: item.id,
            ip: item.ip,
            operatingsystem: item.operating_system.charAt(0).toUpperCase() + item.operating_system.slice(1),
            sidecar: item.status.status === "1" ? "Running" : "Error",
          };
        });
        setNodelist(data);
      })
      .finally(() => {
        setLoading(false)
      });
  };

  return (
    <Mainlayout>
      <div className={`${nodeStyle.node} w-full h-full`}>
        <div className="overflow-hidden">
          <div className="flex justify-end w-full overflow-y-hidden mb-4">
            <Search
              className="w-64 mr-[8px]"
              placeholder="input search text"
              enterButton
              onSearch={onSearch}
            />
            <Dropdown className="mr-[8px]" menu={SidecarmenuProps}>
              <Button>
                <Space>
                  {t("node-manager.cloudregion.node.sidecar")}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Dropdown className="mr-[8px]" menu={CollectormenuProps} disabled={colbtnshow}>
              <Button>
                <Space>
                  {t("node-manager.cloudregion.node.collector")}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <ReloadOutlined className="rotating" onClick={updatenodelist} />
          </div>
          <div className="tablewidth">
            <CustomTable
              columns={columns}
              loading={loading}
              dataSource={nodelist}
              className="min-h-[274px]"
              scroll={{ y: "calc(100vh - 400px)", x: "max-content" }}
              rowSelection={rowSelection}
              expandable={{
                expandIconColumnIndex: -1,
                expandedRowKeys,
                expandedRowRender: (record) => getExpandedRowData(record.key),
              }}
              onChange={onChange}
            />
          </div>
          <SidecarModal
            ref={sidecarRef}
            onSuccess={function (): void {
              throw new Error("Function not implemented.");
            }}
          ></SidecarModal>
          <CollectorModal
            ref={collectorRef}
            onSuccess={() => { getNodelist() }}
          ></CollectorModal>
        </div>
      </div>
    </Mainlayout>
  );
};

export default Node;
