"use client";
import React, { useEffect, useState, useRef } from "react";
import collectorstyle from "./index.module.scss";
import { Segmented, Menu } from "antd";
import useApiClient from '@/utils/request';
import useApiCollector from "@/app/node-manager/api/collector/index";
import EntityList from "@/components/entity-list/index";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/utils/i18n";
import type { collectorItem } from "@/app/node-manager/types/collector";
import CollectorModal from "./collectorModal";
import { ModalRef } from "@/app/node-manager/types";

const Collector = () => {

  const router = useRouter();
  const { t } = useTranslation();
  const { isLoading } = useApiClient();
  const { getCollectorlist } = useApiCollector();
  const formRef = useRef<ModalRef>(null);
  const [value, setValue] = useState<string | number>();
  const [cards, setCards] = useState<collectorItem[]>([]);
  const items = [
    {
      key: '1', label: (
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-[var(--color-text-4)]">{t('common.edit')}</span>
        </div>
      ), 
      disabled: true
    },
    {
      key: '2', label: (
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-[var(--color-text-4)]">{t('common.edit')}</span>
        </div>
      )
    },
    {
      key: '3', label: (
        <div className="w-full flex justify-between items-center">
          <span className="text-xs text-[var(--color-text-4)]">{t('common.edit')}</span>
        </div>
      )
    },
  ];
  const filterOptions = [
    { value: 'jack', label: 'Jack' },
    { value: 'lucy', label: 'Lucy' },
    { value: 'Yiminghe', label: 'yiminghe' },
    { value: 'disabled', label: 'Disabled', disabled: true },
  ]
  const menuActions = () => (
    <Menu items={items} />
  );

  useEffect(() => {
    if (!isLoading) {
      fetchCollectorlist()
    }
  }, [isLoading])

  const navigateToCollectorDetail = (item: collectorItem) => {
    router.push(`/node-manager/collector/detail?id=${item.id}`);
  };

  const fetchCollectorlist = (value?: string) => {
    getCollectorlist({ search: value }).then((res) => {
      const tempdata = res.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.introduction,
        icon: 'caijiqizongshu',
        tagList: [item.node_operating_system]
      }))
      setCards(tempdata);
      setValue(`All(${tempdata.length})`)
    })
  }

  return (
    <div className={`${collectorstyle.collection}`}>
      {/* 顶部的提示信息 */}
      <Segmented
        className="custom-tabs"
        options={[`All(${cards.length})`, `Elastic(${cards.length})`]}
        value={value}
        onChange={setValue}
      />
      {/* 卡片的渲染 */}
      <EntityList data={cards} loading={false} menuActions={menuActions} filter filterOptions={filterOptions} onSearch={(value: string) => { fetchCollectorlist(value) }} onCardClick={(item: collectorItem) => navigateToCollectorDetail(item)}></EntityList>
      <CollectorModal ref={formRef} />
    </div>
  );
}

export default Collector;
