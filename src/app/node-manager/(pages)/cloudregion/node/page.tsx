"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Input, message, Space } from "antd";
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
  const { getnodelist } = useApiCloudRegion();
  const [nodelist, setNodelist] = useState<TableDataItem[]>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [expandedDataMapping, setExpandedDataMapping] = useState<Record<string, NodeExpanddata[]>>({});
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

    //获取展开行的数据
    const nodelistpromise = getnodelist(Number(cloudid), key as string);
    Promise.all([nodelistpromise]).then(([noderes]) => {
      const data = noderes[0].status.collectors.map((item: CollectorItem) => {
        return {
          nodeid: key,
          key: item.configuration_id,
          name: item.collector_name,
          filename: item.configuration_name,
          status: item.status,
        };
      });

      setExpandedDataMapping((prev) => ({
        ...prev,
        [String(key)]: data,
      }));

      setExpandedRowKeys(newExpandedRowKeys);
    })
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

  })
  useEffect(() => {
    if (!isLoading) {
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
      selectedsystem: visibleRowKeys
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

  //选择相同的系统节点，判断是否禁用按钮
  const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows: TableDataItem[]) => {
    const length = newSelectedRowKeys.length;
    if (length === 0) {
      // 没有选中的行
      setVisibleRowKeys('');
      setSelectedRowKeys([]);
      return;
    }
    if (length === 1) {
      // 只选中了一行
      setVisibleRowKeys(selectedRows[0].operatingsystem);
      setSelectedRowKeys(newSelectedRowKeys);
      return;
    }
    // 如果选中大于1行
    const isSameOS = selectedRows.every(
      row => row.operatingsystem === selectedRows[0].operatingsystem
    );
    if (isSameOS) {
      // 如果所有选中行的操作系统相同
      setVisibleRowKeys(selectedRows[0].operatingsystem);
      setSelectedRowKeys(newSelectedRowKeys);
    }
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

  //获取节点的展开的行
  const getExpandedRowData = (key: React.Key) => {
    let data: NodeExpanddata[] = [];
    if (key) {
      data = expandedDataMapping[String(key)] || [];
    }
    return (
      <div className="grid grid-cols-2 gap-4">
        {data.map((item: NodeExpanddata) => {
          const statusMapping: { [key: number]: string } = {
            0: "yunhangzhongx",
            2: "yichang-yichang",
            3: "weiqiyong",
          };
          if (item.status === undefined) {
            return
          }
          const metricbeattype = statusMapping[item.status];
          return (
            <div key={item.key} className="flex h-[18px]">
              <p className="ml-8 h-full leading-[18px] text-center">{item.name}</p>
              <div className="ml-8 h-[18px}">
                <Icon
                  type={metricbeattype}
                  style={{ height: "18px", width: "18px" }}
                ></Icon>
              </div>
              <div className="flex items-center ml-8 h-full">
                <Button
                  type="link"
                  onClick={() => {
                    const searchParams = new URLSearchParams(window.location.search);
                    const name = searchParams.get("name");
                    const cloud_region_id = searchParams.get("cloud_region_id");
                    router.push(`/node-manager/cloudregion/configuration?id=${item.key}&name=${name}&cloud_region_id=${cloud_region_id}`);
                  }}
                >
                  {item.filename || '--'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const onSearch: SearchProps["onSearch"] = (value) => {
    getNodelist(value);
  };


  const updatenodelist = async () => {
    setLoading(true);

    try {
      // 获取节点数据
      const newNodeList = await getnodelist(Number(cloudid)).then((res) => {
        return res.map((item: any) => ({
          key: item.id,
          ip: item.ip,
          operatingsystem: item.operating_system.charAt(0).toUpperCase() + item.operating_system.slice(1),
          sidecar: !item.status?.status ? "Running" : "Error",
          message: item.status.message
        }));
      });

      setNodelist(newNodeList);

      // 收集已展开行的请求
      const requests = expandedRowKeys.map(key =>
        getnodelist(Number(cloudid), key as string).then((res) => ({
          key,
          result: res[0],
        }))
      );

      // 保证所有请求并行处理后得到统一结果
      const results = await Promise.all(requests);

      const newExpandedDataMapping = { ...expandedDataMapping };

      results.forEach(({ key, result }) => {
        if (result && Array.isArray(result.status?.collectors)) {
          const expandedData = result.status.collectors.map((item: CollectorItem) => ({
            nodeid: key,
            key: item.configuration_id,
            name: item.collector_name,
            filename: item.configuration_name,
            status: item.status,
          }));
          newExpandedDataMapping[String(key)] = expandedData;
        } else {
          console.warn(`No collectors found or error with key ${key}`);
          newExpandedDataMapping[String(key)] = []; // Handle empty or error case
        }
      });

      setExpandedDataMapping(newExpandedDataMapping);
    } catch (error) {
      console.error('Failed to update node list', error);
      message.error('Error updating node list');
    } finally {
      setLoading(false); // 无论上述情况是否默认执行完成，此行均应恢复原逻辑状态置
    }
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
            message: item.status.message
          };
        });
        setNodelist(data);
      }).finally(() => {
        setLoading(false)
      });
  };

  const handleCollectorSuccess = async () => {
    // 更新 table 的普通数据（主列表数据）
    await getNodelist();
    // 收集已经展开行的 key，再次更新这些展开行的数据

    const res = await getnodelist(Number(cloudid));

    const newExpandedDataMapping = { ...expandedDataMapping };
    res.forEach((resitem: any) => {
      if (expandedRowKeys.includes(resitem.id)) {
        const data = resitem?.status.collectors.map((item: CollectorItem) => ({
          nodeid: resitem.id,
          key: item.configuration_id,
          name: item.collector_name,
          filename: item.configuration_name,
          status: item.status,
        })) || [];
        newExpandedDataMapping[resitem.id] = data;
      }
    });

    // 一次性更新状态
    setExpandedDataMapping(newExpandedDataMapping);
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
              scroll={{ y: "calc(100vh - 400px)", x: "calc(100vw - 300px)" }}
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
            onSuccess={() => { handleCollectorSuccess() }}
          ></CollectorModal>
        </div>
      </div>
    </Mainlayout>
  );
};

export default Node;
