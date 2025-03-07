'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Spin, Input, Button, Tag, message } from 'antd';
import useApiClient from '@/utils/request';
import intergrationStyle from './index.module.scss';
import { SettingOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';
import { deepClone } from '@/app/monitor/utils/common';
import { useRouter } from 'next/navigation';
import { ObectItem, TreeSortData } from '@/app/monitor/types/monitor';
import {
  OBJECT_ICON_MAP,
  COLLECT_TYPE_MAP,
} from '@/app/monitor/constants/monitor';
import { ModalRef, TableDataItem, TreeItem } from '@/app/monitor/types';
import ImportModal from './importModal';
import axios from 'axios';
import { useAuth } from '@/context/auth';
import TreeSelector from '@/app/monitor/components/treeSelector';
import { useSearchParams } from 'next/navigation';
import Permission from '@/components/permission';

const Intergration = () => {
  const { get, post, isLoading } = useApiClient();
  const { t } = useTranslation();
  const router = useRouter();
  const importRef = useRef<ModalRef>(null);
  const authContext = useAuth();
  const token = authContext?.token || null;
  const tokenRef = useRef(token);
  const searchParams = useSearchParams();
  const objId = searchParams.get('objId') || '';
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [exportDisabled, setExportDisabled] = useState<boolean>(true);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<ObectItem | null>(null);
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [objects, setObjects] = useState<ObectItem[]>([]);
  const [pluginList, setPluginList] = useState<ObectItem[]>([]);
  const [treeLoading, setTreeLoading] = useState<boolean>(false);
  const [objectId, setObjectId] = useState<React.Key>('');
  const [defaultSelectObj, setDefaultSelectObj] = useState<React.Key>('');

  useEffect(() => {
    if (isLoading) return;
    getObjects();
  }, [isLoading]);

  const handleNodeDrag = async (data: TreeSortData[]) => {
    try {
      setTreeLoading(true);
      await post(`/monitor/api/monitor_object/order/`, data);
      message.success(t('common.updateSuccess'));
      getObjects();
    } catch {
      setTreeLoading(false);
    }
  };

  const handleObjectChange = async (id: string) => {
    setObjectId(id);
    getPluginList({
      monitor_object_id: id,
    });
  };

  const getObjectInfo = (): Record<string, string> => {
    const target: any = objects.find((item) => item.id === objectId);
    return target || {};
  };

  const getPluginList = async (params = {}) => {
    setSelectedApp(null);
    setExportDisabled(true);
    setPageLoading(true);
    try {
      const data = await get('/monitor/api/monitor_plugin/', {
        params,
      });
      setPluginList(data);
    } finally {
      setPageLoading(false);
    }
  };

  const getObjects = async () => {
    try {
      setTreeLoading(true);
      const data: ObectItem[] = await get('/monitor/api/monitor_object/');
      const _treeData = getTreeData(deepClone(data));
      setTreeData(_treeData);
      setObjects(data);
      const defaultId = +objId || data[0]?.id;
      setDefaultSelectObj(defaultId);
    } finally {
      setTreeLoading(false);
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
        if (!['Pod', 'Node', 'Docker Container'].includes(item.name)) {
          acc[item.type].children.push({
            title: item.display_name || '--',
            label: item.name || '--',
            key: item.id,
            children: [],
          });
        }
        return acc;
      },
      {} as Record<string, TreeItem>
    );
    return Object.values(groupedData);
  };

  const exportMetric = async () => {
    if (!selectedApp) return;
    try {
      setExportLoading(true);
      const response = await axios({
        url: `/api/proxy/monitor/api/monitor_plugin/export/${selectedApp.id}/`, // 替换为你的导出数据的API端点
        method: 'GET',
        responseType: 'blob', // 确保响应类型为blob
        headers: {
          Authorization: `Bearer ${tokenRef.current}`,
        },
      });
      const text = await response.data.text();
      const json = JSON.parse(text);
      // 将data对象转换为JSON字符串并创建Blob对象
      const blob = new Blob([JSON.stringify(json.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedApp.display_name}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success(t('common.successfullyExported'));
    } catch (error) {
      message.error(error as string);
    } finally {
      setExportLoading(false);
    }
  };

  const onSearchTxtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const onTxtPressEnter = () => {
    const params = {
      monitor_object_id: objectId,
      name: searchText,
    };
    getPluginList(params);
  };

  const onTxtClear = () => {
    setSearchText('');
    getPluginList({
      monitor_object_id: objectId,
      name: '',
    });
  };

  const openImportModal = () => {
    importRef.current?.showModal({
      title: t('common.import'),
      type: 'add',
      form: {},
    });
  };

  const linkToDetial = (app: ObectItem) => {
    const row: TableDataItem = {
      ...getObjectInfo(),
      plugin_name: app?.display_name,
      plugin_id: app?.id,
      collect_type: app?.name,
      plugin_description: app?.display_description || '--',
    };
    const params = new URLSearchParams(row);
    const targetUrl = `/monitor/intergration/list/detail/configure?${params.toString()}`;
    router.push(targetUrl);
  };

  const onAppClick = (app: ObectItem) => {
    setSelectedApp(app);
    setExportDisabled(false); // Enable the export button
  };

  return (
    <div className={intergrationStyle.intergration}>
      <div className={intergrationStyle.tree}>
        <TreeSelector
          data={treeData}
          defaultSelectedKey={defaultSelectObj as string}
          loading={treeLoading}
          draggable
          onNodeSelect={handleObjectChange}
          onNodeDrag={handleNodeDrag}
        />
      </div>
      <div className={intergrationStyle.cards}>
        <div className="flex">
          <Input
            className="mb-[20px] w-[400px]"
            placeholder={t('common.searchPlaceHolder')}
            value={searchText}
            allowClear
            onChange={onSearchTxtChange}
            onPressEnter={onTxtPressEnter}
            onClear={onTxtClear}
          />
          <div>
            <Button
              className="mx-[8px]"
              type="primary"
              onClick={openImportModal}
            >
              {t('common.import')}
            </Button>
            <Button
              disabled={exportDisabled}
              loading={exportLoading}
              onClick={exportMetric}
            >
              {t('common.export')}
            </Button>
          </div>
        </div>
        <Spin spinning={pageLoading}>
          <div
            className={`flex flex-wrap w-full ${intergrationStyle.intergrationList}`}
          >
            {pluginList.map((app) => (
              <div
                key={app.id}
                className="w-full sm:w-1/4 p-2 min-w-[400px]"
                onClick={() => onAppClick(app)}
              >
                <div
                  className={`bg-[var(--color-bg-1)] shadow-sm hover:shadow-md transition-shadow duration-300 ease-in-out rounded-lg p-4 relative cursor-pointer group ${
                    selectedApp?.id === app.id
                      ? 'border-2 border-blue-300'
                      : 'border'
                  }`}
                >
                  <div className="flex items-center space-x-4 my-2">
                    <Icon
                      type={
                        OBJECT_ICON_MAP[getObjectInfo().name || ''] || 'Host'
                      }
                      className="text-[48px] min-w-[48px]"
                    />
                    <div
                      style={{
                        width: 'calc(100% - 60px)',
                      }}
                    >
                      <h2
                        title={app.display_name}
                        className="text-xl font-bold m-0 hide-text"
                      >
                        {app.display_name || '--'}
                      </h2>
                      <Tag className="mt-[4px]">
                        {COLLECT_TYPE_MAP[app.name] || '--'}
                      </Tag>
                    </div>
                  </div>
                  <p
                    className={`mb-[15px] text-[var(--color-text-3)] text-[13px] ${intergrationStyle.lineClamp3}`}
                    title={app.display_description || '--'}
                  >
                    {app.display_description || '--'}
                  </p>
                  <div className="w-full h-[32px] flex justify-center items-end">
                    <Permission
                      requiredPermissions={['Setting']}
                      className="w-full"
                    >
                      <Button
                        icon={<SettingOutlined />}
                        type="primary"
                        className="w-full rounded-md transition-opacity duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          linkToDetial(app);
                        }}
                      >
                        {t('common.setting')}
                      </Button>
                    </Permission>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Spin>
      </div>
      <ImportModal ref={importRef} onSuccess={onTxtClear} />
    </div>
  );
};

export default Intergration;
