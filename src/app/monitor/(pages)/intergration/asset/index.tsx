'use client';
import React, { useEffect, useState, useRef } from 'react';
import {
  Spin,
  Input,
  Button,
  Tree,
  Modal,
  message,
  Tooltip,
  Dropdown,
  Tag,
} from 'antd';
import useApiClient from '@/utils/request';
import assetStyle from './index.module.scss';
import { useTranslation } from '@/utils/i18n';
import {
  ColumnItem,
  TreeItem,
  ModalRef,
  Organization,
  Pagination,
  TableDataItem,
} from '@/app/monitor/types';
import {
  ObectItem,
  RuleInfo,
  ObjectInstItem,
} from '@/app/monitor/types/monitor';
import CustomTable from '@/components/custom-table';
import { PlusOutlined } from '@ant-design/icons';
import Icon from '@/components/icon';
import RuleModal from './ruleModal';
const { Search } = Input;
import { useCommon } from '@/app/monitor/context/common';
import { deepClone, showGroupName } from '@/app/monitor/utils/common';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import CustomCascader from '@/components/custom-cascader';
import EditConfig from './editConfig';
import {
  OBJECT_COLLECT_TYPE_MAP,
  NODE_STATUS_MAP,
} from '@/app/monitor/constants/monitor';
const { confirm } = Modal;

