'use client';

import React from 'react';
import { Tooltip } from 'antd';
import WithSideMenuLayout from '@/components/sub-layout';
import OnelineEllipsisIntro from '@/app/opspilot/components/oneline-ellipsis-intro';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/utils/i18n';

const SkillSettingsLayout = ({ children }: { children: React.ReactNode }) => {
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

  const intro = (
    <OnelineEllipsisIntro name={name} desc={desc}></OnelineEllipsisIntro>
  );

  const TopSection = () => (
    <div className="p-4 rounded-md w-full h-[95px]">
      <h2 className="text-lg font-semibold mb-2">{t('skill.settings.title')}</h2>
      <Tooltip title={t('skill.settings.description')}>
        <p className="truncate max-w-full text-sm">{t('skill.settings.description')}</p>
      </Tooltip>
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

export default SkillSettingsLayout;
