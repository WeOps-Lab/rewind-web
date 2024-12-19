'use client'
import React, {useEffect, useRef, useState } from "react";
import { FormInstance, Input } from "antd";
import Icon from "@/components/icon";
import OperateModal from '@/components/operate-modal'
import { Form } from "antd";
import cloudregionstyle from './index.module.scss'
import { useRouter } from "next/navigation";
import { MoreOutlined } from "@ant-design/icons";
import { useTranslation } from "@/utils/i18n";
import {CouldregionCardProps} from "@/app/node-manager/types/cloudregion"
import type { GetProps } from 'antd';
type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

function Cloudregion() {
  const [openeditcloudregion, setOpeneditcloudregion] = useState(false);
  const [cloudregiondata, setCloudregiondata] = useState<string>('这个是云区域的描述');
  const cloudregionformRef = useRef<FormInstance>(null);
  const divref = useRef(null);
  const { t } = useTranslation();
  useEffect(() => {
    cloudregionformRef.current?.resetFields();
    cloudregionformRef.current?.setFieldsValue({
      user: {
        introduction: cloudregiondata,
      },
    });
  }, [openeditcloudregion])
  // 标题组件
  function Cloudregiontitle() {
    function editeiinfo(e: { stopPropagation: () => void; }) {
      setOpeneditcloudregion(true)
      e.stopPropagation()
    }
    return (
      <div className="flex">
        <div className="flex justify-center items-center w-[50px] h-[50px]"><Icon type="yunquyu" style={{ height: '35px', width: '35px' }}></Icon></div>
        <div className="flex justify-items-center items-center"><div>{t('node-manager.cloudregion.title')}</div></div>
        <div className="relative w-[16px] h-[24px]"><div className="absolute" style={{ top: '-7px', left: '9px' }} onClick={editeiinfo}><MoreOutlined /></div></div>
      </div>
    )
  }
  const CouldregionCard: React.FC<CouldregionCardProps> = ({ height = 127, width = 262, title, children }) => {
    const router = useRouter();
    const handleCardClick = (event: any) => {
      const titleElement = event.currentTarget.querySelector('.card-title');
      event.stopPropagation();

      if (!titleElement || !titleElement.contains(event.target as Node)) {
        router.push('/node-manager/cloudregion/node');
      }
    };
    return (<div className={`p-4 rounded-md flex items-center bg-[var(--color-bg-1)] flex-col`}
      style={{ width: `${width}px`, height: `${height}px` }} onClick={handleCardClick}>
      <div className="w-full">
        <div>{title}</div>
      </div>
      <div className="w-full">{children}</div>
    </div>);
  };

  function handleFormOkClick() {
    setOpeneditcloudregion(false);
    const values = cloudregionformRef.current?.getFieldsValue();
    setCloudregiondata(values?.user?.introduction);
  }

  const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);
  
  return (
    <div ref={divref} className={`${cloudregionstyle.cloudregion} w-full h-full`}>
      <div className="flex justify-end mb-4"> <Search className="w-64 mr-[8px]" placeholder="input search text"  enterButton onSearch={onSearch} /></div>
      <div className="flex">
        <div>
          <div className={`p-4 rounded-md flex items-center bg-[var(--color-bg-1)] flex-col justify-center`}
            style={{ width: `262px`, height: `127px` }} >
            <div>+{t('common.add')}</div>
          </div>
        </div>
        <div className="ml-[45px]">
          <CouldregionCard title={<Cloudregiontitle></Cloudregiontitle>}><p className="mt-4 crp h-[40px] textclip">{cloudregiondata}</p> </CouldregionCard>
        </div>
      </div>
      {/* 编辑默认云区域弹窗 */}
      <OperateModal
        title={t('node-manager.cloudregion.editform.title')}
        open={openeditcloudregion}
        okText="Confirm"
        cancelText="Cancel"
        onCancel={() => { setOpeneditcloudregion(false) }}
        onOk={() => { handleFormOkClick() }}>
        <Form
          layout="vertical"
          ref={cloudregionformRef}
          name="nest-messages"
        >
          <Form.Item required name={['user', 'website']} label={t('node-manager.cloudregion.editform.Name')}>
            <Input placeholder="Default Cloud Region" disabled />
          </Form.Item>
          <Form.Item required name={['user', 'introduction']} label={t('node-manager.cloudregion.editform.Introduction')}>
            <Input.TextArea value={cloudregiondata} rows={5} />
          </Form.Item>
        </Form>
      </OperateModal>
    </div>
  )
}

export default Cloudregion;