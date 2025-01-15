"use client";
import React, { useEffect, useState } from "react";
import collectorstyle from "./index.module.scss";
import { Segmented } from "antd";
import useApiClient from '@/utils/request';
import useApiCollector from "@/app/node-manager/api/collector/index";
import EntityList from "@/components/entity-list/index";
import { useRouter } from "next/navigation";
import type { collectorItem } from "@/app/node-manager/types/collector"

const Collector = () => {

  const { getCollectorlist } = useApiCollector();
  const router = useRouter();
  const { isLoading } = useApiClient();
  const [value, setValue] = useState<string | number>();
  const [cards, setCards] = useState<collectorItem[]>([]);

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
        tag: [item.node_operating_system]
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
      <EntityList data={cards} loading={false} onSearch={(value: string) => { fetchCollectorlist(value) }} onCardClick={(item: collectorItem) => navigateToCollectorDetail(item)}></EntityList>
    </div>
  );
}

export default Collector;
