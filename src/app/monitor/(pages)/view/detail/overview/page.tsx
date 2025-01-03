'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Spin, Tooltip } from 'antd';
import TimeSelector from '@/components/time-selector';
import LineChart from '@/app/monitor/components/charts/lineChart';
import BarChart from '@/app/monitor/components/charts/barChart';
import CustomTable from '@/components/custom-table';
import GuageChart from '@/app/monitor/components/charts/guageChart';
import SingleValue from '@/app/monitor/components/charts/singleValue';
import useApiClient from '@/utils/request';
import {
  MetricItem,
  ChartDataItem,
  SearchParams,
  InterfaceTableItem,
} from '@/app/monitor/types/monitor';
import { ChartData, TimeSelectorDefaultValue } from '@/app/monitor/types';
import { useTranslation } from '@/utils/i18n';
import {
  deepClone,
  findUnitNameById,
  calculateMetrics,
  getEnumValueUnit,
} from '@/app/monitor/utils/common';
import { useSearchParams } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';
import {
  INDEX_CONFIG,
  useInterfaceLabelMap,
} from '@/app/monitor/constants/monitor';
import Icon from '@/components/icon';

const Overview = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const INTERFACE_LABEL_MAP = useInterfaceLabelMap();
  const searchParams = useSearchParams();
  const monitorObject: React.Key = searchParams.get('monitorObjId') || '';
  const instId: React.Key = searchParams.get('instance_id') || '';
  const groupName: string = searchParams.get('name') || '';
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const beginTime: number = dayjs().subtract(15, 'minute').valueOf();
  const lastTime: number = dayjs().valueOf();
  const [timeRange, setTimeRange] = useState<number[]>([beginTime, lastTime]);
  const [frequence, setFrequence] = useState<number>(0);
  const [metricData, setMetricData] = useState<MetricItem[]>([]);
  const [originMetricData, setOriginMetricData] = useState<MetricItem[]>([]);
  const [timeDefaultValue, setTimeDefaultValue] =
    useState<TimeSelectorDefaultValue>({
      selectValue: 15,
      rangePickerVaule: null,
    });

  useEffect(() => {
    clearTimer();
    if (frequence > 0) {
      timerRef.current = setInterval(() => {
        handleSearch('timer');
      }, frequence);
    }
    return () => clearTimer();
  }, [frequence, timeRange]);

  useEffect(() => {
    handleSearch('refresh');
  }, [timeRange]);

  useEffect(() => {
    if (isLoading) return;
    getInitData(instId);
  }, [isLoading]);

  const getInitData = async (id: string) => {
    const getMetrics = get('/monitor/api/metrics/', {
      params: {
        monitor_object_id: +monitorObject,
      },
    });
    const indexList =
      INDEX_CONFIG.find((item) => item.name === groupName)?.dashboardDisplay ||
      [];
    setLoading(true);
    try {
      getMetrics.then((res) => {
        const interfaceConfig = indexList.find(
          (item) => item.indexId === 'interfaces'
        );
        const _metricData = res
          .filter((item: MetricItem) =>
            indexList.find(
              (indexItem) =>
                indexItem.indexId === item.name ||
                (interfaceConfig?.displayDimension || []).includes(item.name)
            )
          )
          .map((item: MetricItem) => {
            const target = indexList.find(
              (indexItem) => indexItem.indexId === item.name
            );
            if (target) {
              Object.assign(item, target);
            }
            if ((interfaceConfig?.displayDimension || []).includes(item.name)) {
              Object.assign(item, interfaceConfig);
            }
            return { ...item, viewData: [] };
          });
        setMetricData(_metricData);
        setOriginMetricData(_metricData);
        fetchViewData(_metricData, id);
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const getParams = (query: string, id: string) => {
    const params: SearchParams = {
      query: query.replace(
        /__\$labels__/g,
        groupName === 'Pod'
          ? `uid="${id}"`
          : groupName === 'Node'
            ? `node="${id}"`
            : `instance_id="${id}"`
      ),
    };
    const startTime = timeRange.at(0);
    const endTime = timeRange.at(1);
    const MAX_POINTS = 100; // 最大数据点数
    const DEFAULT_STEP = 360; // 默认步长
    if (startTime && endTime) {
      params.start = startTime;
      params.end = endTime;
      params.step = Math.max(
        Math.ceil(
          (params.end / MAX_POINTS - params.start / MAX_POINTS) / DEFAULT_STEP
        ),
        1
      );
    }
    return params;
  };

  const processData = (
    data: ChartDataItem[],
    metricItem: MetricItem
  ): ChartData[] => {
    const result: any[] = [];
    const target = metricItem?.dimensions || [];
    data.forEach((item, index: number) => {
      item.values.forEach(([timestamp, value]: [number, string]) => {
        const existing = result.find((entry) => entry.time === timestamp);
        const detailValue = Object.entries(item.metric)
          .map(([key, dimenValue]) => ({
            name: key,
            label:
              key === 'instance_name'
                ? 'Instance Name'
                : target.find((sec) => sec.name === key)?.description || key,
            value: dimenValue,
          }))
          .filter(
            (item) =>
              item.name === 'instance_name' ||
              target.find((tex) => tex.name === item.name)
          );
        if (existing) {
          existing[`value${index + 1}`] = parseFloat(value);
          if (!existing.details[`value${index + 1}`]) {
            existing.details[`value${index + 1}`] = [];
          }
          existing.details[`value${index + 1}`].push(...detailValue);
        } else {
          const details = {
            [`value${index + 1}`]: detailValue,
          };
          result.push({
            time: timestamp,
            title: metricItem.display_name,
            [`value${index + 1}`]: parseFloat(value),
            details,
          });
        }
      });
    });
    return result;
  };

  const fetchViewData = async (data: MetricItem[], id: string) => {
    setLoading(true);
    const requestQueue = data.map((item: MetricItem) =>
      get(`/monitor/api/metrics_instance/query_range/`, {
        params: getParams(item?.query || '', id),
      }).then((response) => ({ id: item.id, data: response.data.result || [] }))
    );
    try {
      const results = await Promise.all(requestQueue);
      results.forEach((result) => {
        const metricItem = data.find((item) => item.id === result.id);
        if (metricItem) {
          metricItem.viewData = processData(result.data || [], metricItem);
        }
      });
    } catch (error) {
      console.error('Error fetching view data:', error);
    } finally {
      const interfaceData = data.filter(
        (item) => item.displayType === 'multipleIndexsTable'
      );
      const interfaceViewData = mergeData(
        interfaceData
          .map((item) => getTableData(item.viewData || [], item.name))
          .flat()
      );
      let _data = data.filter(
        (item) => item.displayType !== 'multipleIndexsTable'
      );
      if (interfaceData.length) {
        _data = [
          ..._data,
          {
            ...interfaceData[0],
            display_name: t('monitor.views.interface'),
            unit: '',
            description: '',
            display_description: '',
            viewData: interfaceViewData,
          },
        ];
      }
      setMetricData(_data);
      setLoading(false);
    }
  };

  const mergeData = (data: InterfaceTableItem[]): InterfaceTableItem[] => {
    if (!data.length) {
      return [];
    }
    const mergedData: Record<string, InterfaceTableItem> = {};
    data.forEach((item) => {
      if (!mergedData[item.id]) {
        mergedData[item.id] = { id: item.id };
      }
      Object.keys(item).forEach((key) => {
        if (key !== 'id') {
          mergedData[item.id][key] = item[key];
        }
      });
    });
    return Object.values(mergedData);
  };

  const onTimeChange = (val: number[]) => {
    setTimeRange(val);
  };

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const onFrequenceChange = (val: number) => {
    setFrequence(val);
  };

  const onRefresh = () => {
    handleSearch('refresh');
  };

  const handleSearch = (type: string) => {
    console.log(type);
    const _metricData = deepClone(originMetricData);
    fetchViewData(_metricData, instId);
  };

  const onXRangeChange = (arr: [Dayjs, Dayjs]) => {
    setTimeDefaultValue((pre) => ({
      ...pre,
      rangePickerVaule: arr,
      selectValue: 0,
    }));
    const _times = arr.map((item) => dayjs(item).valueOf());
    setTimeRange(_times);
  };

  const getGuageLabel = (arr: ChartDataItem[]) => {
    return (
      (arr[0]?.details?.value1 || [])
        .filter((item: ChartDataItem) => item.name !== 'instance_name')
        .map((item: ChartDataItem) => item.value)
        .join('-') || ''
    );
  };

  const getTableData = (data: ChartDataItem[], type?: string) => {
    if (data.length === 0) return [];
    const latestData = data[data.length - 1];
    const { details } = latestData;
    const createName = (details: any[]) =>
      details
        .filter((item) => item.name !== 'instance_name')
        .map((detail) => `${detail.label}${detail.value}`)
        .join('-') || '--';
    const tableData = [];
    for (const key in latestData) {
      if (key.startsWith('value')) {
        const detailKey = key;
        if (details[detailKey]) {
          if (type) {
            const item: any = {};
            item[type] = latestData[detailKey].toFixed(2);
            tableData.push({
              ...item,
              id: detailKey,
              interface:
                (latestData.details?.[detailKey] || []).find(
                  (interfaceKey: any) => interfaceKey?.name === 'ifDescr'
                )?.value || '--',
            });
          } else {
            tableData.push({
              Device: createName(details[detailKey]),
              Value: latestData[detailKey].toFixed(2),
              id: detailKey,
            });
          }
        }
      }
    }
    return tableData;
  };

  const getMultipleColumns = (displayDimension: string[]) => {
    return ['interface', ...displayDimension].map((item: any) => {
      const target = originMetricData.find((tex) => tex.name === item);
      return {
        title: INTERFACE_LABEL_MAP[item],
        dataIndex: item,
        key: item,
        render: (_: unknown, record: any) => (
          <>{getEnumValueUnit(target as MetricItem, record[item])}</>
        ),
      };
    });
  };

  const renderChart = (metricItem: any) => {
    switch (metricItem.displayType) {
      case 'barChart':
        return (
          <BarChart
            data={metricItem.viewData || []}
            unit={metricItem.unit}
            showDimensionFilter
            onXRangeChange={onXRangeChange}
          />
        );
      case 'dashboard':
        return (
          <GuageChart
            value={calculateMetrics(metricItem.viewData || []).latestValue || 0}
            max={20}
            segments={metricItem.segments}
            label={getGuageLabel(metricItem.viewData || [])}
          />
        );
      case 'single':
        return (
          <SingleValue
            fontSize={30}
            unit={metricItem.unit}
            metric={metricItem}
            value={
              calculateMetrics(metricItem.viewData || []).latestValue || '--'
            }
            label={getGuageLabel(metricItem.viewData || [])}
          />
        );
      case 'table':
        return (
          <CustomTable
            pagination={false}
            dataSource={getTableData(metricItem.viewData || [])}
            columns={metricItem.displayDimension.map((item: any) => ({
              title: item,
              dataIndex: item,
              key: item,
            }))}
            scroll={{ y: 100 }}
            rowKey="id"
          />
        );
      case 'multipleIndexsTable':
        return (
          <CustomTable
            pagination={false}
            dataSource={metricItem.viewData || []}
            columns={getMultipleColumns(metricItem.displayDimension)}
            scroll={{ y: 280 }}
            rowKey="id"
          />
        );
      default:
        return (
          <LineChart
            data={metricItem.viewData || []}
            metric={metricItem}
            unit={metricItem.unit}
            showDimensionFilter
            onXRangeChange={onXRangeChange}
          />
        );
    }
  };

  return (
    <div className="bg-[var(--color-bg-1)]">
      <div className="flex justify-end mb-[15px]">
        <TimeSelector
          defaultValue={timeDefaultValue}
          onChange={(value) => onTimeChange(value)}
          onFrequenceChange={onFrequenceChange}
          onRefresh={onRefresh}
        />
      </div>
      <div className="h-[calc(100vh-170px)] overflow-y-auto">
        <Spin spinning={loading}>
          <div className="flex flex-wrap justify-evenly">
            {metricData
              .sort((a: any, b: any) => a.sortIndex - b.sortIndex)
              .map((metricItem: MetricItem) => (
                <div
                  key={metricItem.id}
                  className="mb-[20px] p-[10px] shadow"
                  style={metricItem.style}
                >
                  <div className="flex justify-between items-center mb-[10px]">
                    <div className="text-[14px] w-full flex items-center">
                      <div
                        className="font-[600] mr-[2px] hide-text max-w-[90%]"
                        title={metricItem.display_name}
                      >
                        {metricItem.display_name}
                      </div>
                      <span className="text-[var(--color-text-3)] text-[12px] relative">
                        {findUnitNameById(metricItem.unit)
                          ? `（${findUnitNameById(metricItem.unit)}）`
                          : ''}
                        {metricItem.display_description && (
                          <Tooltip
                            placement="topLeft"
                            title={metricItem.display_description as string}
                          >
                            <div
                              className="absolute cursor-pointer"
                              style={{
                                top: !findUnitNameById(metricItem.unit)
                                  ? '-12px'
                                  : '-3px',
                                right: !findUnitNameById(metricItem.unit)
                                  ? '-13px'
                                  : '-8px',
                              }}
                            >
                              <Icon
                                type="a-shuoming2"
                                className="text-[14px] text-[var(--color-text-3)]"
                              />
                            </div>
                          </Tooltip>
                        )}
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex justify-center items-center h-full"
                    style={{
                      height: 'calc(100% - 30px)',
                    }}
                  >
                    {renderChart(metricItem)}
                  </div>
                </div>
              ))}
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default Overview;
