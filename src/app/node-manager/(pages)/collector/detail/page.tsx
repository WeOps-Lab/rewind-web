"use client";
import React from "react";
import SubLayout from "@/components/sub-layout";
import Icon from '@/components/icon';
import { useTranslation } from "@/utils/i18n";
function Collectordetail() {
  const { t } = useTranslation();
  //顶部的组件
  function Topsection() {
    return (
      <div className="flex justify-between h-[90px]">
        <div className="mt-[4px]">
          <h1 className="pl-[20px] mt-4">{t('node-manager.collector.title')}</h1>
          <p className="pl-[20px] overflow-hidden w-full min-w-[1000px] mt-2">
            {t('node-manager.collector.desc')}
          </p>
        </div>
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



function Collectorintro() {
  return (
    <div className="h-[58px] flex flex-col justify-items-center">
      <div className="flex justify-center mb-2">
        <Icon type="caijiqizongshu" style={{ height: '34px', width: '34px' }}></Icon>
      </div>
      <div className="flex justify-center">
        <div>Metricbeat</div>
      </div>
    </div>
  );
}

export default Collectordetail;
