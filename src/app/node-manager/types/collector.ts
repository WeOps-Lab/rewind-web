export interface CollectorItem {
  name: string;
  default_template: string;
  id: string;
  introduction: string;
  node_operating_system: string;
}

export interface CollectorListResponse {
  value: string;
  label: string;
  template: string;
}

export interface collectorItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  tag: string[];
}
