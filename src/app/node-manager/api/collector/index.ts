import useApiClient from '@/utils/request';

const useApiCollector = () => {
  const { get } = useApiClient();

  //获取采集器列表
  const getCollectorlist = async ({ search, node_operating_system }: { search?: string, node_operating_system?: string }) => {
    return await get('/node_mgmt/api/collector/', { params: { search,node_operating_system } });
  };
  return {
    getCollectorlist,
  };
};

export default useApiCollector;
