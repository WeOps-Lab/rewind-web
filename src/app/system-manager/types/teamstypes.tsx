import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
//接口
interface DataType {
    key: string;
    name: string;
    children?: DataType[];
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

export type { DataType, RowContextProps, RowProps, Access, SubGroup, Group };
  