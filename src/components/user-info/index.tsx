import React from 'react';
import { Dropdown, Space, Avatar } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import Theme from '@/components/theme';
import { DownOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';

const UserInfo = () => {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const username = session?.username || 'Qiu-Jia';

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const items = [
    {
      label: <a onClick={handleLogout}>{t('common.logout')}</a>,
      key: '2',
    },
  ];

  return (
    <div className='flex'>
      {username && (
        <Dropdown menu={{ items }} trigger={['click']}>
          <a className='cursor-pointer' onClick={(e) => e.preventDefault()}>
            <Space className='text-sm'>
              <Avatar 
                size={20}
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  verticalAlign: 'middle' 
                }}>
                {username.charAt(0).toUpperCase()}
              </Avatar>
              {username}
              <DownOutlined style={{ fontSize: '10px' }} />
            </Space>
          </a>
        </Dropdown>
      )}
      <Theme />
    </div>
  );
};

export default UserInfo;