"use client";
import React, { useEffect, useState } from "react";
import SubLayout from "@/components/sub-layout";
import Icon from '@/components/icon';
import { useTranslation } from "@/utils/i18n";
import useApiCollector from "@/app/node-manager/api/collector";
import type { Collectorcardprops } from "@/app/node-manager/types/index";
import { useRouter } from "next/navigation"

const Collectordetail = () => {

  const { getCollectorlist } = useApiCollector();
  const { t } = useTranslation();
  const router = useRouter();
  const [detaildata, setDetaildata] = useState<Collectorcardprops>({
    id: "",
    name: "",
    system: [],
    introduction: ''
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("id");
    if (typeof id === 'string') {
      getCollectorlist({ search: id }).then((res) => {
        const tempdata = {
          id: res[0].id,
          name: res[0].name,
          system: [res[0].node_operating_system],
          introduction: res[0].introduction
        }
        setDetaildata(tempdata)
      })
    }
  }, []);

  //顶部的组件
  const Topsection = () => {
    return (
      <div className="flex flex-col h-[90px] p-4 overflow-hidden">
        <h1 className="text-lg">{t('node-manager.collector.title')}</h1>
        <p className="text-sm overflow-hidden w-full min-w-[1000px] mt-[8px]">
          {detaildata.introduction}
        </p>
      </div>
    );
  }

  const Collectorintro = () => {
    return (
      <div className="h-[58px] flex flex-col justify-items-center">
        <div className="flex justify-center mb-[8px]">
          <Icon type="caijiqizongshu" style={{ height: '34px', width: '34px' }}></Icon>
        </div>
        <div className="flex justify-center">
          <div>{detaildata.name}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <SubLayout
        menuItems={[{ label: "Overview", path: "/", icon: "shezhi" }]}
        topSection={<Topsection></Topsection>}
        showBackButton={true}
        intro={<Collectorintro></Collectorintro>}
        onBackButtonClick={() => { router.push('/node-manager/collector/') }}
      >
        <div className="w-full h-full">
          <div>文档介绍的位置</div>
          <div>
            <div>{detaildata.system && detaildata.system[0] ? detaildata.system[0] : '未知系统'}</div>
            <div>Linux的介绍</div>
          </div>
          <div className="mt-[20px]">
            <div>conntrack</div>
            <div>{detaildata.introduction}</div>
          </div>
          <div className="mt-[20px]">
            <div>Summary</div>
            <div>Summary的介绍</div>
          </div>
        </div>
      </SubLayout>
    </div>
  );
}

export default Collectordetail;
