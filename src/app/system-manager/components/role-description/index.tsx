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
            <p>{t("role.administrator.title")}</p>
            <p>{t("role.administrator.desc1")}</p>
            <p>{t("role.administrator.desc2")}</p>
          </div>
        ) : (<div className='w-[349px] h-[106px]'>
          <p>{t("role.normalusers.title")}</p>
          <p>{t("role.normalusers.desc1")}</p>
          <p>{t("role.normalusers.desc2")}</p>
          <p>{t("role.normalusers.desc3")}</p>
        </div>
        )}
      </Tag>
    </div>
  );
};

export default RoleDescription;