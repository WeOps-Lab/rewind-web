"use client";
import React from "react";
import SubLayout from "@/components/sub-layout";
import { useTranslation } from "@/utils/i18n";
import Collectorintro from "@/app/node-manager/(pages)/cloudregion/components/collectorintro";

function Collector({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  const { t } = useTranslation();
  //顶部的介绍栏
  function Topsection() {
    return (
      <div className="flex justify-between h-[90px]">
        <div className="mt-[4px]">
          <h1 className="pl-[20px] mt-4">{t("common.node")}</h1>
          <p className="text-[13px] text-[#666666] pl-[20px] overflow-hidden w-full min-w-[1000px] mt-2">
            {t("common.topdes")}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <SubLayout
        menuItems={[
          {
            label: "Node",
            path: "/node-manager/cloudregion/node",
            icon: "shezhi",
          },
          {
            label: "Configuration",
            path: "/node-manager/cloudregion/configuration",
            icon: "shezhi",
          },
          {
            label: "Variable",
            path: "/node-manager/cloudregion/variable",
            icon: "shezhi",
          },
        ]}
        topSection={<Topsection></Topsection>}
        showBackButton={false}
        intro={<Collectorintro></Collectorintro>}     >
        {children}
      </SubLayout>
    </div>
  );
}
export default Collector;
