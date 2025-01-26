'use client';

import React from 'react';
import { Card, Dropdown, Menu, Tag } from 'antd';
import { useRouter } from 'next/navigation';
import Icon from '@/components/icon';
import Image from 'next/image';
import { useTranslation } from '@/utils/i18n';
import styles from '@/app/opspilot/styles/common.module.scss';
import PermissionWrapper from '@/components/permission';
import entityStyles from './index.module.scss';

const { Meta } = Card;

interface EntityCardProps {
  id: string | number;
  name: string;
  introduction: string;
  created_by: string;
  team_name: string | string[];
  team: any[];
  index: number;
  online?: boolean;
  onMenuClick: (action: string, entity: any) => void;
  redirectUrl: string;
  iconTypeMapping: [string, string];
}

const EntityCard: React.FC<EntityCardProps> = ({
  id,
  name,
  introduction,
  created_by,
  team_name,
  team,
  index,
  online,
  onMenuClick,
  redirectUrl,
  iconTypeMapping
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const menu = (
    <Menu className={`${entityStyles.menuContainer}`}>
      <Menu.Item key={`edit-${id}`}>
        <PermissionWrapper requiredPermissions={['Edit']}>
          <span className="block" onClick={() => onMenuClick('edit', { id, name, introduction, created_by, team_name, team, online })}>{t('common.edit')}</span>
        </PermissionWrapper>
      </Menu.Item>
      <Menu.Item key={`delete-${id}`}>
        <PermissionWrapper requiredPermissions={['Delete']}>
          <span className="block" onClick={() => onMenuClick('delete', { id, name, introduction, created_by, team_name, team, online })}>{t('common.delete')}</span>
        </PermissionWrapper>
      </Menu.Item>
    </Menu>
  );

  const iconType = index % 2 === 0 ? iconTypeMapping[0] : iconTypeMapping[1];
  const avatar = index % 2 === 0 ? '/app/banner_bg_1.jpg' : '/app/banner_bg_2.jpg';

  return (
    <Card
      className={`shadow-md cursor-pointer rounded-xl relative overflow-hidden ${styles.CommonCard}`}
      onClick={() => router.push(`${redirectUrl}?id=${id}&name=${name}&desc=${introduction}`)}
    >
      <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
        <Dropdown overlay={menu} trigger={['click']} key={`dropdown-${id}`} placement="bottomRight">
          <div className="cursor-pointer">
            <Icon type="sangedian-copy" className="text-xl" />
          </div>
        </Dropdown>
      </div>
      <div className="w-full h-[60px] relative">
        <Image alt="avatar" src={avatar} layout="fill" objectFit="cover" className="rounded-t-xl" />
      </div>
      <div className={`w-16 h-16 rounded-full flex justify-center items-center ${styles.iconContainer}`}>
        <Icon type={iconType} className="text-5xl" />
      </div>
      <div className="p-4 relative">
        <Meta
          title={name}
          description={
            <>
              <p className={`my-5 text-sm line-clamp-3 h-[60px] ${styles.desc}`}>{introduction}</p>
              <div className={`flex items-center justify-between ${entityStyles.footer}`}>
                {online !== undefined && (
                  <Tag
                    color={online ? 'green' : ''}
                    className={`${styles.statusTag} ${online ? styles.online : styles.offline}`}>
                    {online ? t('studio.on') : t('studio.off')}
                  </Tag>
                )}
                <div className={online === undefined ? "absolute bottom-4 right-4 text-xs" : entityStyles.info}>
                  <span className="pr-5">{t('skill.form.owner')}: {created_by}</span>
                  {/*<span>{t('skill.form.group')}: {Array.isArray(team_name) ? team_name.join(',') : '--'}</span>*/}
                </div>
              </div>
            </>
          }
        />
      </div>
    </Card>
  );
};

export default EntityCard;
