import React from 'react';
import { Tag} from 'antd';
import roledescriptionStyle from'./index.module.scss';
interface RoleDescriptionProps {
  modifyRoleSelect: boolean;
}

const RoleDescription: React.FC<RoleDescriptionProps> = ({ modifyRoleSelect }) => {

  return (
    <Tag className={`${roledescriptionStyle.roledescriptionStyle}`}>
      {modifyRoleSelect ? (
        <div className='font-normal w-[380px] h-[106px]'>
        The administrator has the following permissions:<br/>
         
         1.Manage organizations and users in system settings.<br/>
        
         2.Have the highest privileges in other apps, poss-<br/>essing access to all data and the ability to perform <br/> all functionality operations.
        </div>
      ) : (<div className='font-normal w-[380px] h-[106px]'>
        normal  users have the following permissions: <br/>
         
        1. Cannot manage organizations and users. <br/>
        
        2. In other apps, have data access rights only for th-<br/>eir own organization. <br/>

        3. In other apps, have only operational permissions <br/>for using pages, with management pages having view-on-<br/>ly access.
      </div>
      )}
    </Tag>
  );
};

export default RoleDescription;