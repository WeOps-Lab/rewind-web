import { Tooltip } from "antd";
interface TopSectionProps {
    title: string;
    content: string;
  }
const TopSection : React.FC<TopSectionProps> = ({title,content}) => (
  <div className="p-4 rounded-md w-full h-[95px] flex items-center bg-[var(--color-bg-1)]">
    <div>
      <h2 className="text-lg font-semibold mb-2 ml-[20px]">{title}</h2>
      <Tooltip >
        <p className="truncate max-w-full text-sm ml-[20px]">{content}</p>
      </Tooltip>
    </div>
  </div>
);
export default TopSection;