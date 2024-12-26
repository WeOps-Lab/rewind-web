import React, { FC } from "react";
import collectorstyle from "./index.module.scss";
import Link from "next/link";
import Icon from "@/components/icon";
const CollectorCard: FC<{ key: number; page: number }> = (props) => {
  return (
    <Link href={`collector/detail?id=${props.page}`}>
      <div
        className={`${collectorstyle.card} min-w-60 max-w-80 bg-[var(--color-bg-1)] h-40  p-4 flex flex-col shadow-md`}
      >
        {/* 卡片的上面的内容 */}
        <div className="flex mb-4">
          <Icon type="caijiqizongshu" style={{ height: '40px', width: '40px' }}></Icon>
          <div className="ml-[8px]">
            <div>Metricbeat</div>
            <div className="flex">
              <p className="font-thin text-xs">Linux</p>
              <p className="font-thin text-xs">Windowns</p>
            </div>
          </div>
        </div>
        {/* 卡片的下面的内容 */}
        <p className={`text-xs ${collectorstyle.pfontstyle}`}>
          Collect metrics from your systems and services. From CPU to memory,
          Redis to NGINX, and much more, Metricbeat is a lightweight way to send
          system and service statistics.
        </p>
      </div>
    </Link>
  );
};

export default CollectorCard;