const Asset = () => {
  const { get, post, del, isLoading } = useApiClient();
  const { t } = useTranslation();
  const commonContext = useCommon();
  const { convertToLocalizedTime } = useLocalizedTime();
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList: Organization[] = authList.current;
  const ruleRef = useRef<ModalRef>(null);
  const configRef = useRef<ModalRef>(null);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [ruleLoading, setRuleLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [ruleList, setRuleList] = useState<RuleInfo[]>([]);
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>(
    []
  );
  const [objects, setObjects] = useState<ObectItem[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

  const columns: ColumnItem[] = [
    {
      title: t('common.name'),
      dataIndex: 'instance_name',
      key: 'instance_name',
      width: 200,
    },
    {
      title: t('monitor.group'),
      dataIndex: 'organization',
      key: 'organization',
      width: 200,
      render: (_, { organization }) => (
        <>{showGroupName(organization, organizationList)}</>
      ),
    },
    {
      title: t('common.action'),
      key: 'action',
      dataIndex: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => checkDetail(record)}>
            {t('common.detail')}
          </Button>
          <Button type="link" disabled className="ml-[10px]">
            {t('common.remove')}
          </Button>
        </>
      ),
    },
  ];

  const childColumns: ColumnItem[] = [
    {
      title: t('monitor.intergrations.collectionMethod'),
      dataIndex: 'collect_type',
      key: 'collect_type',
      width: 150,
      render: (_, record) => <>{record.collect_type || '--'}</>,
    },
    {
      title: t('monitor.intergrations.collectionNode'),
      dataIndex: 'agent_id',
      key: 'agent_id',
      width: 150,
      render: (_, record) => <>{record.agent_id || '--'}</>,
    },
    {
      title: t('monitor.intergrations.reportingStatus'),
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (_, { status, time }) =>
        time ? (
          <Tag color={NODE_STATUS_MAP[status] || 'gray'}>
            {getStatusByTimestamp(time)}
          </Tag>
        ) : (
          <>--</>
        ),
    },
    {
      title: t('monitor.intergrations.lastReportTime'),
      dataIndex: 'time',
      key: 'time',
      width: 160,
      render: (_, { time }) => (
        <>{time ? convertToLocalizedTime(new Date(time * 1000) + '') : '--'}</>
      ),
    },
    {
      title: t('monitor.intergrations.installationMethod'),
      dataIndex: 'config_id',
      key: 'config_id',
      width: 170,
      render: (_, record) => (
        <>
          {record.config_id
            ? t('monitor.intergrations.automatic')
            : t('monitor.intergrations.manual')}
        </>
      ),
    },
    {
      title: t('common.action'),
      key: 'action',
      dataIndex: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <>
          <Button
            type="link"
            disabled={!record.config_id}
            onClick={() => openConfigModal(record)}
          >
            {t('monitor.intergrations.updateConfigration')}
          </Button>
        </>
      ),
    },
  ];

  useEffect(() => {
    if (!isLoading) {
      getObjects();
    }
  }, [isLoading]);

  useEffect(() => {
    if (selectedKeys.length) {
      getAssetInsts(selectedKeys[0]);
    }
  }, [pagination.current, pagination.pageSize, selectedOrganizations]);

  const getStatusByTimestamp = (timestamp: number): string => {
    const now = Date.now(); // 当前时间戳
    const diff = now - timestamp * 1000; // 差值，单位为毫秒
    const fiveMinutes = 5 * 60 * 1000; // 5分钟，单位为毫秒
    const oneHour = 60 * 60 * 1000; // 1小时，单位为毫秒
    if (diff <= fiveMinutes) {
      return 'normal';
    } else if (diff > fiveMinutes && diff <= oneHour) {
      return 'inactive';
    } else {
      return 'unavailable';
    }
  };

  const openRuleModal = (type: string, row = {}) => {
    const title: string = t(
      type === 'add'
        ? 'monitor.intergrations.addRule'
        : 'monitor.intergrations.editRule'
    );
    ruleRef.current?.showModal({
      title,
      type,
      form: row,
    });
  };

  const openConfigModal = (row = {}) => {
    configRef.current?.showModal({
      title: t('monitor.intergrations.updateConfigration'),
      type: 'edit',
      form: row,
    });
  };

  const checkDetail = (row: ObjectInstItem) => {
    const _row = deepClone(row);
    const _objId = selectedKeys[0];
    _row.monitorObjId = _objId;
    _row.name = objects.find((item) => item.id === _objId)?.name || '';
    const queryString = new URLSearchParams(_row).toString();
    const url = `/monitor/view/detail/overview?${queryString}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTableChange = (pagination: any) => {
    setPagination(pagination);
  };

  const getAssetInsts = async (objectId: React.Key, type?: string) => {
    try {
      setTableLoading(true);
      setExpandedRowKeys([]);
      const data = await get(
        `/monitor/api/monitor_instance/${objectId}/list/`,
        {
          params: {
            page: pagination.current,
            page_size: pagination.pageSize,
            name: type === 'clear' ? '' : searchText,
            organizations: selectedOrganizations.join(','),
          },
        }
      );
      setTableData(data?.results || []);
      setPagination((prev: Pagination) => ({
        ...prev,
        total: data?.count || 0,
      }));
    } finally {
      setTableLoading(false);
    }
  };

  const getRuleList = async (objectId: React.Key) => {
    try {
      setRuleLoading(true);
      const data = await get(`/monitor/api/monitor_instance_group_rule/`, {
        params: {
          monitor_object_id: objectId,
        },
      });
      setRuleList(data || []);
    } finally {
      setRuleLoading(false);
    }
  };

  const getObjects = async (text?: string) => {
    try {
      setPageLoading(true);
      const data = await get(`/monitor/api/monitor_object/`, {
        params: {
          name: text || '',
          add_instance_count: true,
        },
      });
      setObjects(data);
      const _treeData = getTreeData(deepClone(data));
      setTreeData(_treeData);
      setExpandedKeys(_treeData.map((item) => item.key));
      const defaultChildren = _treeData[0]?.children;
      if (defaultChildren?.length) {
        const key = defaultChildren[0].key;
        setSelectedKeys([key]);
        getAssetInsts(key);
        getRuleList(key);
      }
    } finally {
      setPageLoading(false);
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
          title: `${item.display_name || '--'}(${item.instance_count ?? 0})`,
          key: item.id,
          children: [],
        });
        return acc;
      },
      {} as Record<string, TreeItem>
    );
    return Object.values(groupedData);
  };

  const onSelect = (selectedKeys: React.Key[], info: any) => {
    const isFirstLevel = !!info.node?.children?.length;
    if (!isFirstLevel && selectedKeys?.length) {
      setPagination((prev: Pagination) => ({
        ...prev,
        current: 1,
      }));
      setTableData([]);
      setSelectedKeys(selectedKeys);
      getAssetInsts(selectedKeys[0]);
      getRuleList(selectedKeys[0]);
    }
  };

  const onSearchTree = (value: string) => {
    getObjects(value);
  };

  const operateRule = () => {
    getRuleList(selectedKeys[0]);
  };

  const showDeleteConfirm = (row: RuleInfo) => {
    confirm({
      title: t('common.deleteTitle'),
      content: t('common.deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/monitor/api/monitor_instance_group_rule/${row.id}/`);
            message.success(t('common.successfullyDeleted'));
            getRuleList(selectedKeys[0]);
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const clearText = () => {
    setSearchText('');
    getAssetInsts(selectedKeys[0], 'clear');
  };

  const expandRow = async (expanded: boolean, row: any) => {
    const _dataSource = deepClone(tableData);
    const targetIndex = _dataSource.findIndex(
      (item: any) => item.instance_id === row.instance_id
    );
    try {
      if (targetIndex != -1 && expanded) {
        _dataSource[targetIndex].loading = true;
        setTableData(_dataSource);
        const res = await post(
          `/monitor/api/node_mgmt/get_instance_child_config/`,
          {
            instance_id: row.instance_id,
            instance_type:
              OBJECT_COLLECT_TYPE_MAP[
                objects.find((item) => item.id === selectedKeys[0])?.name || ''
              ],
          }
        );
        _dataSource[targetIndex].dataSource = res.map(
          (item: TableDataItem, index: number) => ({
            ...item,
            id: index,
          })
        );
        setTableData([..._dataSource]);
      }
    } finally {
      _dataSource[targetIndex].loading = false;
      setTableData([..._dataSource]);
    }
  };

  return (
    <Spin spinning={pageLoading}>
      <div className={assetStyle.asset}>
        <div className={assetStyle.tree}>
          <Search
            className="mb-[10px]"
            placeholder={t('common.searchPlaceHolder')}
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
        </div>
        <Spin spinning={pageLoading}>
          <div className={assetStyle.table}>
            <div className={assetStyle.search}>
              <CustomCascader
                className="mr-[8px] w-[250px]"
                showSearch
                maxTagCount="responsive"
                multiple
                allowClear
                options={organizationList}
                onChange={(value) =>
                  setSelectedOrganizations(value as string[])
                }
              />
              <Input
                allowClear
                className="w-[320px]"
                placeholder={t('common.searchPlaceHolder')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={() => getAssetInsts(selectedKeys[0])}
                onClear={clearText}
              ></Input>
            </div>
            <CustomTable
              scroll={{ y: 'calc(100vh - 320px)', x: 'calc(100vh - 500px)' }}
              columns={columns}
              dataSource={tableData}
              pagination={pagination}
              loading={tableLoading}
              expandable={{
                expandedRowRender: (record) => (
                  <CustomTable
                    scroll={{ x: 'calc(100vh - 500px)' }}
                    loading={record.loading}
                    rowKey="id"
                    dataSource={record.dataSource || []}
                    columns={childColumns}
                  />
                ),
                onExpand: (expanded, record) => {
                  expandRow(expanded, record);
                },
                expandedRowKeys: expandedRowKeys,
                onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as any),
              }}
              rowKey="instance_id"
              onChange={handleTableChange}
            ></CustomTable>
          </div>
        </Spin>
        <Spin spinning={ruleLoading}>
          <div className={assetStyle.rule}>
            <div className={`${assetStyle.ruleTips} relative`}>
              {t('monitor.intergrations.rule')}
              <Tooltip
                placement="top"
                title={t('monitor.intergrations.ruleTips')}
              >
                <div
                  className="absolute cursor-pointer"
                  style={{
                    top: '-3px',
                    right: '4px',
                  }}
                >
                  <Icon
                    type="a-shuoming2"
                    className="text-[14px] text-[var(--color-text-3)]"
                  />
                </div>
              </Tooltip>
            </div>
            <ul className={assetStyle.ruleList}>
              <li
                className={`${assetStyle.ruleItem} ${assetStyle.add} shadow-sm rounded-sm`}
                onClick={() => openRuleModal('add')}
              >
                <PlusOutlined />
              </li>
              {ruleList.map((item) => (
                <li
                  key={item.id}
                  className={`${assetStyle.ruleItem} shadow-sm rounded-sm`}
                >
                  <div className={assetStyle.editItem}>
                    <Icon
                      className={assetStyle.icon}
                      type={
                        item.type === 'condition'
                          ? 'shaixuantiaojian'
                          : 'xuanze'
                      }
                    />
                    <span>{item.name}</span>
                    <div className={assetStyle.operate}>
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: 'edit',
                              label: (
                                <a
                                  className="text-[12px]"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => openRuleModal('edit', item)}
                                >
                                  {t('common.edit')}
                                </a>
                              ),
                            },
                            {
                              key: 'delete',
                              label: (
                                <a
                                  className="text-[12px]"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => showDeleteConfirm(item)}
                                >
                                  {t('common.delete')}
                                </a>
                              ),
                            },
                          ],
                        }}
                      >
                        <div>
                          <Icon
                            className={assetStyle.moreIcon}
                            type="sangedian-copy"
                          />
                        </div>
                      </Dropdown>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Spin>
        <RuleModal
          ref={ruleRef}
          monitorObject={selectedKeys[0]}
          groupList={organizationList}
          onSuccess={operateRule}
        />
        <EditConfig
          ref={configRef}
          onSuccess={() => getAssetInsts(selectedKeys[0])}
        />
      </div>
    </Spin>
  );
};

export default Asset;
