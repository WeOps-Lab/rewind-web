"use client";
import React, { useState } from "react";
import { Input } from "antd";
import collectorstyle from "./index.module.scss";
import Collectorcard from "../../components/collectorcard";
import { Segmented } from "antd";
import type { GetProps } from 'antd';
type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;
function Collector() {
  const [value, setValue] = useState<string | number>('All(20)');
  const cards = Array(5).fill(0);
  const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);
  return (
    <div className={`${collectorstyle.collection}`}>
      {/* 顶部的提示信息 */}
      <div className="flex mb-4 justify-between">
        <Segmented
          className="custom-tabs"
          options={['All(20)', 'Elastic(6)', 'XX(10)']}
          value={value}
          onChange={setValue}
        />
        <Search className="w-64" placeholder="input search text" onSearch={onSearch} enterButton />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* 卡片 */}
        {cards.map((_, index) => (
          <Collectorcard key={5} page={index} />
        ))}
      </div>
    </div>
  );
}

export default Collector;
