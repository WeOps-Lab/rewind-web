'use client';
import React, { useEffect, useRef, useState } from 'react';
import { FormInstance, Input } from 'antd';
import Icon from '@/components/icon';
import OperateModal from '@/components/operate-modal';
import useApiClient from '@/utils/request';
import { Form } from 'antd';
import cloudregionstyle from './index.module.scss';
import { useRouter } from 'next/navigation';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import { CouldregionCardProps } from '@/app/node-manager/types/cloudregion';
import useApiCloudRegion from '@/app/node-manager/api/cloudregion';
import type { GetProps } from 'antd';
type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

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
  const { isLoading } = useApiClient();
  const { getcloudlist, updatecloudintro } = useApiCloudRegion();
  const [selectedRegion, setSelectedRegion] = useState<CloudregioncardProps | null>(null);
  const [openeditcloudregion, setOpeneditcloudregion] = useState(false);

  // 获取相关的接口
  const fetchCloudRegions = async () => {
    try {
      const res = await getcloudlist();
      if (res && res.length > 0) {
        setSelectedRegion(res[0]);
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
      user: {
        introduction: selectedRegion?.introduction,
      },
    });
  }, [openeditcloudregion]);

  // 标题组件
  const Cloudregiontitle = () => {
    const editeiinfo = (e: { stopPropagation: () => void }) => {
      setOpeneditcloudregion(true);
      e.stopPropagation();
    };

    return (
      <div className="flex relative">
        <div className="flex justify-center items-center w-[50px] h-[50px]">
          <Icon type="yunquyu" style={{ height: '35px', width: '35px' }}></Icon>
        </div>
        <div className="flex justify-items-center items-center">
          <div>{selectedRegion?.name}</div>
        </div>
        <div className="w-[16px] h-[24px]">
          <div
            className="absolute"
            style={{ top: '-4px', left: '240px' }}
            onClick={editeiinfo}
          >
            <MoreOutlined />
          </div>
        </div>
      </div>
    );
  };

  const CouldregionCard: React.FC<CouldregionCardProps> = ({
    height = 128,
    width = 288,
    title,
    children,
  }) => {
    const router = useRouter();
    const handleCardClick = (event: any) => {
      const titleElement = event.currentTarget.querySelector('.card-title');
      event.stopPropagation();
      if (!titleElement || !titleElement.contains(event.target as Node)) {
        router.push('/node-manager/cloudregion/node?cloud_region_id=1');
      }
    };

    return (
      <div
        className={`p-4 rounded-md flex items-center bg-[var(--color-bg-1)] flex-col shadow-md`}
        style={{ width: `${width}px`, height: `${height}px` }}
        onClick={handleCardClick}
      >
        <div className="w-full">
          <div>{title}</div>
        </div>
        <div className="w-full">{children}</div>
      </div>
    );
  };

  const handleFormOkClick = () => {
    const values = cloudregionformRef.current?.getFieldsValue();
    updatecloudintro('1', { introduction: values?.user?.introduction });
    setOpeneditcloudregion(false);
    fetchCloudRegions();
  };

  const onSearch: SearchProps['onSearch'] = (value, _e, info) =>
    console.log(info?.source, value);

  return (
    <div
      ref={divref}
      className={`${cloudregionstyle.cloudregion} w-full h-full`}
    >
      <div className="flex justify-end mb-4">
        {' '}
        <Search
          className="w-64 mr-[8px]"
          placeholder="input search text"
          enterButton
          onSearch={onSearch}
        />
      </div>
      <div className="flex">
        <div>
          <div
            className={`p-4 w-72 ml-12 h-32 shadow-md rounded-md flex items-center bg-[var(--color-bg-1)] flex-col justify-center`}
          >
            <div>
              <PlusOutlined className="mr-[8px]"></PlusOutlined>
              {t('common.add')}
            </div>
          </div>
        </div>
        <div className="ml-12">
          <CouldregionCard title={<Cloudregiontitle></Cloudregiontitle>}>
            <p className="crp h-9 textclip">{selectedRegion?.introduction}</p>
          </CouldregionCard>
        </div>
      </div>
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
          <Form.Item
            required
            name={['user', 'website']}
            label={t('node-manager.cloudregion.editform.Name')}
          >
            <Input placeholder={selectedRegion?.name} disabled />
          </Form.Item>
          <Form.Item
            required
            name={['user', 'introduction']}
            label={t('node-manager.cloudregion.editform.Introduction')}
          >
            <Input.TextArea value={'fdhhfdh'} rows={5} />
          </Form.Item>
        </Form>
      </OperateModal>
    </div>
  );
};

export default Cloudregion;
