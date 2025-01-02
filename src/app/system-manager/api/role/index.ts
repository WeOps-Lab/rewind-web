import useApiClient from '@/utils/request';
export const useRoleApi = () => {
  const { get, post, put, del } = useApiClient();
  async function getClientData() {
    return await get('/system_mgmt/api/get_client/');
  }
  const getRoles = async () => {
    return await get('/system_mgmt/api/roles/');
  }
  const addRole = async (role: { name: string }) => {
    return await post('/system_mgmt/api/roles/', role);
  }
  const updateRole = async (role: { id: string, name: string }) => {
    return await put(`/system_mgmt/api/roles/${role.id}/`, { name: role.name });
  }
  const deleteRole = async (roleId: string) => {
    return await del(`/system_mgmt/api/roles/${roleId}/`);
  }
  const getUsersByRole = async (roleId: string) => {
    return await get(`/system_mgmt/api/roles/${roleId}/users/`);
  }
  const updatePermissions = async (roleId: string, permissions: any) => {
    return await put(`/system_mgmt/api/roles/${roleId}/permissions/`, { permissions });
  }
  return {
    getClientData,
    getRoles,
    addRole,
    updateRole,
    deleteRole,
    getUsersByRole,
    updatePermissions
  };
};
