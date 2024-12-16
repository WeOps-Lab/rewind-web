import React from 'react';
import { Tag} from 'antd';
import roledescriptionStyle from'./index.module.scss';
import { useTranslation } from '@/utils/i18n';
interface RoleDescriptionProps {
  modifyRoleSelect: boolean;
}

const RoleDescription: React.FC<RoleDescriptionProps> = ({ modifyRoleSelect }) => {
  const { t } = useTranslation();
  return (
    <div className={`${roledescriptionStyle.tagheight}`}>
      <Tag className={`${roledescriptionStyle.roledescriptionStyle}`}>
        {modifyRoleSelect ? (
          <div className='w-[349px] h-[106px]'>
            <p>{t("system.users.admin.title")}</p>
            <p>{t("system.users.admin.desc1")}</p>
            <p>{t("system.users.admin.desc2")}</p>
          </div>
        ) : (<div className='w-[349px] h-[106px]'>
          <p>{t("system.users.normal.title")}</p>
          <p>{t("system.users.normal.desc1")}</p>
          <p>{t("system.users.normal.desc2")}</p>
          <p>{t("system.users.normal.desc3")}</p>
        </div>
        )}
      </Tag>
    </div>
  );
};

export default RoleDescription;
