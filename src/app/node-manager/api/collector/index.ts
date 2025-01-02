import useApiClient from '@/utils/request';

const useApiCollector = () => {
  const { get } = useApiClient();

  //获取采集器列表
  const getCollectorlist = async (search?: string) => {
    return await get('/api/collector/', { params: { search } });
  };
  return {
    getCollectorlist,
  };
};

export default useApiCollector;
