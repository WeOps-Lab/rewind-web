import React from "react";
interface TopSectionProps {
  width?: number;
  height?: number;
  title?: React.ReactNode;
  children: React.ReactNode;
}
const TopSection: React.FC<TopSectionProps> = ({ height = 127, width = 262, title, children }) => (
  <div className={`p-4 rounded-md flex items-center bg-[var(--color-bg-1)] flex-col`}
    style={{ width: `${width}px`, height: `${height}px` }} >
    <div className="w-full">
      <div>{title}</div>
    </div>
    <div className="w-full">{children}</div>
  </div>
);
export default TopSection;