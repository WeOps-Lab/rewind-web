import React from 'react';
import { Tag} from 'antd';
import { useTranslation } from '@/utils/i18n';
interface RoleDescriptionProps {
  modifyRoleSelect: boolean;
}

const RoleDescription: React.FC<RoleDescriptionProps> = ({ modifyRoleSelect }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-4">
      <Tag>
        {modifyRoleSelect ? (
          <div className="p-2 text-[var(--color-text-3)]">
            <p>{t("system.users.admin.title")}</p>
            <p>{t("system.users.admin.desc1")}</p>
            <p>{t("system.users.admin.desc2")}</p>
          </div>
        ) : (<div className="p-2 text-[var(--color-text-3)]">
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
