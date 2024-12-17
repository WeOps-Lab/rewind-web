'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Input, message, Modal, Tree, Button } from 'antd';
import { Flex, Tag, TreeDataNode } from 'antd';
import type { TableColumnsType } from 'antd';
import TopSection from '@/components/top-section';
import UserModal, { ModalRef } from './userModal';
import { useTranslation } from '@/utils/i18n';
import { getRandomColor } from '@/app/system-manager/utils';
import CustomTable from '@/components/custom-table';
import { useUsernamegeApi } from "@/app/system-manager/api/users/index";
import { OriginalGroup } from "@/app/system-manager/types/groups";
import { UserDataType, TableRowSelection } from '@/app/system-manager/types/users';
import userInfoStyle from './index.module.scss';

const { Search } = Input;

const User = () => {
  const [tabledata, setTableData] = useState<UserDataType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [treeData, setTreaData] = useState<TreeDataNode[]>();

  const modifydeleteuseref = useRef<HTMLButtonElement>(null);
  const modifyroleuseref = useRef<HTMLButtonElement>(null);
  const userRef = useRef<ModalRef>(null);

  const { t } = useTranslation();
  const { confirm } = Modal;
  const { getuserslistApi, getorgtreeApi, deleteUserApi } = useUsernamegeApi();

  // 用户表格数据
  const columns: TableColumnsType<any> = [
    {
      title: t('system.users.table.username'),
      dataIndex: 'username',
      width: 185,
      fixed: 'left',
      render: (text) => {
        const color = getRandomColor();
        return (
          <div className="flex" style={{ height: '17px', lineHeight: '17px' }}>
            <span
              className="h-5 w-5 rounded-[10px] text-center mr-1"
              style={{ color: '#ffffff', backgroundColor: color }}
            >
              {text?.substring(0, 1)}
            </span>
            <span>{text}</span>
          </div>
        );
      },
    },
    { title: t('system.users.table.name'), dataIndex: 'name', width: 100 },
    { title: t('system.users.table.email'), dataIndex: 'email', width: 185 },
    { title: t('system.users.table.number'), dataIndex: 'number', width: 110 },
    { title: t('system.users.table.team'), dataIndex: 'team', width: 80 },
    {
      title: t('system.users.table.role'),
      dataIndex: 'role',
      width: 110,
      render: (text) => {
        const color = text === 'Administrator' ? 'green' : 'processing';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: t('common.actions'),
      dataIndex: 'key',
      width: 150,
      fixed: 'right',
      render: (key) => (
        <>
          <Button
            onClick={() => handleEditUser(key)}
            color="primary"
            variant="link"
          >
            {t('common.edit')}
          </Button>
          <Button
            color="primary"
            variant="link"
            onClick={() => showDeleteConfirm(key)}
          >
            {t('common.delete')}
          </Button>
        </>
      ),
    },
  ];

  const fetchUsers = async () => {
    const params = {
      search: searchValue,
      page: currentPage,
      page_size: pageSize
    }
    try {
      const res = await getuserslistApi(params);
      const data = res.users.map((item: UserDataType) => ({
        key: item.id,
        username: item.username,
        name: item.firstName,
        email: item.email,
        number: item.createdTimestamp,
        team: 'refdh',
        role: 'fhdhf',
      }));
      setTableData(data);
      setTotal(res.count);
    } catch (error) {
      console.error(t('common.fetchFailed'), error);
      message.error(t('common.fetchFailed'));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchValue, currentPage, pageSize]);

  useEffect(() => {
    getorgtreeApi()
      .then((res) => setTreaData(convertGroups(res) as TreeDataNode[]))
      .catch((error) => console.error(t('common.fetchFailed'), error));
  }, []);

  useEffect(() => {
    const isDisabled = selectedRowKeys.length === 0;
    modifydeleteuseref.current?.setAttribute('disabled', isDisabled.toString());
    modifyroleuseref.current?.setAttribute('disabled', isDisabled.toString());
  }, [selectedRowKeys]);

  const handleEditUser = (key: string) => {
    const user = getuser(key);
    if (user) {
      openUerModal('edit', user);
    }
  };

  const convertGroups = (groups: OriginalGroup[]): TreeDataNode[] => {
    return groups.map((group) => ({
      key: group.id,
      title: group.name,
      children: group.subGroups.length ? convertGroups(group.subGroups) : []
    }));
  };

  const getuser = (key: string) => {
    return tabledata.find((item) => item.key === key);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const showDeleteConfirm = (key: string) => {
    confirm({
      title: t('common.delConfirm'),
      content: t('common.delConfirmCxt'),
      centered: true,
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      async onOk() {
        try {
          await deleteUserApi(key);
          fetchUsers();
          message.success(t('common.delSuccess'));
        } catch (error) {
          console.error(t('common.delFailed'), error);
          message.error(t('common.delFailed'));
        }
      },
    });
  };

  const showDeleteTeamConfirm = () => {
    confirm({
      title: t('common.delConfirm'),
      content: t('common.delConfirmCxt'),
      centered: true,
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      async onOk() {
        try {
          const promises = selectedRowKeys.map(key => deleteUserApi(key as string));
          await Promise.all(promises);
          setSelectedRowKeys([]);
          fetchUsers();
          message.success(t('common.delSuccess'));
        } catch (error) {
          console.error(t('common.delFailed'), error);
          message.error(t('common.delFailed'));
        }
      },
    });
  };

  const openUerModal = (type: string, row: UserDataType) => {
    userRef.current?.showModal({
      type,
      form: row,
    });
  };

  const onSuccessUserModal = () => {
    message.success("Operation successful!");
    fetchUsers();
  };

  const handleInputSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  return (
    <div className={`${userInfoStyle.userInfo} w-full`}>
      <TopSection title={t('system.users.title')} content={t('system.users.desc')} />
      <div className={`flex w-full overflow-hidden mt-4`} style={{ height: 'calc(100vh - 195px)' }}>
        <div className={`${userInfoStyle.bgColor} p-4 w-[230px] flex-shrink-0 flex flex-col justify-items-center items-center rounded-md mr-[17px]`}>
          <Input className="w-[204px]" placeholder={`${t('common.search')}...`} />
          <Tree
            className="w-[230px] mt-4 overflow-auto px-3"
            showLine
            expandAction={false}
            multiple
            showIcon={false}
            defaultExpandAll
            treeData={treeData}
          />
        </div>
        <div className={`flex-1 h-full rounded-md overflow-hidden p-4 ${userInfoStyle.bgColor}`}>
          <div className="w-full mb-4">
            <div className="flex justify-end">
              <Search
                allowClear
                enterButton
                className='w-60 mr-[8px]'
                onSearch={handleInputSearchChange}
                placeholder={`${t('common.search')}...`}
              />
              <Button
                className="mr-[8px]"
                type="primary"
                onClick={() => {
                  openUerModal('add', {
                    username: '',
                    name: '',
                    email: '',
                    number: '',
                    team: 'Team1',
                    role: 'Normal users',
                    key: ''
                  });
                }}
              >
                +{t('common.add')}
              </Button>
              <UserModal ref={userRef} onSuccess={onSuccessUserModal} />
              <Button
                ref={modifyroleuseref}
                className="mr-[8px] op-8"
                onClick={() => {
                  openUerModal('modifyrole', {
                    username: '',
                    name: '',
                    email: '',
                    number: '',
                    team: 'Team1',
                    role: 'Normal users',
                    key: ''
                  });
                }}
              >
                {t('system.common.modifyrole')}
              </Button>
              <Button
                ref={modifydeleteuseref}
                onClick={showDeleteTeamConfirm}
              >
                {t('system.common.modifydelete')}
              </Button>
            </div>
          </div>
          <Flex gap="middle" vertical>
            <CustomTable
              scroll={{ y: 'calc(100vh - 370px)' }}
              pagination={{
                pageSize,
                current: currentPage,
                total,
                showSizeChanger: true,
                onChange: handleTableChange,
              }}
              columns={columns}
              dataSource={tabledata}
              rowSelection={rowSelection}
            />
          </Flex>
        </div>
      </div>
    </div>
  );
};

export default User;
