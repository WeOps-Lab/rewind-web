'use client';
import React, { useEffect, useRef, useState } from 'react';
import { FormInstance, Input } from 'antd';
import OperateModal from '@/components/operate-modal';
import useApiClient from '@/utils/request';
import { Form, Menu } from 'antd';
import cloudregionstyle from './index.module.scss';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/utils/i18n';
import useApiCloudRegion from '@/app/node-manager/api/cloudregion';
import EntityList from "@/components/entity-list/index"
import type { GetProps } from 'antd';
type SearchProps = GetProps<typeof Input.Search>;

interface CloudregioncardProps {
  id: number;
  name: string;
  introduction: string;
  [key: string]: any;
}


const Cloudregion = () => {
  const cloudregionformRef = useRef<FormInstance>(null);
  const divref = useRef(null);
  const { t } = useTranslation();
  const router = useRouter();
  const { isLoading } = useApiClient();
  const { getcloudlist, updatecloudintro } = useApiCloudRegion();
  const [selectedRegion, setSelectedRegion] = useState<CloudregioncardProps | null>(null);
  const [openeditcloudregion, setOpeneditcloudregion] = useState(false);
  const [clouditem, setClouditem] = useState<{ id: string; name: string; description: string; icon: string; }[]>([]);

  // 获取相关的接口
  const fetchCloudRegions = async () => {
    try {
      const res = await getcloudlist();
      if (res && res.length > 0) {
        setSelectedRegion(res[0]);
        setClouditem([{
          id: res[0].id,
          name: res[0].name,
          description: res[0]?.introduction as string,
          icon: 'yunquyu'
        }])
      } else {
        console.error('No data received');
      }
    } catch (error) {
      console.error('Error fetching cloud region data:', error);
    }
  };

  useEffect(() => {
    if (isLoading) {
      fetchCloudRegions();
    }
  }, [isLoading]);

  useEffect(() => {
    cloudregionformRef.current?.resetFields();
    cloudregionformRef.current?.setFieldsValue({
      cloudregion: {
        id: selectedRegion?.id,
        title: selectedRegion?.name,
        introduction: selectedRegion?.introduction,
      },
    });
  }, [openeditcloudregion]);

  const handleFormOkClick = () => {
    const { cloudregion } = cloudregionformRef.current?.getFieldsValue();
    updatecloudintro(cloudregion.id, { introduction: cloudregion.introduction });
    setOpeneditcloudregion(false);
    fetchCloudRegions();
  };

  const onSearch: SearchProps['onSearch'] = (value, _e, info) =>
    console.log(info?.source, value);

  const handleEdit = () => {
    setOpeneditcloudregion(true)
  }

  return (
    <div
      ref={divref}
      className={`${cloudregionstyle.cloudregion} w-full h-full`}
    >
      <EntityList
        data={clouditem}
        loading={false}
        menuActions={() => {
          return (<Menu>
            <Menu.Item key="edit" onClick={() => handleEdit()}>{t('common.edit')}</Menu.Item>
          </Menu>)
        }}
        openModal={() => { }}
        onSearch={onSearch} onCardClick={() => { router.push('/node-manager/cloudregion/node?cloud_region_id=1'); }} ></EntityList>

      {/* 编辑默认云区域弹窗 */}
      <OperateModal
        title={t('node-manager.cloudregion.editform.title')}
        open={openeditcloudregion}
        okText="Confirm"
        cancelText="Cancel"
        onCancel={() => {
          setOpeneditcloudregion(false);
        }}
        onOk={() => {
          handleFormOkClick();
        }}
      >
        <Form layout="vertical" ref={cloudregionformRef} name="nest-messages">
          <Form.Item name={['cloudregion', 'id']} hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name={['cloudregion', 'title']}
            label={t('node-manager.cloudregion.editform.Name')}
          >
            <Input placeholder={selectedRegion?.name} disabled />
          </Form.Item>
          <Form.Item
            name={['cloudregion', 'introduction']}
            label={t('node-manager.cloudregion.editform.Introduction')}
          >
            <Input.TextArea rows={5} />
          </Form.Item>
        </Form>
      </OperateModal>
    </div>
  );
};

export default Cloudregion;
