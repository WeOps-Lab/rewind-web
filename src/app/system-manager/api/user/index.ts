import useApiClient from '@/utils/request';
import { message } from 'antd';
export const useUserApi = () => {
  const { get, post, del, put } = useApiClient();

  function getUsersList(params: any) {
    return get('/system_mgmt/user/search_user_list/', { params });
  }
  async function getOrgTree() {
    return await get('/system_mgmt/group/search_group_list/');
  }
  async function getClient() {
    return await get('/system_mgmt/api/get_client/');
  }
  async function getRoleList(params: any) {
    return await get('/system_mgmt/role/search_role_list/', params);
  }
  async function modifyRole(selectedRowKeys: string[], modifyrole: string) {
    try {
      const response: { message: string } = await put('/lite/modifyrole', {
        selectedRowKeys,
        modifyrole
      })
      message.success(response.message);
    } catch (error: any) {
      console.log(error);
    }
  }
  //批量删除用户的api
  async function modifyDelete(selectedRowKeys: string[]) {
    try {
      const response: { message: string } = await del(`/lite/modifydelete`, {
        params: {
          selectedRowKeys
        }
      })
      message.success(response.message);
    } catch (error: any) {
      message.error('Error while modifydelete user');
      throw new Error(error?.message || 'Unknown error occurred');
    }
  }

  async function addUser(params: any) {
    return await post(`/system_mgmt/user/create_user/`, params)
  }

  async function editUser(userId: string, refrom: any) {
    try {
      return await put(`/user-manager/internal/user/${userId}`, {
        params: {
          ...refrom,
          firstName: 'dddd',
          lastName: 'dddd',
          userId
        }
      })
    } catch (error: any) {
      message.error('Error while editing user');
      throw new Error(error?.message || 'Unknown error occurred');
    }
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
    getClient,
    getRoleList,
    editUser,
    modifyRole,
    modifyDelete,
    addUser,
    deleteUser
  }
}
