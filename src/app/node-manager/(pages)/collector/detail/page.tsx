"use client";
import React from "react";
import SubLayout from "@/components/sub-layout";
import Icon from '@/components/icon';
import { useTranslation } from "@/utils/i18n";
const Collectordetail = () => {
  const { t } = useTranslation();
  //顶部的组件
  const Topsection = () => {
    return (
      <div className="flex flex-col h-[90px] p-4 overflow-hidden">
        <h1 className="text-lg">{t('node-manager.collector.title')}</h1>
        <p className="text-sm overflow-hidden w-full min-w-[1000px] mt-[8px]">
          {t('node-manager.collector.desc')}
        </p>
      </div>
    );
  }
  return (
    <div className="w-full h-full">
      <SubLayout
        menuItems={[{ label: "Overview", path: "/", icon: "shezhi" }]}
        topSection={<Topsection></Topsection>}
        showBackButton={false}
        intro={<Collectorintro></Collectorintro>}
      >
        <div className="w-full h-full">
          <div>文档介绍的位置</div>
          <div>
            <div>Linux</div>
            <div>Linux的介绍</div>
          </div>
          <div className="mt-[20px]">
            <div>conntrack</div>
            <div>conntrack的介绍</div>
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



const Collectorintro = () => {
  return (
    <div className="h-[58px] flex flex-col justify-items-center">
      <div className="flex justify-center mb-[8px]">
        <Icon type="caijiqizongshu" style={{ height: '34px', width: '34px' }}></Icon>
      </div>
      <div className="flex justify-center">
        <div>Metricbeat</div>
      </div>
    </div>
  );
}

export default Collectordetail;
