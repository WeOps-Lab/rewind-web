
export interface MergedItem {
    id: string[];
    name: string;
    tag: string[];  // 使用 tag 作为 node_operating_system 的合并数组
    default_template: string;
    introduction: string;
  }

export interface CollectorItem {
    name: string;
    default_template: string;
    id:string;
    introduction:string;
    node_operating_system:string
  }
  
export interface CollectorListResponse {
    value: string;
    label: string;
    template: string;
  }
  

