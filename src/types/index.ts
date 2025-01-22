import { Dayjs } from 'dayjs';
export interface TimeSelectorDefaultValue {
  selectValue: number | null;
  rangePickerVaule: [Dayjs, Dayjs] | null;
}

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
  id?: string | number;
  value?: string | number;
}

export interface groupProps {
  id: string;
  name: string;
  path: string;
}

export interface Group {
  id: string;
  name: string;
  children?: Group[];
}

export interface UserInfoContextType {
  roles: string[];
  groups: Group[];
  selectedGroup: Group | null;
  flatGroups: Group[];
  isSuperUser: boolean;
  setSelectedGroup: (group: Group) => void;
}

export interface ClientData {
  id: string;
  name: string;
  client_id: string;
  description: string;
  url: string;
  icon?: string;
}

export interface MenuItem {
  name: string;
  display_name?: string;
  url: string;
  icon: string;
  title: string;
  operation: string[];
  children?: MenuItem[];
}
