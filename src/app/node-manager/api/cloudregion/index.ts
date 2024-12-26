import useApiClient from '@/utils/request';

const useApiCloudRegion = () => {
  const { get, post, del, patch } = useApiClient();

  //获取云区域列表
  const getcloudlist = async () => {
    return await get('/api/cloud_region/');
  };

  //更新云区域的介绍
  const updatecloudintro = async (
    id: string,
    data: { introduction: string }
  ) => {
    return await patch(`/api/cloud_region/${id}/`, data);
  };

  //节点的模块
  //获取节点列表
  const getnodelist = async (cloud_region_id: number, search?: string) => {
    return await get('/api/node/', { params: { cloud_region_id, search } });
  };

  //获取sidecar的安装步骤
  const getsidecarstep = async (ip: string, operating_system: string) => {
    return await get('/api/sidecar/install_guide/', {
      params: {
        ip,
        operating_system,
      },
    });
  };

  //批量绑定或更新节点的采集器配置
  const batchbindcollector = async (
    data: {
      node_ids: string;
      collector_configuration_id: string;
    }[]
  ) => {
    return await post('/api/node/batch_binding_configuration/', data);
  };

  //批量操作节点的采集器（启动、停止、重启）
  const batchoperationcollector = async (
    data: {
      node_ids: string[];
      collector_id: string;
      operation: string;
    }[]
  ) => {
    return await post('/api/node/batch_operation/', data);
  };

  //配置文件的模块
  //获取配置文件列表
  const getconfiglist = async (cloud_region_id: number) => {
    return await get('/api/configuration/', { params: { cloud_region_id } });
  };

  //创建一个配置文件
  const createconfig = async (data: {
    name: string;
    collector_id: string;
    cloud_region_id: number;
    config_template: string;
  }) => {
    return await post('/api/configuration/', data);
  };

  //部分更新采集器
  const updatecollector = async (
    id: string,
    data: {
      name: string;
      config_template: string;
      collector_id: string;
    }
  ) => {
    return await patch(`/api/configuration/${id}/`, data);
  };

  //删除采集器配置
  const deletecollector = async (id: string) => {
    return await del(`/api/configuration/${id}/`);
  };

  //应用指定采集器配置文件到指定节点
  const applyconfig = async (
    id: string,
    data: {
      node_id: string;
      collector_configuration_id: string;
    }
  ) => {
    return await post('/api/configuration/apply_to_node/', data);
  };

  //批量删除采集器配置
  const batchdeletecollector = async (data: { ids: string[] }) => {
    return await post('/api/configuration/bulk_delete/', data);
  };

  //变量的模块
  //获取变量列表
  const getvariablelist = async (cloud_region_id: number, search?: string) => {
    return await get('/api/sidecar_env/', {
      params: { cloud_region_id, search },
    });
  };

  //创建环境变量
  const createvariable = async (data: {
    key: string;
    value: string;
    description?: string;
    cloud_region_id: number;
  }) => {
    return await post('/api/sidecar_env/', data);
  };

  //部分更新环境变量
  const updatevariable = async (
    id: number,
    data: {
      key: string;
      value: string;
      description?: string;
    }
  ) => {
    return await patch(`/api/sidecar_env/${id}/`, data);
  };

  //删除环境变量
  const deletevariable = async (id: string) => {
    return await del(`/api/sidecar_env/${id}/`);
  };
  return {
    getcloudlist,
    updatecloudintro,
    getnodelist,
    getsidecarstep,
    getconfiglist,
    createconfig,
    updatecollector,
    deletecollector,
    applyconfig,
    batchdeletecollector,
    getvariablelist,
    createvariable,
    updatevariable,
    deletevariable,
    batchbindcollector,
    batchoperationcollector,
  };
};
export default useApiCloudRegion;
