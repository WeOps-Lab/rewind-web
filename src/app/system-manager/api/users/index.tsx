import useApiClient from '@/utils/request';
import { message } from 'antd';
export const useUsernamegeApi = () => {
  const { get, post, del, put } = useApiClient();

  //获取用户列表的api
  function getuserslistApi(params: any) {
    try {
      return get('/user-manager/internal/user/list', { params });
    } catch (error) {
      throw error;
    }
  }
  //获取组织树的列表的api
  async function getorgtreeApi() {
    try {
      return await get('/user-manager/internal/group/list/',
        { params: { max: 11 } }
      );
    } catch (error) {
      throw error;
    }
  }
  //批量修改角色的api
  async function modifyroleApi(selectedRowKeys: string[], modifyrole: string) {
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
  async function modifydeleteApi(selectedRowKeys: string[]) {
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

  //添加用户的api
  async function addUserApi(username: string, email: string, firstName: string, lastName: string) {
    try {
      return await post(`/user-manager/internal/user`, {
        email,
        firstName,
        lastName,
        username
      })
    } catch (error: any) {
      message.error('Error while addUser user');
      throw new Error(error?.message || 'Unknown error occurred');
    }
  }
  //编辑用户的api
  async function editUserApi(userId: string, refrom: any) {
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
  async function deleteUserApi(userId: string) {
    try {
      return await del(`/user-manager/internal/user/${userId}`)
    } catch (error: any) {
      throw new Error(error?.message || 'Unknown error occurred');
    }
  }
  return {
    getuserslistApi,
    getorgtreeApi,
    editUserApi,
    modifyroleApi,
    modifydeleteApi,
    addUserApi,
    deleteUserApi
  }
}
