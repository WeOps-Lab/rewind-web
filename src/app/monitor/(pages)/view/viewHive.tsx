'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Input } from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { ViewListProps } from '@/app/monitor/types/monitor';
import { Pagination, TableDataItem } from '@/app/monitor/types';
import TimeSelector from '@/components/time-selector';
import HexGridChart from '@/app/monitor/components/charts/hexgrid';

const ViewHive: React.FC<ViewListProps> = ({ objects, objectId }) => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [chartData, setChartData] = useState<TableDataItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [frequence, setFrequence] = useState<number>(0);

  useEffect(() => {
    if (isLoading) return;
    if (objectId && objects?.length) {
      setChartData([]);
      setPagination((prev: Pagination) => ({
        ...prev,
        current: 1,
      }));
      getInitData();
    }
  }, [objectId, objects, isLoading]);

  useEffect(() => {
    if (objectId && objects?.length && !isLoading) {
      onRefresh();
    }
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (!frequence) {
      clearTimer();
      return;
    }
    timerRef.current = setInterval(() => {
      getAssetInsts(objectId, 'timer');
    }, frequence);
    return () => {
      clearTimer();
    };
  }, [
    frequence,
    objectId,
    pagination.current,
    pagination.pageSize,
    searchText,
  ]);

  const getInitData = async () => {
    const params = {
      page: pagination.current,
      page_size: pagination.pageSize,
      add_metrics: true,
      name: searchText,
    };
    const objParams = {
      monitor_object_id: objectId,
    };

    const getInstList = get(`/monitor/api/monitor_instance/${objectId}/list/`, {
      params,
    });
    const getMetrics = get('/monitor/api/metrics/', {
      params: objParams,
    });
    const getPlugins = get('/monitor/api/monitor_plugin/', {
      params: objParams,
    });
    setTableLoading(true);
    try {
      const res = await Promise.all([getInstList, getMetrics, getPlugins]);
      console.log(res, tableLoading, chartData);
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
    }
  };

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const getAssetInsts = async (objectId: React.Key, type?: string) => {
    const params = {
      page: pagination.current,
      page_size: pagination.pageSize,
      add_metrics: true,
      name: searchText,
    };
    if (type === 'clear') {
      params.name = '';
    }
    try {
      setTableLoading(type !== 'timer');
      const data = await get(
        `/monitor/api/monitor_instance/${objectId}/list/`,
        {
          params,
        }
      );
      setChartData(data.results || []);
      setPagination((prev: Pagination) => ({
        ...prev,
        total: data.count || 0,
      }));
    } finally {
      setTableLoading(false);
    }
  };

  const onFrequenceChange = (val: number) => {
    setFrequence(val);
  };

  const onRefresh = () => {
    getAssetInsts(objectId);
  };

  const clearText = () => {
    setSearchText('');
    getAssetInsts(objectId, 'clear');
  };

  const onLoadMore = ()=>{
    console.log(123)
  }

  return (
    <div className="w-full h-[calc(100vh-216px)]">
      <div className="flex justify-between mb-[10px]">
        <div className="flex items-center">
          <Input
            allowClear
            className="w-[320px]"
            placeholder={t('common.searchPlaceHolder')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={onRefresh}
            onClear={clearText}
          ></Input>
        </div>
        <TimeSelector
          onlyRefresh
          onFrequenceChange={onFrequenceChange}
          onRefresh={onRefresh}
        />
      </div>
      <HexGridChart
        data={[
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 2',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 3',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 4',
            description: '这是六边形 2 的详细描述。',
            fill: '#2196F3',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
          {
            name: 'Hex 1',
            description: '这是六边形 1 的详细描述。',
            fill: '#4CAF50',
          },
        ]}
        onLoadMore={onLoadMore}
      ></HexGridChart>
    </div>
  );
};
export default ViewHive;
