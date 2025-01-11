import useApiClient from '@/utils/request';
export const useUserApi = () => {
  const { get, post, del } = useApiClient();

  function getUsersList(params: any) {
    return get('/system_mgmt/user/search_user_list/', { params });
  }
  async function getOrgTree() {
    return await get('/system_mgmt/group/search_group_list/');
  }
  async function getClientDetail(params: any) {
    return await get('/system_mgmt/api/get_client_detail/', params);
  }
  async function getRoleList(params: any) {
    return await get('/system_mgmt/role/search_role_list/', params);
  }
  async function getUserDetail(params: any) {
    return await get('/system_mgmt/user/get_user_detail/', params);
  }
  async function addUser(params: any) {
    return await post(`/system_mgmt/user/create_user/`, params)
  }
  async function editUser(params: any) {
    return await post(`/system_mgmt/user/update_user/`, params)
  }
  //删除单个用户的api
  async function deleteUser(userId: string) {
    try {
      return await del(`/user-manager/internal/user/${userId}`)
    } catch (error: any) {
      throw new Error(error?.message || 'Unknown error occurred');
    }
  }
  return {
    getUsersList,
    getOrgTree,
    getClientDetail,
    getRoleList,
    getUserDetail,
    editUser,
    addUser,
    deleteUser
  }
}
