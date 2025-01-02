import { Dayjs } from 'dayjs';

export interface ColumnItem {
  title: string;
  dataIndex: string;
  key: string;
  render?: (_: unknown, record: any) => JSX.Element;
  [key: string]: unknown;
}

export interface ListItem {
  title?: string;
  label?: string;
  name?: string;
  display_name?: string;
  id?: string | number;
  value?: string | number;
}

export interface ModalConfig {
  type: string;
  form: any;
  subTitle?: string;
  title: string;
  [key: string]: any;
}

export interface ModalRef {
  showModal: (config: ModalConfig) => void;
}

export interface CascaderItem {
  label: string;
  value: string | number;
  children: CascaderItem[];
}

export interface TreeItem {
  title: JSX.Element | string;
  key: string | number;
  label?: string;
  children: TreeItem[];
}

export interface UserItem {
  id: string;
  username: string;
  [key: string]: unknown;
}

export interface Organization {
  id: string;
  name: string;
  value?: string;
  children: Array<SubGroupItem>;
  [key: string]: unknown;
}

export interface SubGroupItem {
  value?: string;
  label?: string;
  children?: Array<SubGroupItem>;
}

export interface OriginSubGroupItem {
  id: string;
  name: string;
  parentId: string;
  subGroupCount: number;
  subGroups: Array<OriginSubGroupItem>;
}
export interface OriginOrganization {
  id: string;
  name: string;
  subGroupCount: number;
  subGroups: Array<OriginSubGroupItem>;
  [key: string]: unknown;
}
export interface TabItem {
  key: string;
  label: string;
  name?: string;
  children?: JSX.Element | string;
}

export interface ChartData {
  time: number;
  value1?: number;
  value2?: number;
  details?: Record<string, any>;
  [key: string]: unknown;
}

export interface SegmentedItem {
  label: string;
  value: string;
}

export interface Pagination {
  current: number;
  total: number;
  pageSize: number;
}

export interface TableDataItem {
  id?: number | string;
  [key: string]: any;
}

export interface TimeSelectorDefaultValue {
  selectValue: number | null;
  rangePickerVaule: [Dayjs, Dayjs] | null;
}
