import React, { useState } from 'react';
import { Dropdown, Space, Avatar, Menu, MenuProps } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { DownOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import VersionModal from './versionModal';
import ThemeSwitcher from '@/components/theme';
import { useUserInfoContext } from '@/context/userInfo';

const UserInfo = () => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { flatGroups, selectedGroup, setSelectedGroup } = useUserInfoContext();

  const username = session?.username || 'Test';
  const [versionVisible, setVersionVisible] = useState<boolean>(false);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const handleVersion = () => {
    setVersionVisible(true);
  };

  const handleChangeGroup = (key: string) => {
    const nextGroup = flatGroups.find(group => group.id === key);
    if (nextGroup) {
      setSelectedGroup(nextGroup);
      setDropdownVisible(false);
      const pathSegments = pathname.split('/').filter(Boolean);
      if (pathSegments.length > 2) {
        const newPath = `/${pathSegments.slice(0, 2).join('/')}`;
        router.push(newPath);
      } else {
        window.location.reload();
      }
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
          <span className="text-xs text-[var(--color-text-4)]">{selectedGroup?.name}</span>
        </div>
      ),
      children: flatGroups.map(group => ({
        key: group.id,
        label: (
          <Space onClick={() => handleChangeGroup(group.id)}>
            <span
              className={`inline-block w-2 h-2 rounded-full ${selectedGroup?.name === group.name ? 'bg-[var(--color-success)]' : 'bg-[var(--color-fill-4)]'}`}
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
