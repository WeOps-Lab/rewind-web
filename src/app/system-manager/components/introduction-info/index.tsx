"use client";

import React from "react";
import introductionInfoStly from "./index.module.scss";
interface IntroductionInfoProp {
  message: string;
  title: string;
}
const IntroductionInfo: React.FC<IntroductionInfoProp> = ({ message, title }) => (
  <div className={`h-16 w-full rounded-md ${introductionInfoStly.introductionInfo}`}>
    <h1 className="text-base font-sans ml-5 pt-2">{title}</h1>
    <p className="text-sm ml-5 font-light whitespace-nowrap">{message}</p>
  </div>
);

export default IntroductionInfo;
