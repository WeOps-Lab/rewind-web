'use client';

import React from 'react';
import { useTranslation } from '@/utils/i18n';
import WithSideMenuLayout from '@/components/sub-layout'

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();

  const menuItems = [
    { label: t('settings.manageQuota.title'), path: '/settings', icon: '_quota_management' },
    { label: t('settings.myQuota.title'), path: '/settings/quota', icon: 'quota' },
    { label: t('settings.secret.title'), path: '/settings/key', icon: 'key' }
  ];

  return (
    <WithSideMenuLayout
      menuItems={menuItems}
    >
      {children}
    </WithSideMenuLayout>
  );
};

export default SettingsLayout;
