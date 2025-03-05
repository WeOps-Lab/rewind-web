'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Space,
  Modal,
  message,
  Spin,
  Dropdown,
  Cascader,
  TablePaginationConfig,
  CascaderProps,
  Tree,
} from 'antd';
import CustomTable from '@/components/custom-table';
import SearchFilter from './list/searchFilter';
import ImportInst from './list/importInst';
import SelectInstance from './detail/relationships/selectInstance';
import { PlusOutlined } from '@ant-design/icons';
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
import { useCommon } from '@/app/cmdb/context/common';
import type { MenuProps } from 'antd';
import { useRouter } from 'next/navigation';
import PermissionWrapper from '@/components/permission';

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
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<string[]>([]);
  const [expandedTreeKeys, setExpandedTreeKeys] = useState<string[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    total: 0,
    pageSize: 20,
  });

  const handleExport = async (keys: string[]) => {
    try {
      setExportLoading(true);
      const response = await axios({
        url: `/api/proxy/cmdb/api/instance/${modelId}/inst_export/`,
        method: 'POST',
        responseType: 'blob',
        data: keys,
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
        },
      });
      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${modelId}资产列表.xlsx`;
      document.body.appendChild(link);
      link.click();
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
    setExpandedTreeKeys(
      modelGroup.map((item) => `group:${item.classification_id}`)
    );
  }, [modelGroup]);

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

  const getModelGroup = async () => {
    try {
      const [modeldata, groupData, assoType] = await Promise.all([
        get('/cmdb/api/model/'),
        get('/cmdb/api/classification/'),
        get('/cmdb/api/model/model_association_type/'),
      ]);
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
        .filter((item: any) => item.classification_id === defaultGroupId)
        .map((item: any) => ({
          key: item.model_id,
          label: item.model_name,
          icn: item.icn,
        }));
      const defaultModelId = assetModelId || _modelList[0].key;
      setOriginModels(modeldata);
      setAssoTypes(assoType);
      setModelList(_modelList);
      setModelId(defaultModelId);
      getInitData(defaultModelId);
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
    const title = type === 'add' ? t('add') : t('edit');
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

  const treeData = modelGroup.map((group) => ({
    title: group.classification_name,
    key: `group:${group.classification_id}`,
    children: group.list.map((item) => ({
      title: item.model_name,
      key: item.model_id,
    })),
  }));

  const onSelectUnified = (selectedKeys: React.Key[]) => {
    if (!selectedKeys.length) return;
    const key = selectedKeys[0] as string;
    if (key.startsWith('group:')) {
      const groupIdSelected = key.split(':')[1];
      setGroupId(groupIdSelected);
      const group = modelGroup.find(
        (item) => item.classification_id === groupIdSelected
      );
      if (group && group.list.length) {
        const firstModelKey = group.list[0].model_id;
        setSelectedTreeKeys([firstModelKey]);
        setModelId(firstModelKey);
        const newModelList = group.list.map((item) => ({
          key: item.model_id,
          label: item.model_name,
          icn: item.icn,
        }));
        setModelList(newModelList);
        getInitData(firstModelKey);
      }
    } else {
      setSelectedTreeKeys([key]);
      setModelId(key);
      modelGroup.forEach((group) => {
        if (group.list.some((item) => item.model_id === key)) {
          setGroupId(group.classification_id);
          const newModelList = group.list.map((item) => ({
            key: item.model_id,
            label: item.model_name,
            icn: item.icn,
          }));
          setModelList(newModelList);
        }
      });
      getInitData(key);
    }
  };

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
          width: 180,
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
              <PermissionWrapper requiredPermissions={['Associate']}>
                <Button
                  type="link"
                  className="mr-[10px]"
                  onClick={() => showInstanceModal(record)}
                >
                  {t('Model.association')}
                </Button>
              </PermissionWrapper>
              <PermissionWrapper requiredPermissions={['Edit']}>
                <Button
                  type="link"
                  className="mr-[10px]"
                  onClick={() => showAttrModal('edit', record)}
                >
                  {t('edit')}
                </Button>
              </PermissionWrapper>
              <PermissionWrapper requiredPermissions={['Delete']}>
                <Button type="link" onClick={() => showDeleteConfirm(record)}>
                  {t('delete')}
                </Button>
              </PermissionWrapper>
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

  const batchOperateItems: MenuProps['items'] = [
    {
      key: 'batchEdit',
      label: (
        <PermissionWrapper requiredPermissions={['Edit']}>
          <a
            onClick={() => {
              showAttrModal('batchEdit');
            }}
          >
            {t('batchEdit')}
          </a>
        </PermissionWrapper>
      ),
      disabled: !selectedRowKeys.length,
    },
    {
      key: 'batchDelete',
      label: (
        <PermissionWrapper requiredPermissions={['Delete']}>
          <a onClick={batchDeleteConfirm}>{t('batchDelete')}</a>
        </PermissionWrapper>
      ),
      disabled: !selectedRowKeys.length,
    },
  ];

  return (
    <Spin spinning={loading} wrapperClassName={assetDataStyle.assetLoading}>
      <div className={assetDataStyle.assetData}>
        <div className={`${assetDataStyle.groupSelector}`}>
          <Tree
            showLine
            selectedKeys={selectedTreeKeys}
            expandedKeys={expandedTreeKeys}
            onExpand={(keys) => setExpandedTreeKeys(keys as string[])}
            onSelect={onSelectUnified}
            treeData={treeData}
          />
        </div>
        <div className={assetDataStyle.assetList}>
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
              <PermissionWrapper requiredPermissions={['Add']}>
                <Dropdown
                  menu={{ items: addInstItems }}
                  placement="bottom"
                  arrow
                >
                  <Button icon={<PlusOutlined />} type="primary">
                    {t('add')}
                  </Button>
                </Dropdown>
              </PermissionWrapper>
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
            size="middle"
            rowSelection={rowSelection}
            dataSource={tableData}
            columns={currentColumns}
            pagination={pagination}
            loading={tableLoading}
            scroll={{ x: 'calc(100vw - 400px)', y: 'calc(100vh - 400px)' }}
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
  );
};

export default AssetData;
