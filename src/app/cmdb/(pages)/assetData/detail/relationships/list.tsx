'use client';
import React, {
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CrentialsAssoInstItem,
  CrentialsAssoDetailItem,
  ModelItem,
  AssoTypeItem,
  AssoListRef,
  RelationListInstItem,
  RelationInstanceRef,
} from '@/app/cmdb/types/assetManage';
import { getAssetColumns } from '@/app/cmdb/utils/common';
import { Spin, Collapse, Button, Modal, message, Empty } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import { AssoListProps } from '@/app/cmdb/types/assetData';
import CustomTable from '@/components/custom-table';
import useApiClient from '@/utils/request';
import assoListStyle from './index.module.scss';
import SelectInstance from './selectInstance';

const { confirm } = Modal;

const AssoList = forwardRef<AssoListRef, AssoListProps>(
  ({ modelList, userList, organizationList, assoTypeList }, ref) => {
    const { t } = useTranslation();
    const [activeKey, setActiveKey] = useState<string[]>([]);
    const [allActiveKeys, setAllActiveKeys] = useState<string[]>([]);
    const [instIds, setInstIds] = useState<RelationListInstItem[]>([]);
    const [assoCredentials, setAssoCredentials] = useState<
      CrentialsAssoInstItem[]
    >([]);
    const [pageLoading, setPageLoading] = useState<boolean>(false);
    const searchParams = useSearchParams();
    const { get, del } = useApiClient();
    const modelId: string = searchParams.get('model_id') || '';
    const instId: string = searchParams.get('inst_id') || '';
    const instanceRef = useRef<RelationInstanceRef>(null);

    useEffect(() => {
      if (
        modelList.length &&
        userList.length &&
        organizationList.length &&
        assoTypeList.length
      ) {
        getInitData();
      }
    }, [modelList, userList, organizationList, assoTypeList]);

    useImperativeHandle(ref, () => ({
      expandAll: (type: boolean) => {
        setActiveKey(type ? allActiveKeys : []);
      },
      showRelateModal: () => {
        instanceRef.current?.showModal({
          title: t('Model.association'),
          model_id: modelId,
          list: instIds,
          instId,
        });
      },
    }));

    const linkToDetail = (row: any, item: any) => {
      const linkModelId =
        item.src_model_id === modelId ? item.dst_model_id : item.src_model_id;
      const params: any = {
        icn: '',
        model_name: showModelName(linkModelId, modelList),
        model_id: linkModelId,
        classification_id: '',
        inst_id: row._id,
      };
      const queryString = new URLSearchParams(params).toString();
      const url = `/assetData/detail/baseInfo?${queryString}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    const getInitData = async () => {
      setAssoCredentials([]);
      setPageLoading(true);
      try {
        const assoInstData = await get(
          `/cmdb/api/instance/association_instance_list/${modelId}/${instId}/`
        );
        const assoIds = assoInstData.reduce(
          (pre: RelationListInstItem[], cur: CrentialsAssoInstItem) => {
            const allInstIds = cur.inst_list.map((item) => ({
              id: item._id,
              inst_asst_id: item.inst_asst_id,
            }));
            pre = [...pre, ...allInstIds];
            return pre;
          },
          []
        );
        setInstIds(assoIds);
        Promise.all(
          assoInstData.map((item: any) =>
            getModelAttrList(item, {
              assoList: assoInstData,
              userData: userList,
              organizationData: organizationList,
              models: modelList,
              assoTypeList,
            })
          )
        ).finally(() => {
          setPageLoading(false);
        });
      } catch {
        setPageLoading(false);
      }
    };

    const getModelAttrList = async (item: any, config: any) => {
      const responseData = await get(
        `/cmdb/api/model/${getAttrId(item)}/attr_list/`
      );
      const targetIndex = config.assoList.findIndex(
        (assoItem: CrentialsAssoDetailItem) =>
          assoItem.model_asst_id === item.model_asst_id
      );
      const columns = [
        ...getAssetColumns({
          attrList: responseData,
          userList: config.userData,
          groupList: config.organizationData,
          t,
        }),
        {
          title: t('action'),
          dataIndex: 'action',
          key: 'action',
          fixed: 'right',
          width: 120,
          render: (_: unknown, record: any) => (
            <Button
              type="link"
              onClick={() => cancelRelate(record.inst_asst_id)}
            >
              {t('Model.disassociation')}
            </Button>
          ),
        },
      ];
      if (columns[0]) {
        columns[0].fixed = 'left';
        columns[0].render = (_: unknown, record: any) => (
          <a
            className="text-[var(--color-primary)]"
            onClick={() => linkToDetail(record, item)}
          >
            {record[columns[0].dataIndex]}
          </a>
        );
      }
      if (targetIndex !== -1) {
        config.assoList[targetIndex] = {
          key: item.model_asst_id,
          label: showConnectName(item, config),
          model_asst_id: item.model_asst_id,
          children: (
            <CustomTable
              pagination={false}
              dataSource={item.inst_list}
              columns={columns}
              scroll={{ x: 'calc(100vw - 306px)', y: 300 }}
              rowKey="_id"
            />
          ),
        };
      }
      setAssoCredentials(config.assoList);
      const keys = config.assoList.map(
        (item: CrentialsAssoDetailItem) => item.key
      );
      setActiveKey(keys);
      setAllActiveKeys(keys);
    };

    const cancelRelate = async (id: unknown) => {
      confirm({
        title: t('disassociationTitle'),
        content: t('deleteContent'),
        centered: true,
        onOk() {
          return new Promise(async (resolve) => {
            try {
              await del(`/cmdb/api/instance/association/${id}/`);
              message.success(t('successfullyDisassociated'));
              getInitData();
            } finally {
              resolve(true);
            }
          });
        },
      });
    };

    const showConnectName = (row: any, config: any) => {
      const sourceName = showModelName(row.src_model_id, config.models);
      const targetName = showModelName(row.dst_model_id, config.models);
      const relation = showConnectType(row.asst_id, config.assoTypeList);
      return `${sourceName} ${relation} ${targetName}`;
    };

    const showModelName = (id: string, list: ModelItem[]) => {
      return list.find((item) => item.model_id === id)?.model_name || '--';
    };
    const showConnectType = (id: string, assoTypeList: AssoTypeItem[]) => {
      return (
        assoTypeList.find((item) => item.asst_id === id)?.asst_name || '--'
      );
    };

    const getAttrId = (item: CrentialsAssoDetailItem) => {
      const { dst_model_id: dstModelId, src_model_id: srcModelId } = item;
      if (modelId === dstModelId) {
        return srcModelId;
      }
      return dstModelId;
    };

    const handleCollapseChange = (keys: any) => {
      setActiveKey(keys);
    };

    const confirmRelate = () => {
      getInitData();
    };

    return (
      <Spin spinning={pageLoading}>
        <div className={assoListStyle.relationships}>
          {assoCredentials.length ? (
            <Collapse
              bordered={false}
              activeKey={activeKey}
              expandIcon={({ isActive }) => (
                <CaretRightOutlined rotate={isActive ? 90 : 0} />
              )}
              items={assoCredentials}
              onChange={handleCollapseChange}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
        <SelectInstance
          ref={instanceRef}
          userList={userList}
          models={modelList}
          assoTypes={assoTypeList}
          organizationList={organizationList}
          onSuccess={confirmRelate}
        />
      </Spin>
    );
  }
);
AssoList.displayName = 'assoList';
export default AssoList;
