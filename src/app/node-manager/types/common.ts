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
}
//调用弹窗的类型
interface ModalRef {
  showModal: (config: ModalConfig) => void;
}

export type { ConfigItem, TableDataItem, ModalSuccess, ModalRef, ModalConfig };
