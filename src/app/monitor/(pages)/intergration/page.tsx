'use client';
import React, { useState } from 'react';
import { Segmented } from 'antd';
import { useTranslation } from '@/utils/i18n';
import Intergration from './intergration';
import Asset from './asset';

const IntergrationAsset = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>('intergration');
  const isIntergration: boolean = activeTab === 'intergration';

  const onTabChange = (val: string) => {
    setActiveTab(val);
  };

  return (
    <div style={{ width: '100%' }}>
      <div>
        <Segmented
          className="mb-[20px]"
          value={activeTab}
          options={[
            {
              label: t('monitor.intergrations.intergration'),
              value: 'intergration',
            },
            {
              label: t('monitor.asset'),
              value: 'asset',
            },
          ]}
          onChange={onTabChange}
        />
        {isIntergration ? <Intergration /> : <Asset />}
      </div>
    </div>
  );
};
export default IntergrationAsset;
