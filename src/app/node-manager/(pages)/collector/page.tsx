"use client";
import React, { useEffect, useState } from "react";
import { Input } from "antd";
import collectorstyle from "./index.module.scss";
import { Segmented } from "antd";
import useApiClient from '@/utils/request';
import useApiCollector from "@/app/node-manager/api/collector/index";
import EntityList from "@/components/entity-list/index";
import { useRouter } from "next/navigation";
import type { GetProps } from 'antd';
type SearchProps = GetProps<typeof Input.Search>;

const Collector = () => {

  const { getCollectorlist } = useApiCollector();
  const router = useRouter();
  const { isLoading } = useApiClient();
  const [value, setValue] = useState<string | number>();
  const [cards, setCards] = useState<[]>([])
  useEffect(() => {
    if (!isLoading) {
      getCollectorlist().then((res) => {
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
  }, [isLoading])

  const onSearch: SearchProps['onSearch'] = (value) => {
    getCollectorlist(value).then((res) => {
      const tempdata = res.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.introduction,
        icon: 'caijiqizongshu',
        tag: [item.node_operating_system]
      }))
      setCards(tempdata)
    })
  };

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
      <EntityList data={cards} loading={false} onSearch={onSearch} onCardClick={(item: any) => router.push(`collector/detail?id=${item?.id}`)}></EntityList>
    </div>
  );
}

export default Collector;
