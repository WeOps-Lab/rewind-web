import React from 'react';
import { Tag} from 'antd';
import roledescriptionStyle from'./index.module.scss';
interface RoleDescriptionProps {
  modifyRoleSelect: boolean;
}

const RoleDescription: React.FC<RoleDescriptionProps> = ({ modifyRoleSelect }) => {

  return (
    <div className={`${roledescriptionStyle.tagheight}`}>
      <Tag className={`${roledescriptionStyle.roledescriptionStyle}`}>
        {modifyRoleSelect ? (
          <div className='w-[349px] h-[106px]'>
            <p>The administrator has the following permissions:</p>
            <p> 1.Manage organizations and users in system settings.</p>
            <p> 2.Have the highest privileges in other apps, possessing access to all data and the ability to perform all functionality operations.</p>
          </div>
        ) : (<div className='w-[349px] h-[106px]'>
          <p> Normal  users have the following permissions:</p>
          <p> 1. Cannot manage organizations and users.</p>
          <p>2. In other apps, have data access rights only for their own organization.</p>
          <p> 3. In other apps, have only operational permissions for using pages, with management pages having view-only access.</p>
        </div>
        )}
      </Tag>
    </div>
  );
};

export default RoleDescription;