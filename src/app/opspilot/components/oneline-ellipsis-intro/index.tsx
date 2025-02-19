import React from 'react';
import OneLineEllipsisWithTooltip from '@/components/ellipsis-with-tooltip';

interface OneLineEllipsisIntroProps {
  name: string | null;
  desc: string | null;
}

const OneLineEllipsisIntro: React.FC<OneLineEllipsisIntroProps> = ({ name, desc }) => {
  return (
    <div className="w-full">
      <OneLineEllipsisWithTooltip
        text={name}
        className="text-lg font-semibold mb-2 whitespace-nowrap overflow-hidden text-ellipsis"
      />
      <OneLineEllipsisWithTooltip
        text={desc}
        className="text-sm whitespace-nowrap overflow-hidden text-ellipsis"
      />
    </div>
  );
};

export default OneLineEllipsisIntro;
