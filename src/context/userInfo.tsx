import React, { createContext, useContext, useState, useEffect } from 'react';
import useApiClient from '@/utils/request';
import { Group, UserInfoContextType } from '@/types/index'
import { convertTreeDataToGroupOptions } from '@/utils/index'
import Cookies from 'js-cookie';

const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

export const UserInfoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { get } = useApiClient();
  const [selectedGroup, setSelectedGroupState] = useState<Group | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [flatGroups, setFlatGroups] = useState<Group[]>([]);

  useEffect(() => {
    const fetchLoginInfo = async () => {
      try {
        const data = await get('/core/api/login_info/');
        const { group_list: groupList, roles } = data;

        setGroups(groupList);
        setRoles(roles);

        if (groupList?.length) {
          const flattenedGroups = convertTreeDataToGroupOptions(groupList);
          setFlatGroups(flattenedGroups);

          const groupIdFromCookie = Cookies.get('current_team');
          const initialGroup = flattenedGroups.find((group: Group) => group.id === groupIdFromCookie) || flattenedGroups[0];

          setSelectedGroupState(initialGroup);
          Cookies.set('current_team', initialGroup.id);
        }
      } catch (err) {
        console.error('Failed to fetch login_info:', err);
      }
    };

    fetchLoginInfo();
  }, []);

  const setSelectedGroup = (group: Group) => {
    setSelectedGroupState(group);
    Cookies.set('current_team', group.id);
  };

  return (
    <UserInfoContext.Provider value={{ roles, groups, selectedGroup, flatGroups, setSelectedGroup }}>
      {children}
    </UserInfoContext.Provider>
  );
};

export const useUserInfoContext = () => {
  const context = useContext(UserInfoContext);
  if (!context) {
    throw new Error('useUserInfoContext must be used within a UserInfoProvider');
  }
  return context;
};
