import React, { useRef, useEffect, useState } from 'react';
import { Tooltip } from 'antd';

// 定义组件的 Props 类型
interface EllipsisWithTooltipProps {
  text: string | null;
  className: string;
}

const EllipsisWithTooltip: React.FC<EllipsisWithTooltipProps> = ({ text, className }) => {
  // 将 textRef 的类型明确指定为 RefObject<HTMLDivElement>
  const textRef = useRef<HTMLDivElement>(null);
  const [isOverflow, setIsOverflow] = useState(false);

  // 检测文本是否溢出的函数
  const checkOverflow = (element: HTMLDivElement | null, setOverflow: (value: boolean) => void) => {
    if (element) {
      setOverflow(element.scrollWidth > element.clientWidth);
    }
  };

  useEffect(() => {
    checkOverflow(textRef.current, setIsOverflow);

    const handleResize = () => {
      checkOverflow(textRef.current, setIsOverflow);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [text]);

  return (
    <>
      {isOverflow ? (
        <Tooltip title={text}>
          <div ref={textRef} className={className}>
            {text}
          </div>
        </Tooltip>
      ) : (
        <div ref={textRef} className={className}>
          {text}
        </div>
      )}
    </>
  );
};

export default EllipsisWithTooltip;
