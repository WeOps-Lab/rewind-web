'use client';

import React from 'react';
import EntityCard from '@/app/opspilot/components/entity-card';
import { Skill } from '@/app/opspilot/types/skill';

interface SkillCardProps extends Skill {
  index: number;
  onMenuClick: (action: string, skill: Skill) => void;
}

const SkillCard: React.FC<SkillCardProps> = (props) => {
  const { id, name, introduction, created_by, team_name, team, index, onMenuClick } = props;
  const iconTypeMapping: [string, string] = ['jishuqianyan', 'theory'];

  return (
    <EntityCard
      id={id}
      name={name}
      introduction={introduction}
      created_by={created_by}
      team_name={team_name}
      team={team}
      index={index}
      onMenuClick={onMenuClick}
      redirectUrl="/opspilot/skill/detail"
      iconTypeMapping={iconTypeMapping}
    />
  );
};

export default SkillCard;
