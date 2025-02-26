export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  team: string[];
}

export interface FormValues {
  name: string;
  description: string;
  group: string[];
}

export interface SelectTool {
  id: number | string;
  name: string;
  icon: string;
}
