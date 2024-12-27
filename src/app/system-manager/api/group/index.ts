import useApiClient from '@/utils/request';
export const useApiTeam = () => {
  const { get, post, del, put } = useApiClient();
  //获取组织列表api
  async function getTeamData() {
    return await get('/system_mgmt/group/search_group_list/');
  }
  async function addTeamData(params: any) {
    try {
      const data = await post('/system_mgmt/group/create_group/', params);
      return data;
    } catch (error) {
      throw error;
    }
  }
  async function renameTeam(group_name: string, groupId: string) {
    try {
      return await put(`/user-manager/internal/group/${groupId}`,
        {
          name: group_name,
        }
      );
    } catch (error) {
      console.error('Failed to rename team:', error);
    }
  }

  async function deleteTeam(groupId: string) {
    return await del(
      `user-manager/internal/group/${groupId}`
    );
  }
  return {
    getTeamData,
    addTeamData,
    renameTeam,
    deleteTeam,
  };
};
