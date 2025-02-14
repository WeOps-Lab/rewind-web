'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Space,
  Modal,
  Radio,
  Tabs,
  message,
  Spin,
  Dropdown,
  Cascader,
  TablePaginationConfig,
  CascaderProps,
} from 'antd';
import CustomTable from '@/components/custom-table';
import SearchFilter from './list/searchFilter';
import ImportInst from './list/importInst';
import SelectInstance from './detail/relationships/selectInstance';
import { PlusOutlined } from '@ant-design/icons';
import type { RadioChangeEvent } from 'antd';
import { useSearchParams } from 'next/navigation';
import assetDataStyle from './index.module.scss';
import FieldModal from './list/fieldModal';
import { useTranslation } from '@/utils/i18n';
import useApiClient from '@/utils/request';
const { confirm } = Modal;
import { deepClone, getAssetColumns } from '@/app/cmdb/utils/common';
import {
  GroupItem,
  ModelItem,
  ColumnItem,
  UserItem,
  Organization,
  AttrFieldType,
  RelationInstanceRef,
  AssoTypeItem,
} from '@/app/cmdb/types/assetManage';
import axios from 'axios';
import { useAuth } from '@/context/auth';
import CommonProvider, { useCommon } from '@/app/cmdb/context/common';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/navigation';

interface ModelTabs {
  key: string;
  label: string;
  icn: string;
}
interface FieldRef {
  showModal: (config: FieldConfig) => void;
}
interface ImportRef {
  showModal: (config: {
    subTitle: string;
    title: string;
    model_id: string;
  }) => void;
}
interface FieldConfig {
  type: string;
  attrList: AttrFieldType[];
  formInfo: any;
  subTitle: string;
  title: string;
  model_id: string;
  list: Array<any>;
}

