export interface ModelConfig {
    openai_api_key?: string;
    openai_base_url?: string;
    base_url?: string;
}
  
export interface Model {
    id: number;
    name: string;
    enabled: boolean;
    llm_config?: ModelConfig;
    embed_config?: ModelConfig;
    rerank_config?: ModelConfig;
    ocr_config?: ModelConfig;
}
  
export interface TabConfig {
    key: string;
    label: string;
    type: string;
}  

export interface ModelConfig {
    openai_api_key?: string;
    openai_base_url?: string;
    base_url?: string;
}