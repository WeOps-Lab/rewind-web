import type { TableDataItem } from '@/app/node-manager/types/index';
//配置文件的类型
interface ConfigurationData {
  key: React.Key;
  name: string;
  collector?: string;
  operatingsystem: string;
  nodecount?: number | string;
}

interface sidecarinfotype {
  sidecar: string;
  [key: string]: string;
}
//配置页面的table的列定义
interface ConfigHookParams {
  configurationClick: (key: string) => void;
  applyconfigurationClick: (key: string, selectedsystem: string) => void;
}
interface VariableProps {
  openUerModal: (type: string, form: TableDataItem) => void;
  getFormDataById: (key: string) => TableDataItem;
  delconfirm: (key: string, text: any) => void;
  delcancel: (e: any) => void;
}

//api返回的配置文件列表的类型
interface IConfiglistprops {
  id: string;
  name: string;
  collector: string;
  operating_system: string;
  node_count: string;
  config_template?: string;
}

//后端返回的采集器列表
interface CollectorItem {
  id?: string;
  collector_id?: string;
  collector_name?: string;
  configuration_id?: string;
  configuration_name?: string;
  message?: string;
}

//node展开的数据类型
interface NodeExpanddata {
  key: string;
  name: string;
  filename: string;
  status: string;
  nodeid: string;
}

//更新配置文件的请求
interface updateConfigReq {
  node_ids: string[];
  collector_configuration_id: string;
}

//节点模块返回的数据
interface nodeItemtRes {
  id: string;
  ip: string;
  operating_system: string;
  status: {
    status: string;
  };
  [key: string]: any;
}

//节点处理后的数据格式
interface mappedNodeItem {
  key: string;
  ip: string;
  operatingsystem: string;
  sidecar: string;
}

interface ConfigDate{
  key: string,
  name: string,
  collector: string,
  operatingsystem: string,
  nodecount: number,
  configinfo: string,
}
export type {
  ConfigurationData,
  sidecarinfotype,
  ConfigHookParams,
  VariableProps,
  IConfiglistprops,
  CollectorItem,
  NodeExpanddata,
  updateConfigReq,
  nodeItemtRes,
  mappedNodeItem,
  ConfigDate
};
