export interface CollectorDataItem {
    id: string;
    name: string;
    node_operating_system: string;
    default_template: string;
    introduction: string;
  }
  
export interface MergedItem {
    id: string[];
    name: string;
    tag: string[];  // 使用 tag 作为 node_operating_system 的合并数组
    default_template: string;
    introduction: string;
  }

