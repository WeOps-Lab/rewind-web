export interface QuotaData {
  label: string;
  usage: number;
  total: number;
  unit: string;
}

export interface ApiResponse {
  used_file_size: number;
  used_skill_count: number;
  used_bot_count: number;
  all_file_size: number;
  all_skill_count: number;
  all_bot_count: number;
  is_bot_uniform: boolean;
  is_file_uniform: boolean;
  is_skill_uniform: boolean;
}
