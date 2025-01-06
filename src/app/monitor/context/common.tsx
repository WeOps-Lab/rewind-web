'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import useApiClient from '@/utils/request';
import { UserItem, Organization } from '@/app/monitor/types';
import { ListItem } from '@/types';
import Spin from '@/components/spin';

interface CommonContextType {
  loginInfo: LoginInfo;
  userList: UserItem[];
  authOrganizations: Organization[];
}

interface LoginInfo {
  is_superuser: boolean;
  roles: string[];
  username: string;
  group_list: ListItem[];
}

const CommonContext = createContext<CommonContextType | null>(null);

const CommonContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [loginInfo, setLoginInfo] = useState<LoginInfo>({
    is_superuser: true,
    roles: [],
    username: '',
    group_list: [],
  });
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [authOrganizations, setAuthOrganizations] = useState<Organization[]>(
    []
  );
  const [pageLoading, setPageLoading] = useState(false);
  const { get, isLoading } = useApiClient();

  useEffect(() => {
    if (isLoading) return;
    getPermissionGroups();
  }, [isLoading]);

  const getPermissionGroups = async () => {
    setPageLoading(true);
    try {
      const getUserList = get('/monitor/api/system_mgmt/user_all/');
      const getAuthOrganization = get('/core/api/login_info/');
      Promise.all([getUserList, getAuthOrganization])
        .then((res) => {
          const userData: UserItem[] = res[0]?.data || [];
          const authGroupList = (res[1]?.group_list || []).map(
            (item: Organization) => ({
              label: item.name,
              value: item.id,
              children: [],
            })
          );
          setLoginInfo(res[1]);
          setUserList(userData);
          setAuthOrganizations(authGroupList);
        })
        .finally(() => {
          setPageLoading(false);
        });
    } catch {
      setPageLoading(false);
    }
  };
  return pageLoading ? (
    <Spin />
  ) : (
    <CommonContext.Provider
      value={{
        loginInfo,
        userList,
        authOrganizations,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};

export const useCommon = () => useContext(CommonContext);

export default CommonContextProvider;