const AssetData = () => {
  const { t } = useTranslation();
  const { get, del, post, isLoading } = useApiClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assetModelId: string = searchParams.get('modelId') || '';
  const assetClassificationId: string =
    searchParams.get('classificationId') || '';
  const commonContext = useCommon();
  const authContext = useAuth();
  const token = authContext?.token || null;
  const tokenRef = useRef(token);
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList: Organization[] = authList.current;
  const users = useRef(commonContext?.userList || []);
  const userList: UserItem[] = users.current;
  const fieldRef = useRef<FieldRef>(null);
  const importRef = useRef<ImportRef>(null);
  const instanceRef = useRef<RelationInstanceRef>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<any>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [modelGroup, setModelGroup] = useState<GroupItem[]>([]);
  const [originModels, setOriginModels] = useState<ModelItem[]>([]);
  const [groupId, setGroupId] = useState<string>('');
  const [modelId, setModelId] = useState<string>('');
  const [modelList, setModelList] = useState<ModelTabs[]>([]);
  const [propertyList, setPropertyList] = useState<AttrFieldType[]>([]);
  const [displayFieldKeys, setDisplayFieldKeys] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnItem[]>([]);
  const [currentColumns, setCurrentColumns] = useState<ColumnItem[]>([]);
  const [assoTypes, setAssoTypes] = useState<AssoTypeItem[]>([]);
  const [queryList, setQueryList] = useState<unknown>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [organization, setOrganization] = useState<string[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    total: 0,
    pageSize: 20,
  });

  const handleExport = async (keys: string[]) => {
    try {
      setExportLoading(true);
      const response = await axios({
        url: `/reqApi/api/instance/${modelId}/inst_export/`, // 替换为你的导出数据的API端点
        method: 'POST',
        responseType: 'blob', // 确保响应类型为blob
        data: keys,
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
        },
      });
      // 创建一个Blob对象
      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });
      // 创建一个下载链接
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${modelId}资产列表.xlsx`; // 设置下载文件的名称
      document.body.appendChild(link);
      link.click();
      // 移除下载链接
      document.body.removeChild(link);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setExportLoading(false);
    }
  };

  const showImportModal = () => {
    importRef.current?.showModal({
      title: t('import'),
      subTitle: '',
      model_id: modelId,
    });
  };

  const addInstItems: MenuProps['items'] = [
    {
      key: '1',
      label: <a onClick={() => showAttrModal('add')}>{t('add')}</a>,
    },
    {
      key: '2',
      label: <a onClick={showImportModal}>{t('import')}</a>,
    },
  ];

  useEffect(() => {
    if (isLoading) return;
    getModelGroup();
  }, [get, isLoading]);

  useEffect(() => {
    if (modelId) {
      fetchData();
    }
  }, [pagination?.current, pagination?.pageSize, queryList, organization]);

  useEffect(() => {
    if (propertyList.length) {
      const attrList = getAssetColumns({
        attrList: propertyList,
        userList,
        groupList: organizationList,
        t,
      });
      const tableColumns = [
        ...attrList,
        {
          title: t('action'),
          key: 'action',
          dataIndex: 'action',
          width: 240,
          fixed: 'right',
          render: (_: unknown, record: any) => (
            <>
              <Button
                type="link"
                className="mr-[10px]"
                onClick={() => checkDetail(record)}
              >
                {t('detail')}
              </Button>
              <Button
                type="link"
                className="mr-[10px]"
                onClick={() => showInstanceModal(record)}
              >
                {t('Model.association')}
              </Button>
              <Button
                type="link"
                className="mr-[10px]"
                onClick={() => showAttrModal('edit', record)}
              >
                {t('edit')}
              </Button>
              <Button type="link" onClick={() => showDeleteConfirm(record)}>
                {t('delete')}
              </Button>
            </>
          ),
        },
      ];
      setColumns(tableColumns);
      setCurrentColumns(
        tableColumns.filter(
          (item) => displayFieldKeys.includes(item.key) || item.key === 'action'
        )
      );
    }
  }, [propertyList, displayFieldKeys]);

  const fetchData = async () => {
    setTableLoading(true);
    const params = getTableParams();
    try {
      const data = await post(`/cmdb/api/instance/search/`, params);
      setTableData(data.insts);
      pagination.total = data.count;
      setPagination(pagination);
    } catch (error) {
      console.log(error);
    } finally {
      setTableLoading(false);
    }
  };

  const getModelGroup = () => {
    const getCroupList = get('/cmdb/api/classification/');
    const getModelList = get('/cmdb/api/model/');
    const getAssoType = get('/cmdb/api/model/model_association_type/');
    setLoading(true);
    try {
      Promise.all([getModelList, getCroupList, getAssoType])
        .then((res) => {
          const modeldata: ModelItem[] = res[0];
          const groupData: GroupItem[] = res[1];
          const groups = deepClone(groupData).map((item: GroupItem) => ({
            ...item,
            list: [],
            count: 0,
          }));
          modeldata.forEach((modelItem: ModelItem) => {
            const target = groups.find(
              (item: GroupItem) =>
                item.classification_id === modelItem.classification_id
            );
            if (target) {
              target.list.push(modelItem);
              target.count++;
            }
          });
          const defaultGroupId =
            assetClassificationId || groupData[0].classification_id;
          setGroupId(defaultGroupId);
          setModelGroup(groups);
          const _modelList = modeldata
            .filter((item) => item.classification_id === defaultGroupId)
            .map((item) => ({
              key: item.model_id,
              label: item.model_name,
              icn: item.icn,
            }));
          const defaultModelId = assetModelId || _modelList[0].key;
          setOriginModels(res[0]);
          setAssoTypes(res[2]);
          setModelList(_modelList);
          setModelId(defaultModelId);
          getInitData(defaultModelId);
        })
        .catch(() => {
          setLoading(false);
        });
    } catch {
      setLoading(false);
    }
  };

  const getTableParams = () => {
    const conditions = organization?.length
      ? [{ field: 'organization', type: 'list[]', value: organization }]
      : [];
    return {
      query_list: queryList ? [queryList, ...conditions] : conditions,
      page: pagination.current,
      page_size: pagination.pageSize,
      order: '',
      model_id: modelId,
      role: '',
    };
  };

  const getInitData = (id: string) => {
    const tableParmas = getTableParams();
    const getAttrList = get(`/cmdb/api/model/${id}/attr_list/`);
    const getInstList = post('/cmdb/api/instance/search/', {
      ...tableParmas,
      model_id: id,
    });
    const getDisplayFields = get(`/cmdb/api/instance/${id}/show_field/detail/`);
    setLoading(true);
    try {
      Promise.all([getAttrList, getInstList, getDisplayFields])
        .then((res) => {
          pagination.total = res[1].count;
          const tableList = res[1].insts;
          const fieldKeys =
            res[2]?.show_fields ||
            res[0].map((item: AttrFieldType) => item.attr_id);
          setDisplayFieldKeys(fieldKeys);
          setPropertyList(res[0]);
          setTableData(tableList);
          setPagination(pagination);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch {
      setLoading(false);
    }
  };

  const onSelectChange = (selectedKeys: any) => {
    setSelectedRowKeys(selectedKeys);
  };

  const onChangeModel = (key: string) => {
    setModelId(key);
    getInitData(key);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onSelectFields = async (fields: string[]) => {
    setLoading(true);
    try {
      await post(`/cmdb/api/instance/${modelId}/show_field/settings/`, fields);
      message.success(t('successfulSetted'));
      getInitData(modelId);
    } finally {
      setLoading(false);
    }
  };

  const onGroupChange = (e: RadioChangeEvent) => {
    const currentGroupId = e.target.value;
    setGroupId(currentGroupId);
    const currentModelList = (
      modelGroup.find((item) => item.classification_id === currentGroupId)
        ?.list || []
    ).map((item) => ({
      key: item.model_id,
      label: item.model_name,
      icn: item.icn,
    }));
    const currentModelId = currentModelList[0].key;
    setModelList(currentModelList);
    setModelId(currentModelId);
    getInitData(currentModelId);
  };

  const showDeleteConfirm = (row = { _id: '' }) => {
    confirm({
      title: t('deleteTitle'),
      content: t('deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/cmdb/api/instance/${row._id}/`);
            message.success(t('successfullyDeleted'));
            if (pagination?.current) {
              pagination.current > 1 &&
                tableData.length === 1 &&
                pagination.current--;
            }
            setSelectedRowKeys([]);
            fetchData();
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const batchDeleteConfirm = () => {
    confirm({
      title: t('deleteTitle'),
      content: t('deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            const list = selectedRowKeys;
            await post('/cmdb/api/instance/batch_delete/', list);
            message.success(t('successfullyDeleted'));
            if (pagination?.current) {
              pagination.current > 1 &&
                tableData.length === 1 &&
                pagination.current--;
            }
            setSelectedRowKeys([]);
            fetchData();
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const batchOperateItems: MenuProps['items'] = [
    {
      key: 'batchEdit',
      label: (
        <a
          onClick={() => {
            showAttrModal('batchEdit');
          }}
        >
          {t('batchEdit')}
        </a>
      ),
      disabled: !selectedRowKeys.length,
    },
    {
      key: 'batchDelete',
      label: <a onClick={batchDeleteConfirm}>{t('batchDelete')}</a>,
      disabled: !selectedRowKeys.length,
    },
  ];

  const exportItems: MenuProps['items'] = [
    {
      key: 'batchExport',
      label: (
        <a onClick={() => handleExport(selectedRowKeys)}>{t('selected')}</a>
      ),
      disabled: !selectedRowKeys.length,
    },
    {
      key: 'exportCurrentPage',
      label: (
        <a onClick={() => handleExport(tableData.map((item) => item._id))}>
          {t('currentPage')}
        </a>
      ),
    },
    {
      key: 'exportAll',
      label: <a onClick={() => handleExport([])}>{t('all')}</a>,
    },
  ];

  const updateFieldList = (id?: string) => {
    fetchData();
    if (id) {
      showInstanceModal({
        _id: id,
      });
    }
  };

  const showAttrModal = (type: string, row = {}) => {
    const title = type === 'add' ? 'Add' : 'Edit';
    fieldRef.current?.showModal({
      title,
      type,
      attrList: propertyList,
      formInfo: row,
      subTitle: '',
      model_id: modelId,
      list: selectedRowKeys,
    });
  };

  const handleTableChange = (pagination = {}) => {
    setPagination(pagination);
  };

  const handleSearch = (condition: unknown) => {
    setQueryList(condition);
  };

  const checkDetail = (row = { _id: '', inst_name: '' }) => {
    const modelItem = modelList.find((item) => item.key === modelId);
    router.push(
      `/cmdb/assetData/detail/baseInfo?icn=${modelItem?.icn || ''}&model_name=${
        modelItem?.label || ''
      }&model_id=${modelId}&classification_id=${groupId}&inst_id=${
        row._id
      }&inst_name=${row.inst_name}`
    );
  };

  const selectOrganization: CascaderProps<Organization>['onChange'] = (
    value
  ) => {
    setOrganization(value);
  };

  const showInstanceModal = (row = { _id: '' }) => {
    instanceRef.current?.showModal({
      title: t('Model.association'),
      model_id: modelId,
      list: [],
      instId: row._id,
    });
  };

  return (
    <CommonProvider>
      <Spin spinning={loading} wrapperClassName={assetDataStyle.assetLoading}>
        <div className={assetDataStyle.assetData}>
          <div className={`mb-[20px] ${assetDataStyle.groupSelector}`}>
            <Radio.Group
              onChange={onGroupChange}
              value={groupId}
              buttonStyle="solid"
            >
              {modelGroup.map((item) => (
                <Radio.Button
                  key={item.classification_id}
                  value={item.classification_id}
                >
                  {item.classification_name}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>
          <div className={assetDataStyle.assetList}>
            <Tabs
              activeKey={modelId}
              items={modelList}
              onChange={onChangeModel}
            />
            <div className="flex justify-between mb-4">
              <Space>
                <Cascader
                  placeholder={t('Model.selectOrganazationPlaceholder')}
                  options={organizationList}
                  value={organization}
                  onChange={selectOrganization}
                />
                <SearchFilter
                  userList={userList}
                  attrList={propertyList.filter(
                    (item) => item.attr_type !== 'organization'
                  )}
                  organizationList={organizationList}
                  onSearch={handleSearch}
                />
              </Space>
              <Space>
                <Dropdown menu={{ items: addInstItems }} placement="bottom" arrow>
                  <Button icon={<PlusOutlined />} type="primary">
                    {t('add')}
                  </Button>
                </Dropdown>
                <Dropdown
                  menu={{ items: exportItems }}
                  disabled={exportLoading}
                  placement="bottom"
                  arrow
                >
                  <Button>{t('export')}</Button>
                </Dropdown>
                <Dropdown
                  menu={{ items: batchOperateItems }}
                  disabled={!selectedRowKeys.length}
                  placement="bottom"
                  arrow
                >
                  <Button>{t('more')}</Button>
                </Dropdown>
              </Space>
            </div>
            <CustomTable
              rowSelection={rowSelection}
              dataSource={tableData}
              columns={currentColumns}
              pagination={pagination}
              loading={tableLoading}
              scroll={{ x: 'calc(100vw - 100px)', y: 'calc(100vh - 370px)' }}
              fieldSetting={{
                showSetting: true,
                displayFieldKeys,
                choosableFields: columns.filter((item) => item.key !== 'action'),
              }}
              onSelectFields={onSelectFields}
              rowKey="_id"
              onChange={handleTableChange}
            />
            <FieldModal
              ref={fieldRef}
              userList={userList}
              organizationList={organizationList}
              onSuccess={updateFieldList}
            />
            <ImportInst ref={importRef} onSuccess={updateFieldList} />
            <SelectInstance
              ref={instanceRef}
              userList={userList}
              models={originModels}
              assoTypes={assoTypes}
              organizationList={organizationList}
              needFetchAssoInstIds
            />
          </div>
        </div>
      </Spin>
    </CommonProvider>
  );
};

export default AssetData;
