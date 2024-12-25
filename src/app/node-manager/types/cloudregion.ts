import { ReactNode } from 'react';
import type { TableDataItem } from '@/app/node-manager/types/index';
//配置文件的类型
interface ConfigurationData {
  key: React.Key;
  name: string;
  collector?: string;
  operatingsystem: string;
  nodecount?: number | string;
}

interface SidecardForm {
  key: React.Key;
  ip: string;
  operatingsystem: string;
  sidecar: string;
}

interface sidecarinfotype {
  sidecar: string;
  [key: string]: string;
}
//配置页面的table的列定义
interface ConfigHookParams {
  configurationClick: (key: string) => void;
  applyconfigurationClick: (key: string) => void
}
interface VariableProps {
  openUerModal: (type: string, form: TableDataItem) => void;
  getFormDataById: (key: string) => TableDataItem;
  delconfirm: (key:string,text:any) => void;
  delcancel: (e: any) => void;
}
interface CouldregionCardProps {
  height?: number;
  width?: number;
  title: ReactNode;
  children?: ReactNode;
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

export type {
  ConfigurationData,
  SidecardForm,
  sidecarinfotype,
  ConfigHookParams,
  VariableProps,
  CouldregionCardProps,
  IConfiglistprops
};
