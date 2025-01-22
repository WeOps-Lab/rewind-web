'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Spin, Select, Button, Segmented, Input, Tree } from 'antd';
import { BellOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { useConditionList } from '@/app/monitor/constants/monitor';
import useApiClient from '@/utils/request';
import TimeSelector from '@/components/time-selector';
import Collapse from '@/components/collapse';
import searchStyle from './index.module.scss';
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';
import LineChart from '@/app/monitor/components/charts/lineChart';
import CustomTable from '@/components/custom-table';
import {
  ListItem,
  ColumnItem,
  ChartData,
  TimeSelectorDefaultValue,
  TreeItem,
} from '@/app/monitor/types';
import { Dayjs } from 'dayjs';
import {
  ObectItem,
  MetricItem,
  ChartDataItem,
  TableDataItem,
  ConditionItem,
  SearchParams,
  IndexViewItem,
  GroupInfo,
} from '@/app/monitor/types/monitor';
import { deepClone, findUnitNameById } from '@/app/monitor/utils/common';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
const { Option } = Select;
const { Search } = Input;

const SearchView: React.FC = () => {
  const { get, isLoading } = useApiClient();
  const { t } = useTranslation();
  const CONDITION_LIST = useConditionList();
  const searchParams = useSearchParams();
  const url_instance_id = searchParams.get('instance_id');
  const url_obj_name = searchParams.get('monitor_object');
  const url_metric_id = searchParams.get('metric_id');
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [objLoading, setObjLoading] = useState<boolean>(false);
  const [metric, setMetric] = useState<string | null>(url_metric_id || null);
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);
  const [instanceLoading, setInstanceLoading] = useState<boolean>(false);
  const [instanceId, setInstanceId] = useState<string[]>(
    url_instance_id ? [url_instance_id] : []
  );
  const [instances, setInstances] = useState<
    { instance_id: string; instance_name: string }[]
  >([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [object, setObject] = useState<string | undefined>(url_obj_name as any);
  const [objects, setObjects] = useState<ObectItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('area');
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const beginTime: number = dayjs().subtract(15, 'minute').valueOf();
  const lastTime: number = dayjs().valueOf();
  const [timeRange, setTimeRange] = useState<number[]>([beginTime, lastTime]);
  const [timeDefaultValue, setTimeDefaultValue] =
    useState<TimeSelectorDefaultValue>({
      selectValue: 15,
      rangePickerVaule: null,
    });
  const [columns, setColumns] = useState<ColumnItem[]>([]);
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [frequence, setFrequence] = useState<number>(0);
  const [unit, setUnit] = useState<string>('');
  const isArea: boolean = activeTab === 'area';
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [originalTreeData, setOriginalTreeData] = useState<TreeItem[]>([]); // 保存原始树数据
  const [treeSearchValue, setTreeSearchValue] = useState<string>(''); // 搜索值
  const [originMetricData, setOriginMetricData] = useState<IndexViewItem[]>([]);

  useEffect(() => {
    if (isLoading) return;
    getObjects();
  }, [isLoading]);

  useEffect(() => {
    if (!frequence) {
      clearTimer();
      return;
    }
    timerRef.current = setInterval(() => {
      handleSearch('timer', activeTab);
    }, frequence);
    return () => {
      clearTimer();
    };
  }, [activeTab, frequence, object, metric, conditions, instances, timeRange]);

  useEffect(() => {
    if (url_obj_name && objects.length) {
      handleObjectChange('otherWay');
    }
  }, [url_instance_id, url_obj_name, url_metric_id, objects]);

  const getObjects = async () => {
    try {
      setObjLoading(true);
      const data: ObectItem[] = await get('/monitor/api/monitor_object/', {
        params: {
          add_instance_count: true,
        },
      });
      const _treeData = getTreeData(deepClone(data));
      setTreeData(_treeData);
      setOriginalTreeData(_treeData); // 保存原始数据
      setExpandedKeys(_treeData.map((item) => item.key));
      setObjects(data);
    } finally {
      setObjLoading(false);
    }
  };

  const getMetrics = async (params = {}) => {
    try {
      setMetricsLoading(true);
      const getGroupList = get(`/monitor/api/metrics_group/`, { params });
      const getMetrics = get('/monitor/api/metrics/', { params });
      Promise.all([getGroupList, getMetrics])
        .then((res) => {
          const metricData = deepClone(res[1] || []);
          setMetrics(res[1] || []);
          const groupData = res[0].map((item: GroupInfo) => ({
            ...item,
            child: [],
          }));
          metricData.forEach((metric: MetricItem) => {
            const target = groupData.find(
              (item: GroupInfo) => item.id === metric.metric_group
            );
            if (target) {
              target.child.push(metric);
            }
          });
          const _groupData = groupData.filter(
            (item: any) => !!item.child?.length
          );
          setOriginMetricData(_groupData);
        })
        .finally(() => {
          setMetricsLoading(false);
        });
    } catch {
      setMetricsLoading(false);
    }
  };

  const getInstList = async (id: number) => {
    try {
      setInstanceLoading(true);
      const data = await get(`/monitor/api/monitor_instance/${id}/list/`, {
        params: {
          page_size: -1,
        },
      });
      setInstances(data.results || []);
    } finally {
      setInstanceLoading(false);
    }
  };

  const canSearch = () => {
    return !!metric && instanceId?.length;
  };

  const getParams = (_timeRange: number[]): SearchParams => {
    const _query: string =
      metrics.find((item) => item.name === metric)?.query || '';
    const params: SearchParams = { query: '' };
    const startTime = _timeRange.at(0);
    const endTime = _timeRange.at(1);
    if (startTime && endTime) {
      const MAX_POINTS = 100; // 最大数据点数
      const DEFAULT_STEP = 360; // 默认步长
      params.start = startTime;
      params.end = endTime;
      params.step = Math.max(
        Math.ceil(
          (params.end / MAX_POINTS - params.start / MAX_POINTS) / DEFAULT_STEP
        ),
        1
      );
    }
    let query = '';
    if (instanceId?.length) {
      switch (object) {
        case 'Pod':
          query += `uid=~"${instanceId.join('|')}"`;
          break;
        case 'Node':
          query += `node=~"${instanceId.join('|')}"`;
          break;
        default:
          query += `instance_id=~"${instanceId.join('|')}"`;
          break;
      }
    }
    if (conditions?.length) {
      const conditionQueries = conditions
        .map((condition) => {
          if (condition.label && condition.condition && condition.value) {
            return `${condition.label}${condition.condition}"${condition.value}"`;
          }
          return '';
        })
        .filter(Boolean);
      if (conditionQueries.length) {
        if (query) {
          query += ',';
        }
        query += conditionQueries.join(',');
      }
    }
    params.query = _query.replace(/__\$labels__/g, query);
    return params;
  };

  const onTimeChange = (val: number[]) => {
    setTimeRange(val);
    handleSearch('refresh', activeTab, val);
  };

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const onFrequenceChange = (val: number) => {
    setFrequence(val);
  };

  const onRefresh = () => {
    handleSearch('refresh', activeTab);
  };

  const createPolicy = () => {
    const params = new URLSearchParams({
      monitorName: object as string,
      monitorObjId: objects.find((item) => item.name === object)?.id + '',
      metricId: metric || '',
      instanceId: instanceId.join(','),
      type: 'add',
    });
    const targetUrl = `/monitor/event/strategy?${params.toString()}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleInstanceChange = (val: string[]) => {
    setInstanceId(val);
  };

  const handleMetricChange = (val: string) => {
    setMetric(val);
    const target = metrics.find((item) => item.name === val);
    const _labels = (target?.dimensions || []).map((item) => item.name);
    setLabels(_labels);
    setUnit(target?.unit || '');
  };

  const handleObjectChange = (val: string) => {
    if (val !== 'otherWay') {
      setObject(val);
      setSelectedKeys([val]);
      setMetrics([]);
      setLabels([]);
      setMetric(null);
      setInstanceId([]);
      setInstances([]);
      setConditions([]);
    }
    const value = val === 'otherWay' ? url_obj_name : val;
    if (value) {
      getMetrics({
        monitor_object_name: value,
      });
    }
    const id = objects.find((item) => item.name === value)?.id || 0;
    if (id) {
      getInstList(id);
    }
  };

  const handleLabelChange = (val: string, index: number) => {
    const _conditions = deepClone(conditions);
    _conditions[index].label = val;
    setConditions(_conditions);
  };

  const handleConditionChange = (val: string, index: number) => {
    const _conditions = deepClone(conditions);
    _conditions[index].condition = val;
    setConditions(_conditions);
  };

  const handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const _conditions = deepClone(conditions);
    _conditions[index].value = e.target.value;
    setConditions(_conditions);
  };

  const addConditionItem = () => {
    const _conditions = deepClone(conditions);
    _conditions.push({
      label: null,
      condition: null,
      value: '',
    });
    setConditions(_conditions);
  };

  const deleteConditionItem = (index: number) => {
    const _conditions = deepClone(conditions);
    _conditions.splice(index, 1);
    setConditions(_conditions);
  };

  const searchData = () => {
    handleSearch('refresh', activeTab);
  };

  const onTabChange = (val: string) => {
    setActiveTab(val);
    handleSearch('refresh', val);
  };

  const processData = (data: ChartDataItem[]): ChartData[] => {
    const result: any[] = [];
    const target =
      metrics.find((item) => item.name === metric)?.dimensions || [];
    data.forEach((item, index) => {
      item.values.forEach(([timestamp, value]) => {
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
            title:
              metrics.find((sec) => sec.name === metric)?.display_name || '--',
            [`value${index + 1}`]: parseFloat(value),
            details,
          });
        }
      });
    });
    return result;
  };

  const handleSearch = async (
    type: string,
    tab: string,
    _timeRange = timeRange
  ) => {
    if (type !== 'timer') {
      setChartData([]);
      setTableData([]);
    }
    if (!canSearch()) {
      return;
    }
    try {
      setPageLoading(type === 'refresh');
      const areaCurrent = tab === 'area';
      const url = areaCurrent
        ? '/monitor/api/metrics_instance/query_range/'
        : '/monitor/api/metrics_instance/query/';
      let params = getParams(_timeRange);
      if (!areaCurrent) {
        params = {
          time: params.end,
          query: params.query,
        };
      }
      const responseData = await get(url, {
        params,
      });
      const data = responseData.data?.result || [];
      if (areaCurrent) {
        setChartData(data);
      } else {
        const _tableData = data.map((item: any, index: number) => ({
          ...item.metric,
          value: item.value[1] ?? '--',
          index,
        }));
        const metricTarget =
          metrics.find((item) => item.name === metric)?.dimensions || [];
        const colKeys = Array.from(
          new Set(
            metricTarget
              .map((item) => item.name)
              .concat(['instance_name', 'instance_id', 'value'])
          )
        );

        const tableColumns = Object.keys(_tableData[0] || {})
          .filter((item) => colKeys.includes(item))
          .map((item) => ({
            title: item,
            dataIndex: item,
            key: item,
            width: 200,
            ellipsis: {
              showTitle: true,
            },
          }));
        const _columns = deepClone(tableColumns);
        if (_columns[0]) _columns[0].fixed = 'left';
        setColumns(_columns);
        setTableData(_tableData);
      }
    } finally {
      setPageLoading(false);
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
    handleSearch('refresh', activeTab, _times);
  };

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    const isFirstLevel = !!info.node?.children?.length;
    if (!isFirstLevel && selectedKeys?.length) {
      setSelectedKeys(selectedKeys);
      handleObjectChange(selectedKeys[0] as string);
    }
  };

  const getTreeData = (data: ObectItem[]): TreeItem[] => {
    const groupedData = data.reduce(
      (acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = {
            title: item.display_type || '--',
            key: item.type,
            children: [],
          };
        }
        acc[item.type].children.push({
          title: (item.display_name || '--') + `(${item.instance_count || 0})`,
          label: item.name || '--',
          key: item.name,
          children: [],
        });
        return acc;
      },
      {} as Record<string, TreeItem>
    );
    return Object.values(groupedData).filter((item) => item.key !== 'Other');
  };

  const filterTree = (data: TreeItem[], searchValue: string): TreeItem[] => {
    return data
      .map((item: any) => {
        const children = filterTree(item.children || [], searchValue);
        if (
          item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          children.length
        ) {
          return {
            ...item,
            children,
          };
        }
        return null;
      })
      .filter(Boolean) as TreeItem[];
  };

  const onSearchTree = (value: string) => {
    if (!value) {
      setTreeData(originalTreeData);
    } else {
      const filteredData = filterTree(originalTreeData, value);
      setTreeData(filteredData);
    }
  };

  return (
    <div className={searchStyle.searchWrapper}>
      <div className={searchStyle.time}>
        <TimeSelector
          defaultValue={timeDefaultValue}
          onChange={(value) => onTimeChange(value)}
          onFrequenceChange={onFrequenceChange}
          onRefresh={onRefresh}
        />
        <Button
          type="primary"
          className="ml-[8px]"
          disabled={!canSearch()}
          onClick={searchData}
        >
          {t('common.search')}
        </Button>
      </div>
      <div className={searchStyle.searchMain}>
        <div className={searchStyle.tree}>
          <Spin spinning={objLoading}>
            <Search
              className="mb-[10px]"
              placeholder={t('common.searchPlaceHolder')}
              value={treeSearchValue}
              enterButton
              onChange={(e) => setTreeSearchValue(e.target.value)}
              onSearch={onSearchTree}
            />
            <Tree
              showLine
              selectedKeys={selectedKeys}
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys)}
              onSelect={onSelect}
              treeData={treeData}
            />
          </Spin>
        </div>
        <div className={searchStyle.search}>
          <div className={searchStyle.criteria}>
            <Collapse
              title={t('monitor.search.searchCriteria')}
              icon={
                <Button
                  disabled={!object}
                  onClick={createPolicy}
                  type="link"
                  size="small"
                  icon={<BellOutlined />}
                />
              }
            >
              <div className={searchStyle.condition}>
                <div className={searchStyle.conditionItem}>
                  <div className={searchStyle.itemLabel}>
                    {t('monitor.source')}
                  </div>
                  <div className={`${searchStyle.itemOption}`}>
                    <Select
                      mode="multiple"
                      placeholder={t('monitor.instance')}
                      className={`w-[300px] ${searchStyle.sourceObject}`}
                      maxTagCount="responsive"
                      loading={instanceLoading}
                      value={instanceId}
                      onChange={handleInstanceChange}
                    >
                      {instances.map((item) => (
                        <Option value={item.instance_id} key={item.instance_id}>
                          {item.instance_name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className={searchStyle.conditionItem}>
                  <div className={searchStyle.itemLabel}>
                    {t('monitor.metric')}
                  </div>
                  <div className={searchStyle.itemOption}>
                    <Select
                      className="w-[300px]"
                      placeholder={t('monitor.metric')}
                      showSearch
                      value={metric}
                      loading={metricsLoading}
                      options={originMetricData.map((item) => ({
                        label: item.display_name,
                        title: item.name,
                        options: (item.child || []).map((tex) => ({
                          label: tex.display_name,
                          value: tex.name,
                        })),
                      }))}
                      onChange={handleMetricChange}
                    />
                  </div>
                </div>
                <div className={searchStyle.conditionItem}>
                  <div
                    className={`${searchStyle.itemLabel} ${searchStyle.conditionLabel}`}
                  >
                    {t('monitor.filter')}
                  </div>
                  <div className="flex">
                    {conditions.length ? (
                      <ul className={searchStyle.conditions}>
                        {conditions.map((conditionItem, index) => (
                          <li
                            className={`${searchStyle.itemOption} ${searchStyle.filter}`}
                            key={index}
                          >
                            <Select
                              className={`w-[150px] ${searchStyle.filterLabel}`}
                              placeholder={t('monitor.label')}
                              showSearch
                              value={conditionItem.label}
                              onChange={(val) => handleLabelChange(val, index)}
                            >
                              {labels.map((item) => (
                                <Option value={item} key={item}>
                                  {item}
                                </Option>
                              ))}
                            </Select>
                            <Select
                              className="w-[90px]"
                              placeholder={t('monitor.term')}
                              value={conditionItem.condition}
                              onChange={(val) =>
                                handleConditionChange(val, index)
                              }
                            >
                              {CONDITION_LIST.map((item: ListItem) => (
                                <Option value={item.id} key={item.id}>
                                  {item.name}
                                </Option>
                              ))}
                            </Select>
                            <Input
                              className="w-[150px]"
                              placeholder={t('monitor.value')}
                              value={conditionItem.value}
                              onChange={(e) => handleValueChange(e, index)}
                            ></Input>
                            <Button
                              icon={<CloseOutlined />}
                              onClick={() => deleteConditionItem(index)}
                            />
                            <Button
                              icon={<PlusOutlined />}
                              onClick={addConditionItem}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Button
                        className="mt-[10px]"
                        disabled={!metric}
                        icon={<PlusOutlined />}
                        onClick={addConditionItem}
                      />
                    )}
                  </div>
                </div>
              </div>
            </Collapse>
          </div>
          <Spin spinning={pageLoading}>
            <div className={searchStyle.chart}>
              <Segmented
                className="mb-[10px]"
                value={activeTab}
                options={[
                  {
                    label: (
                      <div className="flex items-center">
                        <Icon type="duijimianjitu" className="mr-[8px]" />
                        {t('monitor.search.area')}
                      </div>
                    ),
                    value: 'area',
                  },
                  {
                    label: (
                      <div className="flex items-center">
                        <Icon type="tabulation" className="mr-[8px]" />
                        {t('monitor.search.table')}
                      </div>
                    ),
                    value: 'table',
                  },
                ]}
                onChange={onTabChange}
              />
              {isArea ? (
                <div className={searchStyle.chartArea}>
                  {!!metric && (
                    <div className="text-[14px] mb-[10px]">
                      <span className="font-[600]">
                        {metrics.find((item) => item.name === metric)
                          ?.display_name || '--'}
                      </span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {`${
                          findUnitNameById(
                            metrics.find((item) => item.name === metric)?.unit
                          )
                            ? '（' +
                              findUnitNameById(
                                metrics.find((item) => item.name === metric)
                                  ?.unit
                              ) +
                              '）'
                            : ''
                        }`}
                      </span>
                    </div>
                  )}
                  <LineChart
                    metric={metrics.find((item) => item.name === metric)}
                    data={processData(chartData)}
                    unit={unit}
                    onXRangeChange={onXRangeChange}
                  />
                </div>
              ) : (
                <CustomTable
                  scroll={{ y: 'calc(100vh - 440px)' }}
                  columns={columns}
                  dataSource={tableData}
                  pagination={false}
                  rowKey="index"
                />
              )}
            </div>
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default SearchView;
