"use client";
import React, { useEffect, useState } from "react";
import { Input } from "antd";
import collectorstyle from "./index.module.scss";
import Collectorcard from "../../components/collectorcard";
import { Segmented } from "antd";
import useApiCollector from "@/app/node-manager/api/collector/index";
import type { GetProps } from 'antd';
type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;


const Collector = () => {

  const { getCollectorlist } = useApiCollector();
  const [value, setValue] = useState<string | number>('All(20)');
  const [cards, setCards] = useState([])
  useEffect(() => {
    getCollectorlist().then((res) => {
      setCards(res)
    })
  }, [])

  const onSearch: SearchProps['onSearch'] = (value) => {
    getCollectorlist(value).then((res) => {
      setCards(res)
    })
  };

  return (
    <div className={`${collectorstyle.collection}`}>
      {/* 顶部的提示信息 */}
      <Segmented
        className="custom-tabs"
        options={['All(20)', 'Elastic(6)', 'XX(10)']}
        value={value}
        onChange={setValue}
      />
      <div className="flex flex-col">
        <div className="flex justify-end mb-4"> <Search className="w-64 mr-8" placeholder="input search text" onSearch={onSearch} enterButton /></div>
        {/* 卡片 */}
        <div className="flex gap-x-16 flex-wrap gap-y-8">
          {cards.map((item: any) => (
            <Collectorcard key={5} id={item.id} name={item.name} system={[item.node_operating_system]} introduction={item.introduction} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Collector;
