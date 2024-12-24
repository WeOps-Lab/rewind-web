import React, { useState, useEffect } from 'react';
import { Dropdown, Space, Menu, Avatar, MenuProps } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import { DownOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import useApiClient from '@/utils/request';
import VersionModal from './versionModal';
import { groupProps } from '@/types/index';
import Cookies from 'js-cookie';
import ThemeSwitcher from '@/components/theme';

const UserInfo = () => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const { get } = useApiClient();
  const username = session?.username || 'Test';
  const [myGroups, setMyGroups] = useState<groupProps[]>([]);
  const [versionVisible, setVersionVisible] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    const data = await get('/core/login_info/');
    const { group_list: groupList } = data;
    if (!groupList?.length) return;
    setMyGroups(groupList);
    const groupIdFromCookie = Cookies.get('current_team');
    if (groupIdFromCookie && groupIdFromCookie !== 'undefined') {
      const selectedGroupObj = groupList.find((group: any) => group.id === groupIdFromCookie);
      if (selectedGroupObj) {
        setSelectedGroup(selectedGroupObj.name);
      } else {
        setSelectedGroup(groupList?.[0]?.name);
        Cookies.set('current_team', groupList?.[0]?.id);
      }
    } else {
      setSelectedGroup(groupList?.[0]?.name);
      Cookies.set('current_team', groupList?.[0]?.id);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleVersion = () => {
    setVersionVisible(true);
  };

  const handleChangeGroup = (key: any) => {
    const nextGroup = myGroups.find(group => group.id === key);
    if (nextGroup) {
      setSelectedGroup(nextGroup.name);
      Cookies.set('current_team', nextGroup.id);
      setDropdownVisible(false);
    }
  };

  const handleMenuClick = ({ key }: any) => {
    if (key === 'version') handleVersion();
    if (key === 'logout') handleLogout();
    setDropdownVisible(false);
  };

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'themeSwitch',
      label: (
        <ThemeSwitcher />
      ),
    },
    {
      key: 'version',
      label: (
        <div className="w-full flex justify-between items-center">
          <span>{t('common.version')}</span>
          <span className="text-xs text-[var(--color-text-4)]">3.1.0</span>
        </div>
      )
    },
    { type: 'divider' },
    {
      key: 'groups',
      label: (
        <div className="w-full flex justify-between items-center">
          <span>{t('common.group')}</span>
          <span className="text-xs text-[var(--color-text-4)]">{selectedGroup}</span>
        </div>
      ),
      children: myGroups.map(group => ({
        key: group.id,
        label: (
          <Space onClick={() => handleChangeGroup(group.id)}>
            <span
              className={`inline-block w-2 h-2 rounded-full ${selectedGroup === group.name ? 'bg-[var(--color-success)]' : 'bg-[var(--color-fill-4)]'}`}
            />
            <span className="text-sm">{group.name}</span>
          </Space>
        ),
      })),
    },
    { type: 'divider' },
    { key: 'logout', label: t('common.logout') },
  ];

  const userMenu = (
    <Menu
      className="min-w-[180px]"
      onClick={handleMenuClick}
      items={dropdownItems}
    />
  );

  return (
    <div className='flex items-center'>
      {username && (
        <Dropdown
          overlay={userMenu}
          trigger={['click']}
          visible={dropdownVisible}
          onVisibleChange={setDropdownVisible}
        >
          <a className='cursor-pointer' onClick={(e) => e.preventDefault()}>
            <Space className='text-sm'>
              <Avatar size={20} style={{ backgroundColor: 'var(--color-primary)', verticalAlign: 'middle' }}>
                {username.charAt(0).toUpperCase()}
              </Avatar>
              {username}
              <DownOutlined style={{ fontSize: '10px' }} />
            </Space>
          </a>
        </Dropdown>
      )}
      <VersionModal visible={versionVisible} onClose={() => setVersionVisible(false)} />
    </div>
  );
};

export default UserInfo;
