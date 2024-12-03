import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
//接口
interface DataType {
    key: string;
    name: string;
    children?: DataType[];
    fathernode?: string;
    childrenleght?: 0;
  }
  
  interface RowContextProps {
    setActivatorNodeRef?: (element: HTMLElement | null) => void;
    listeners?: SyntheticListenerMap;
  }
  
  interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
    'data-row-key': string;
  }
  
  interface Access {
    view: boolean;
    viewMembers: boolean;
    manageMembers: boolean;
    manage: boolean;
    manageMembership: boolean;
  }
  
  interface SubGroup {
    id: string;
    name: string;
    path: string;
    subGroupCount: number;
    subGroups: SubGroup[];
    access: Access;
  }
  
  interface Group {
    id: string;
    name: string;
    path: string;
    subGroupCount: number;
    subGroups: SubGroup[];
  }

//原始的组织列表的接口
interface OriginalGroup {
  id: string;
  name: string;
  path: string;
  subGroups: OriginalGroup[];
  access: {
    manage: boolean;
    manageMembers: boolean;
    manageMembership: boolean;
    view: boolean;
    viewMembers: boolean;
  };
}

// 转换后的组织列表的接口
interface ConvertedGroup {
  key: string;
  name: string;
  childrenGroups?: ConvertedGroup[];
}

export type { DataType, RowContextProps, RowProps, Access, SubGroup, Group ,OriginalGroup,ConvertedGroup};
  