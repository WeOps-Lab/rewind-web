'use client';
import React, { useState, useEffect } from 'react';
import { Segmented, Spin } from 'antd';
import { useTranslation } from '@/utils/i18n';
import { SegmentedItem } from '@/app/monitor/types';
import Alert from './alert/index';
import Strategy from './strategy';
import { ObectItem, MetricItem } from '@/app/monitor/types/monitor';
import useApiClient from '@/utils/request';
import { useSearchParams } from 'next/navigation';

const Event = () => {
  const { t } = useTranslation();
  const { get, isLoading } = useApiClient();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(
    searchParams.get('active') || 'alert'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [objects, setObjects] = useState<ObectItem[]>([]);
  const [groupObjects, setGroupObjects] = useState<ObectItem[]>([]);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);

  const items: SegmentedItem[] = [
    {
      label: t('monitor.events.alert'),
      value: 'alert',
    },
    {
      label: t('monitor.events.strategy'),
      value: 'strategy',
    },
  ];

  useEffect(() => {
    if (isLoading) return;
    getInitData();
  }, [isLoading]);

  const onTabChange = (val: string) => {
    setActiveTab(val);
  };

  const getInitData = () => {
    setLoading(true);
    Promise.all([getMetrics(), getObjects()]).finally(() => {
      setLoading(false);
    });
  };

  const getMetrics = async () => {
    const data = await get(`/monitor/api/metrics/`);
    setMetrics(data);
  };

  const getObjects = async () => {
    const data: ObectItem[] = await get('/monitor/api/monitor_object/', {
      params: {
        add_policy_count: true,
      },
    });
    const groupedData = data.reduce(
      (acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = {
            label: item.display_type,
            title: item.type,
            options: [],
          };
        }
        acc[item.type].options.push({
          label: item.display_name,
          value: item.name,
        });
        return acc;
      },
      {} as Record<string, any>
    );
    setGroupObjects(Object.values(groupedData));
    setObjects(data);
  };

  return (
    <div className="w-full">
      <Spin spinning={loading}>
        <Segmented
          className="mb-[20px] custom-tabs"
          value={activeTab}
          options={items}
          onChange={onTabChange}
        />
        {activeTab === 'alert' ? (
          <Alert
            objects={objects}
            metrics={metrics}
            groupObjects={groupObjects}
          />
        ) : (
          <Strategy objects={objects} metrics={metrics} />
        )}
      </Spin>
    </div>
  );
};
export default Event;
