'use client';
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/utils/i18n';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<{ message: string; timestamp: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/example/api/data');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        console.error('Failed to fetch data:', response.statusText);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>System Dashboard</h1>
      <p>{t('common.monitor')} - {t('studio.menu')}</p>
      {data ? (
        <div>
          <p>Message: {data.message}</p>
          <p>Timestamp: {data.timestamp}</p>
        </div>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default DashboardPage;