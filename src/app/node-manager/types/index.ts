interface TableDataItem {
  id?: string | number;
  [key: string]: any;
}

interface ConfigItem<T> {
  name?: string;
  title: string;
  dataIndex: string;
  render?: (text: string | number, record: T) => JSX.Element;
  [key: string]: unknown;
}

//传入modal的参数类型成功的回调
interface ModalSuccess {
  onSuccess: () => void;
}

//调用弹窗接口传入的类型
interface ModalConfig {
  type: string;
  form?: TableDataItem;
  key?: string;
  ids?: string[];
  selectedsystem?: string;
  nodes?:string[]
}

//调用弹窗的类型
interface ModalRef {
  showModal: (config: ModalConfig) => void;
}

interface TopSectionProps {
  width?: number;
  height?: number;
  title?: React.ReactNode;
  children: React.ReactNode;
}

//下拉配置
interface OptionItem {
  label: string;
  value: string | number;
  template?: string;
}

//云区域的卡片
interface Collectorcardprops {
  id: string;
  name: string;
  system: string[];
  introduction: string;
}

interface DropDownItem {
  key: string;
  label: string;
}

export type {
  ConfigItem,
  TableDataItem,
  ModalSuccess,
  ModalRef,
  ModalConfig,
  TopSectionProps,
  OptionItem,
  Collectorcardprops,
  DropDownItem
};
