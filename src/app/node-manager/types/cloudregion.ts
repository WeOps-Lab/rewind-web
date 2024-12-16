
//节点的类型
interface nodeDataType {
  key: React.Key;
  ip: string;
  operatingsystem: string;
  sidecar: string;
}
//配置文件的类型
interface ConfigurationDataType{
  key: React.Key;
  name: string;
  collector?: string;
  operatingsystem: string;
  nodecount?: number | string;
}

//传入modal的参数类型成功的回调
interface ConfigurationModalSuccess {
  onSuccess: () => void;
}
//调用弹窗接口传入的类型
interface ModalConfig {
  type: string;
  form?:ConfigurationDataType;
  key?: string;
}
//子组件暴露的方法
interface ModalRefConfiguration {
  showModal: (config: ModalConfig) => void;
}

interface SidecardForm {
  key:React.Key;
  ip: string;
  operatingsystem: string;
  sidecar: string;
}

interface sidecarinfotype{
  sidecar:string,
  [key:string]:string
}
// 变量的类型
interface VariableDataType {
  key: React.Key;
  name: string;
  value: string | number;
  description: string;
}
export type {
  VariableDataType, nodeDataType, ConfigurationDataType, ConfigurationModalSuccess,
  ModalRefConfiguration, SidecardForm,sidecarinfotype
}