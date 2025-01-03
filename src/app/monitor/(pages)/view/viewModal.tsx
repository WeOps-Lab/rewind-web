'use client';

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Button, Spin, Select, Tooltip } from 'antd';
import { BellOutlined, SearchOutlined } from '@ant-design/icons';
import OperateDrawer from '@/app/monitor/components/operate-drawer';
import TimeSelector from '@/components/time-selector';
import LineChart from '@/app/monitor/components/charts/lineChart';
import Collapse from '@/components/collapse';
import useApiClient from '@/utils/request';
import {
  ModalRef,
  ChartData,
  TimeSelectorDefaultValue,
} from '@/app/monitor/types';
import {
  MetricItem,
  GroupInfo,
  IndexViewItem,
  SearchParams,
  ChartDataItem,
} from '@/app/monitor/types/monitor';
import { useTranslation } from '@/utils/i18n';
import { deepClone, findUnitNameById } from '@/app/monitor/utils/common';
import dayjs, { Dayjs } from 'dayjs';
import Icon from '@/components/icon';

interface ModalProps {
  monitorObject: React.Key;
  monitorName: string;
  monitorId: string;
}

const ViewModal = forwardRef<ModalRef, ModalProps>(
  ({ monitorObject, monitorName, monitorId }, ref) => {
    const { get } = useApiClient();
    const { t } = useTranslation();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [metricId, setMetricId] = useState<number>();
    const beginTime: number = dayjs().subtract(15, 'minute').valueOf();
    const lastTime: number = dayjs().valueOf();
    const [timeRange, setTimeRange] = useState<number[]>([beginTime, lastTime]);
    const [timeDefaultValue, setTimeDefaultValue] =
      useState<TimeSelectorDefaultValue>({
        selectValue: 15,
        rangePickerVaule: null,
      });
    const [frequence, setFrequence] = useState<number>(0);
    const [metricData, setMetricData] = useState<IndexViewItem[]>([]);
    const [originMetricData, setOriginMetricData] = useState<IndexViewItem[]>(
      []
    );
    const [instId, setInstId] = useState<string>('');
    const [expandId, setExpandId] = useState<number>(0);

    useImperativeHandle(ref, () => ({
      showModal: ({ title, form }) => {
        // 开启弹窗的交互
        setGroupVisible(true);
        setTitle(title);
        setInstId(form.instance_id);
        getInitData(form.instance_id);
      },
    }));

    useEffect(() => {
      clearTimer();
      if (frequence > 0) {
        timerRef.current = setInterval(() => {
          handleSearch('timer');
        }, frequence);
      }
      return () => clearTimer();
    }, [frequence, timeRange, metricId]);

    useEffect(() => {
      handleSearch('refresh');
    }, [timeRange]);

    const handleCancel = () => {
      setGroupVisible(false);
      clearTimer();
    };

    const getInitData = async (id: string) => {
      const params = {
        monitor_object_id: monitorObject,
      };
      const getGroupList = get(`/monitor/api/metrics_group/`, { params });
      const getMetrics = get('/monitor/api/metrics/', { params });
      setLoading(true);
      try {
        Promise.all([getGroupList, getMetrics])
          .then((res) => {
            const groupData = res[0].map((item: GroupInfo, index: number) => ({
              ...item,
              isLoading: !index,
              child: [],
            }));
            const metricData = res[1];
            metricData.forEach((metric: MetricItem) => {
              const target = groupData.find(
                (item: GroupInfo) => item.id === metric.metric_group
              );
              if (target) {
                target.child.push({
                  ...metric,
                  viewData: [],
                });
              }
            });
            const _groupData = groupData.filter(
              (item: any) => !!item.child?.length
            );
            setExpandId(_groupData[0]?.id || 0);
            setMetricData(_groupData);
            setOriginMetricData(_groupData);
            fetchViewData(_groupData, _groupData[0]?.id || 0, id);
          })
          .finally(() => {
            setLoading(false);
          });
      } catch {
        setLoading(false);
      }
    };

    const getParams = (query: string, id: string) => {
      const params: SearchParams = {
        query: query.replace(
          /__\$labels__/g,
          monitorName === 'Pod'
            ? `uid="${id}"`
            : monitorName === 'Node'
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

    const fetchViewData = async (
      data: IndexViewItem[],
      groupId: number,
      id: string
    ) => {
      const metricList = data.find((item) => item.id === groupId)?.child || [];
      const requestQueue = metricList.map((item) =>
        get(`/monitor/api/metrics_instance/query_range/`, {
          params: getParams(item.query, id),
        }).then((response) => ({
          id: item.id,
          data: response.data.result || [],
        }))
      );
      try {
        const results = await Promise.all(requestQueue);
        results.forEach((result) => {
          const metricItem = metricList.find((item) => item.id === result.id);
          if (metricItem) {
            metricItem.viewData = processData(result.data || [], metricItem);
          }
        });
      } catch (error) {
        console.error('Error fetching view data:', error);
      } finally {
        const _data = deepClone(data).map((item: IndexViewItem) => ({
          ...item,
          isLoading: false,
        }));
        setMetricData(_data);
      }
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

    const handleSearch = (type?: string) => {
      const _metricData = deepClone(metricData);
      const target = _metricData.find(
        (item: IndexViewItem) => item.id === expandId
      );
      if (type === 'refresh' && target) {
        target.isLoading = true;
      }
      setMetricData(_metricData);
      fetchViewData(_metricData, expandId, instId);
    };

    const handleMetricIdChange = (val: number) => {
      setMetricId(val);
      if (val) {
        const filteredData = originMetricData
          .map((group) => ({
            ...group,
            isLoading: false,
            child: (group?.child || []).filter((item) => item.id === val),
          }))
          .filter((item) => item.child?.find((tex) => tex.id === val));
        const target = filteredData.find((item) =>
          item.child?.find((tex) => tex.id === val)
        );
        if (target) {
          target.isLoading = true;
          const _groupId = target?.id || 0;
          setExpandId(_groupId);
          setMetricData(filteredData);
          fetchViewData(filteredData, _groupId, instId);
        }
      } else {
        getInitData(instId);
      }
    };

    const toggleGroup = (expanded: boolean, groupId: number) => {
      if (expanded) {
        const _metricData = deepClone(metricData);
        _metricData.forEach((item: IndexViewItem) => {
          item.isLoading = false;
        });
        const targetIndex = _metricData.findIndex(
          (item: IndexViewItem) => item.id === groupId
        );
        if (targetIndex !== -1) {
          _metricData[targetIndex].isLoading = true;
        }
        setExpandId(groupId);
        setMetricData(_metricData);
        fetchViewData(_metricData, groupId, instId);
      }
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

    const linkToSearch = (row: any) => {
      const _row = {
        monitor_object: monitorName,
        instance_id: instId,
        metric_id: row.name,
      };
      const queryString = new URLSearchParams(_row).toString();
      const url = `/monitor/search?${queryString}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    const linkToPolicy = (row: any) => {
      const _row = {
        monitorName: monitorName,
        monitorObjId: monitorId,
        instanceId: instId,
        metricId: row.name,
        type: 'add',
      };
      const queryString = new URLSearchParams(_row).toString();
      const url = `/monitor/event/strategy?${queryString}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
      <div>
        <OperateDrawer
          width={950}
          title={title}
          visible={groupVisible}
          onClose={handleCancel}
          footer={
            <div>
              <Button onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          }
        >
          <div className="flex justify-between mb-[15px]">
            <Select
              className="w-[250px]"
              placeholder={t('common.searchPlaceHolder')}
              value={metricId}
              allowClear
              showSearch
              options={originMetricData.map((item) => ({
                label: item.display_name,
                title: item.name,
                options: (item.child || []).map((tex) => ({
                  label: tex.display_name,
                  value: tex.id,
                })),
              }))}
              onChange={handleMetricIdChange}
            ></Select>
            <TimeSelector
              defaultValue={timeDefaultValue}
              onChange={(value) => onTimeChange(value)}
              onFrequenceChange={onFrequenceChange}
              onRefresh={onRefresh}
            />
          </div>
          <div className="groupList">
            <Spin spinning={loading}>
              {metricData.map((metricItem) => (
                <Spin
                  className="w-full"
                  key={metricItem.id}
                  spinning={metricItem.isLoading}
                >
                  <Collapse
                    className="mb-[10px]"
                    title={metricItem.display_name || ''}
                    isOpen={metricItem.id === expandId}
                    onToggle={(expanded) =>
                      toggleGroup(expanded, metricItem.id)
                    }
                  >
                    <div className="flex flex-wrap justify-between">
                      {(metricItem.child || []).map((item) => (
                        <div
                          key={item.id}
                          className="w-[49%] border border-[var(--color-border-1)] p-[10px] mb-[10px]"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[14px] relative">
                              <span className="font-[600] mr-[2px]">
                                {item.display_name}
                              </span>
                              <span className="text-[var(--color-text-3)] text-[12px]">
                                {`${
                                  findUnitNameById(item.unit)
                                    ? '（' + findUnitNameById(item.unit) + '）'
                                    : ''
                                }`}
                              </span>
                              <Tooltip
                                placement="topLeft"
                                title={item.display_description}
                              >
                                <div
                                  className="absolute cursor-pointer inline-block"
                                  style={{
                                    top: '-3px',
                                    right: '-14px',
                                  }}
                                >
                                  <Icon
                                    type="a-shuoming2"
                                    className="text-[14px] text-[var(--color-text-3)]"
                                  />
                                </div>
                              </Tooltip>
                            </span>
                            <div className="text-[var(--color-text-3)]">
                              <SearchOutlined
                                className="cursor-pointer"
                                onClick={() => {
                                  linkToSearch(item);
                                }}
                              />
                              <BellOutlined
                                className="ml-[6px] cursor-pointer"
                                onClick={() => {
                                  linkToPolicy(item);
                                }}
                              />
                            </div>
                          </div>
                          <div className="h-[200px] mt-[10px]">
                            <LineChart
                              metric={item}
                              data={item.viewData || []}
                              unit={item.unit}
                              onXRangeChange={onXRangeChange}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Collapse>
                </Spin>
              ))}
            </Spin>
          </div>
        </OperateDrawer>
      </div>
    );
  }
);
ViewModal.displayName = 'ViewModal';
export default ViewModal;
