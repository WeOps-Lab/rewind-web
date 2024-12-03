import useApiClient from '@/utils/request';
export const useApiTeam = () => {
  const { get, post, del, put } = useApiClient();
  //获取组织列表api
  async function getTeamDataApi() {
    return await get('/user-manager/internal/group/list/', {
      params: {
        max: 11,
      },
    });
  }
  //添加组织api
  async function addTeamDataApi(group_name: string) {
    try {
      const data = await post('/user-manager/internal/group', {
        name: group_name,
      });
      console.log(data,"添加的一个节点");
      return data;
    } catch (error) {
      throw error;
    }
  }

  //添加子组织api

  async function addSubTeamApi(parentId: string, group_name: string) {
    try {
      return await post(`/user-manager/internal/group/${parentId}/child`, {
        name: group_name,
      });
    } catch (error) {
      console.error('Failed to add subteam:', error);
    }
  }

  //修改组织名的api
  async function renameTeamApi(group_name: string, groupId: string) {
    try {
      return await put(
        `/user-manager/internal/group/${groupId}`,
        {
          name: group_name,
        }
      );
    } catch (error) {
      console.error('Failed to rename team:', error);
    }
  }

  //删除组织api
  async function deleteteamApi(groupId: string) {
    return await del(
      `user-manager/internal/group/${groupId}`
    );

  }
  return {
    getTeamDataApi,
    addTeamDataApi,
    addSubTeamApi,
    renameTeamApi,
    deleteteamApi,
  };
};
