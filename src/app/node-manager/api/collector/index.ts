import useApiClient from '@/utils/request';

const useApiCollector = () => {
  const { get, post } = useApiClient();

  //获取采集器列表
  const getCollectorlist = async ({
    search,
    node_operating_system,
    name,
    page,
    page_size,
  }: {
    search?: string,
    node_operating_system?: string,
    name?: string,
    page?: number,
    page_size?: number
  }) => {
    return await get('/node_mgmt/api/collector/', {
      params: { search, node_operating_system, name, page, page_size },
    });
  };

  // 获取控制器列表
  const getControllerList = async ({
    name,
    search,
    os,
    page,
    page_size,
  }: {
    name?: string,
    search?: string,
    os?: string,
    page?: number,
    page_size?: number,
  }) => {
    return await get('/node_mgmt/api/controller/', {
      params: { search, os, name, page, page_size }
    });

  };

  // 添加采集器
  const addCollector = async ({
    id,
    name,
    service_type,
    node_operating_system,
    executable_path = 'test/',
    execute_parameters = 'test',
    introduction = '',
  }: {
    id: string,
    name: string,
    service_type: string,
    node_operating_system: string,
    executable_path?: string,
    execute_parameters?: string,
    introduction?: string,
  }) => {
    return await post('/node_mgmt/api/collector/', {
      id,
      name,
      service_type,
      node_operating_system,
      executable_path,
      execute_parameters,
      introduction
    })
  }

  return {
    getCollectorlist,
    getControllerList,
    addCollector
  };
};

export default useApiCollector;
