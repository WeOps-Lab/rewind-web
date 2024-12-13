import { Tooltip } from 'antd';
interface TopSectionProps {
  title: string;
  content: string;
}
const TopSection : React.FC<TopSectionProps> = ({title, content}) => (
  <div className="p-4 rounded-md w-full h-[88px] bg-[var(--color-bg-1)]">
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <Tooltip>
      <p className="truncate max-w-full text-sm">{content}</p>
    </Tooltip>
  </div>
);
export default TopSection;
