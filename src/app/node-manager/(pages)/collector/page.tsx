"use client";
import React, { useState } from "react";
import { Input } from "antd";
import collectorstyle from "./index.module.scss";
import Collectorcard from "../../components/collectorcard";
import { Segmented } from "antd";
import type { GetProps } from 'antd';
type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;
const Collector = () => {
  const [value, setValue] = useState<string | number>('All(20)');
  const cards = Array(5).fill(0);
  const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);
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
          {cards.map((_, index) => (
            <Collectorcard key={5} page={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Collector;
