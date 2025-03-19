'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Modal, message, Spin } from 'antd';
import WithSideMenuLayout from '@/components/sub-layout';
import { useRouter } from 'next/navigation';
import { getIconUrl } from '@/app/cmdb/utils/common';
import Image from 'next/image';
import { EditTwoTone, DeleteTwoTone } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';
import ModelModal from '../list/modelModal';
import attrLayoutStyle from './layout.module.scss';
import useApiClient from '@/utils/request';
import { ClassificationItem } from '@/app/cmdb/types/assetManage';
import { useTranslation } from '@/utils/i18n';
import { useCommon } from '@/app/cmdb/context/common';
import PermissionWrapper from '@/components/permission';

const AboutLayout = ({ children }: { children: React.ReactNode }) => {
  const { get, del, isLoading } = useApiClient();
  const { t } = useTranslation();
  const { confirm } = Modal;
  const router = useRouter();
  const searchParams = useSearchParams();
  const commonContext = useCommon();
  const objIcon: string = searchParams.get('icn') || '';
  const modelName: string = searchParams.get('model_name') || '';
  const modelId: string = searchParams.get('model_id') || '';
  const classificationId: string = searchParams.get('classification_id') || '';
  const isPre = searchParams.get('is_pre') === 'true';
  const modelRef = useRef<any>(null);
  const permissionGroupsInfo = useRef(
    commonContext?.permissionGroupsInfo || null
  );
  const isAdmin = permissionGroupsInfo.current?.is_all;
  const [groupList, setGroupList] = useState<ClassificationItem[]>([]);
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading) return;
    getGroups();
  }, [isLoading, get]);

  const getGroups = async () => {
    setPageLoading(true);
    try {
      const data = await get('/cmdb/api/classification/');
      setGroupList(data);
    } catch (error) {
      console.log(error);
    } finally {
      setPageLoading(false);
    }
  };

  const onSuccess = (info: any) => {
    router.replace(
      `/cmdb/assetManage/management/detail/attributes?icn=${info.icn}&model_name=${info.model_name}&model_id=${info.model_id}&classification_id=${info.classification_id}`
    );
  };

  const handleBackButtonClick = () => {
    router.push(`/cmdb/assetManage`);
  };

  const showDeleteConfirm = (row = { model_id: '' }) => {
    confirm({
      title: t('deleteTitle'),
      content: t('deleteContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await del(`/cmdb/api/model/${row.model_id}/`);
            message.success(t('successfullyDeleted'));
            router.push(`/cmdb/assetManage`);
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const shoModelModal = (type: string, row = {}) => {
    const title = t(type === 'add' ? 'Model.addModel' : 'Model.editModel');
    modelRef.current?.showModal({
      title,
      type,
      modelForm: row,
      subTitle: '',
    });
  };

  const intro = (
    <header className="flex items-center">
      <Image
        src={getIconUrl({ icn: objIcon, model_id: modelId })}
        className="block mr-[10px]"
        alt={t('picture')}
        width={30}
        height={30}
      />
      <div className="flex flex-col mr-[6px] flex-1">
        <div
          className={`text-[14px] font-[800] mb-[2px] ${attrLayoutStyle.ellipsisText} break-all`}
        >
          {modelName}
        </div>
        <div className="text-[var(--color-text-2)] text-[12px] break-all">
          {modelId}
        </div>
      </div>
      {(isAdmin || !isPre) && (
        <div className="self-start w-[36px]">
          <PermissionWrapper requiredPermissions={['Edit']}>
            <EditTwoTone
              className="edit mr-[8px] text-[14px] cursor-pointer"
              onClick={() =>
                shoModelModal('edit', {
                  model_name: modelName,
                  model_id: modelId,
                  classification_id: classificationId,
                  icn: objIcon,
                })
              }
            />
          </PermissionWrapper>
          <PermissionWrapper requiredPermissions={['Delete']}>
            <DeleteTwoTone
              className="delete text-[14px] cursor-pointer"
              onClick={() =>
                showDeleteConfirm({
                  model_id: modelId,
                })
              }
            />
          </PermissionWrapper>
        </div>
      )}
    </header>
  );

  return (
    <div
      style={{
        height: 'calc(100vh - 150px)',
        ['--custom-height' as string]: 'calc(100vh - 150px)',
      }}
      className={attrLayoutStyle.attrLayout}
    >
      <Spin spinning={pageLoading}>
        <WithSideMenuLayout
          showBackButton={true}
          onBackButtonClick={handleBackButtonClick}
          intro={intro}
        >
          {children}
        </WithSideMenuLayout>
        <ModelModal
          ref={modelRef}
          groupList={groupList}
          onSuccess={onSuccess}
        />
      </Spin>
    </div>
  );
};

export default AboutLayout;
