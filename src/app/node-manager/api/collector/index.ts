import useApiClient from '@/utils/request';

const useApiCollector = () => {
  const { get } = useApiClient();

  //获取采集器列表
  const getCollectorlist = async ({ search, node_operating_system,name }: { search?: string, node_operating_system?: string,name?:string }) => {
    return await get('/node_mgmt/api/collector/', { params: { search,node_operating_system,name } });
  };
  return {
    getCollectorlist,
  };
};

export default useApiCollector;
