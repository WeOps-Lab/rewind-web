'use client';

import React, { useState } from 'react';
import { Spin } from 'antd';
import WithSideMenuLayout from '@/components/sub-layout';
import { useRouter } from 'next/navigation';
import { getIconUrl } from '@/app/cmdb/utils/common';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import attrLayoutStyle from './layout.module.scss';
import { useTranslation } from '@/utils/i18n';

const AboutLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pageLoading] = useState<boolean>(false);
  const objIcon: string = searchParams.get('icn') || '';
  const modelName: string = searchParams.get('model_name') || '';
  const modelId: string = searchParams.get('model_id') || '';
  const instName: string = searchParams.get('inst_name') || '--';
  const { t } = useTranslation();

  const handleBackButtonClick = () => {
    router.push(`/cmdb/assetData`);
  };

  const intro = (
    <header className="flex items-center">
      <Image
        src={getIconUrl({ icn: objIcon, model_id: modelId })}
        className="block mr-[10px]"
        alt={t('picture')}
        width={30}
        height={30}
      />
      <div>
        <div className="text-[14px] font-[800] mb-[2px] break-all">
          {modelName}
        </div>
        <div className="w-[100px] text-[var(--color-text-2)] font-[400] text-[12px] hide-text break-all">
          {instName}
        </div>
      </div>
    </header>
  );

  return (
    <div className={`flex flex-col ${attrLayoutStyle.attrLayout}`}>
      <Spin spinning={pageLoading}>
        <WithSideMenuLayout
          showBackButton={true}
          onBackButtonClick={handleBackButtonClick}
          intro={intro}
        >
          {children}
        </WithSideMenuLayout>
      </Spin>
    </div>
  );
};

export default AboutLayout;
