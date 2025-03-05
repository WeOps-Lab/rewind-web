'use client';

import React from 'react';
import { Tooltip } from 'antd';
import WithSideMenuLayout from '@/components/sub-layout';
import OnelineEllipsisIntro from '@/app/opspilot/components/oneline-ellipsis-intro';
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
        router.push('/opspilot/studio');
      } else if (pathSegments.length > 3) {
        router.push(`/opspilot/studio/detail?id=${id}&name=${name}&desc=${desc}`);
      }
    }
    else {
      router.back();
    }
  };

  const intro = (
    <OnelineEllipsisIntro name={name} desc={desc}></OnelineEllipsisIntro>
  );

  const getTopSectionContent = () => {
    switch (pathname) {
      case '/opspilot/studio/detail/settings':
        return (
          <>
            <h2 className="text-lg font-semibold mb-2">{t('studio.settings.title')}</h2>
            <Tooltip title={t('knowledge.documents.description')}>
              <p className="truncate max-w-full text-sm">{t('studio.settings.description')}</p>
            </Tooltip>
          </>
        );
      case '/opspilot/studio/detail/channel':
        return (
          <>
            <h2 className="text-lg font-semibold mb-2">{t('studio.channel.title')}</h2>
            <Tooltip title={t('knowledge.testing.description')}>
              <p className="truncate max-w-full text-sm">{t('studio.channel.description')}</p>
            </Tooltip>
          </>
        );
      case '/opspilot/studio/detail/logs':
        return (
          <>
            <h2 className="text-lg font-semibold mb-2">{t('studio.logs.title')}</h2>
            <Tooltip title={t('knowledge.settings.description')}>
              <p className="truncate max-w-full text-sm">{t('studio.logs.description')}</p>
            </Tooltip>
          </>
        );
      default:
        return (
          <>
            <h2 className="text-lg font-semibold mb-2">{t('studio.settings.title')}</h2>
            <Tooltip title={t('knowledge.documents.description')}>
              <p className="truncate max-w-full">{t('studio.settings.description')}</p>
            </Tooltip>
          </>
        );
    }
  };

  const TopSection = () => (
    <div className="p-4 rounded-md w-full h-[88px]">
      {getTopSectionContent()}
    </div>
  );

  return (
    <WithSideMenuLayout
      topSection={<TopSection />}
      intro={intro}
      showBackButton={true}
      onBackButtonClick={handleBackButtonClick}
    >
      {children}
    </WithSideMenuLayout>
  );
};

export default KnowledgeDetailLayout;
