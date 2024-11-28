import type { TableProps } from 'antd';
// 定义接口
interface UserDataType {
    key: React.Key;
    username: string;
    name: string;
    email: string;
    number: string;
    team: string;
    role: string;
    [key: string]: unknown; 
  }
interface Access {
    manageGroupMembership: boolean;
    view: boolean;
    mapRoles: boolean;
    impersonate: boolean;
    manage: boolean;
  }
  
// 定义 BruteForceStatus 接口
interface BruteForceStatus {
    numFailures: number;
    disabled: boolean;
    lastIPFailure: string;
    lastFailure: number;
  }
  
// 定义 传输User 接口
interface TransmitUserData {
    id: string;
    createdTimestamp: number;
    username: string;
    enabled: boolean;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    Number: string;
    email: string;
    access: Access;
    team: string;
    role: string;
    bruteForceStatus: BruteForceStatus;
  }
  
// 定义组织列表的接口
type TableRowSelection<T extends object = object> =
    TableProps<T>['rowSelection'];
export type { UserDataType, TransmitUserData, TableRowSelection,Access, BruteForceStatus };