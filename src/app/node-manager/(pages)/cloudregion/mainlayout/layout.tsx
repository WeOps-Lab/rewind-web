"use client";
import React from "react";
import SubLayout from "@/components/sub-layout";
import { useTranslation } from "@/utils/i18n";
import { usePathname } from "next/navigation";
import Collectorintro from "@/app/node-manager/components/collectorintro";

const CollectorLayout = ({ children }: Readonly<{
  children: React.ReactNode;
}>) => {
  const { t } = useTranslation();
  const Topsection = () => {
    const pathname = usePathname();
    const getTitle = () => {
      const temp = pathname.split("/")[3];
      return t(`common.${temp}`);
    }
    return (
      <div className="flex flex-col h-[90px] p-4 overflow-hidden">
        <h1 className="text-lg">{getTitle()}</h1>
        <p className="text-sm overflow-hidden w-full min-w-[1000px] mt-[8px]">
          {t("common.topdes")}
        </p>
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
export default CollectorLayout;
