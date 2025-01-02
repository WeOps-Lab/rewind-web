import React, { FC } from "react";
import collectorstyle from "./index.module.scss";
import Link from "next/link";
import Icon from "@/components/icon";
import type { Collectorcardprops } from "@/app/node-manager/types/index";
const CollectorCard: FC<Collectorcardprops> = (props) => {
  const { id, name, system = [], introduction } = props;
  return (
    <Link href={`collector/detail?id=${id}`}>
      <div
        className={`${collectorstyle.card} min-w-60 max-w-80 bg-[var(--color-bg-1)] h-40  p-4 flex flex-col shadow-md`}
      >
        {/* 卡片的上面的内容 */}
        <div className="flex mb-4">
          <Icon type="caijiqizongshu" style={{ height: '40px', width: '40px' }}></Icon>
          <div className="ml-[8px]">
            <div>{name}</div>
            <div className="flex">
              <p className="font-thin text-xs">{system[0]}</p>
              {
                system.length === 2 ? <p className="font-thin text-xs">{system[1]}</p> : ''
              }
            </div>
          </div>
        </div>
        {/* 卡片的下面的内容 */}
        <p className={`text-xs ${collectorstyle.pfontstyle}`}>
          {introduction}
        </p>
      </div>
    </Link>
  );
};

export default CollectorCard;
