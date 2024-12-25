'use client';

import React from 'react';
import { Tooltip } from 'antd';
import WithSideMenuLayout from '@/components/sub-layout';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/utils/i18n';

const KnowledgeDetailLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const id = searchParams.get('id');
  const name = searchParams.get('name');
  const desc = searchParams.get('desc');


  const handleBackButtonClick = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length >= 3) {
      if (pathSegments.length === 3) {
        router.push('/knowledge');
      } else if (pathSegments.length > 3) {
        router.push(`/opspilot/knowledge/detail?id=${id}&name=${name}&desc=${desc}`);
      }
    }
    else {
      router.back();
    }
  };

  const menuItems = [
    { label: t('knowledge.documents.title'), path: '/opspilot/knowledge/detail/documents', icon: 'shiyongwendang' },
    { label: t('knowledge.testing.title'), path: '/opspilot/knowledge/detail/testing', icon: 'ceshi' },
    { label: t('knowledge.settings.title'), path: '/opspilot/knowledge/detail/settings', icon: 'shezhi' },
    { label: t('common.api'), path: '/opspilot/knowledge/detail/api', icon: 'api' }
  ];

  const intro = (
    <div>
      <h2 className="text-lg font-semibold mb-2">{name}</h2>
      <p className="text-sm">{desc}</p>
    </div>
  );

  const getTopSectionContent = () => {
    switch (pathname) {
      case '/opspilot/knowledge/detail/documents':
        return (
          <>
            <h2 className="text-lg font-semibold mb-2">{t('knowledge.documents.title')}</h2>
            <Tooltip title={t('knowledge.documents.description')}>
              <p className="truncate max-w-full text-sm">{t('knowledge.documents.description')}</p>
            </Tooltip>
          </>
        );
      case '/opspilot/knowledge/detail/testing':
        return (
          <>
            <h2 className="text-lg font-semibold mb-2">{t('knowledge.testing.title')}</h2>
            <Tooltip title={t('knowledge.testing.description')}>
              <p className="truncate max-w-full text-sm">{t('knowledge.testing.description')}</p>
            </Tooltip>
          </>
        );
      case '/opspilot/knowledge/detail/settings':
        return (
          <>
            <h2 className="text-lg font-semibold mb-2">{t('knowledge.settings.title')}</h2>
            <Tooltip title={t('knowledge.settings.description')}>
              <p className="truncate max-w-full text-sm">{t('knowledge.settings.description')}</p>
            </Tooltip>
          </>
        );
      default:
        return (
          <>
            <h2 className="text-lg font-semibold mb-2">{t('knowledge.documents.title')}</h2>
            <Tooltip title={t('knowledge.documents.description')}>
              <p className="truncate max-w-full">{t('knowledge.documents.description')}</p>
            </Tooltip>
          </>
        );
    }
  };

  const TopSection = () => (
    <div className="p-4 rounded-md w-full h-[95px]">
      {getTopSectionContent()}
    </div>
  );

  return (
    <WithSideMenuLayout
      menuItems={menuItems}
      topSection={<TopSection />}
      intro={intro}
      showBackButton={true}
      showProgress={true}
      onBackButtonClick={handleBackButtonClick}
    >
      {children}
    </WithSideMenuLayout>
  );
};

export default KnowledgeDetailLayout;
