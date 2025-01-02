"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Input, message, Modal, Tree, Button, Spin, Tag } from 'antd';
import type { DataNode as TreeDataNode } from 'antd/lib/tree';
import { ColumnsType } from 'antd/es/table';
import TopSection from '@/components/top-section';
import UserModal, { ModalRef } from './userModal';
import { useTranslation } from '@/utils/i18n';
import { getRandomColor } from '@/app/system-manager/utils';
import CustomTable from '@/components/custom-table';
import { useUserApi } from '@/app/system-manager/api/user/index';
import { OriginalGroup } from '@/app/system-manager/types/group';
import { UserDataType, TableRowSelection } from '@/app/system-manager/types/user';
import userInfoStyle from './index.module.scss';

const { Search } = Input;

const User: React.FC = () => {
  const [tableData, setTableData] = useState<UserDataType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isDeleteDisabled, setIsDeleteDisabled] = useState<boolean>(true);
  const [searchValue, setSearchValue] = useState<string>(''); // 右侧表格搜索
  const [treeSearchValue, setTreeSearchValue] = useState<string>(''); // 左侧树搜索
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
  const [filteredTreeData, setFilteredTreeData] = useState<TreeDataNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const userModalRef = useRef<ModalRef>(null);

  const { t } = useTranslation();
  const { confirm } = Modal;
  const { getUsersList, getOrgTree, deleteUser } = useUserApi();

  const columns: ColumnsType<UserDataType> = [
    {
      title: t('system.user.table.username'),
      dataIndex: 'username',
      width: 185,
      fixed: 'left',
      render: (text: string) => {
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
    {
      title: t('system.user.table.lastName'),
      dataIndex: 'name',
      width: 100
    },
    {
      title: t('system.user.table.email'),
      dataIndex: 'email',
      width: 185
    },
    {
      title: t('system.user.table.number'),
      dataIndex: 'number',
      width: 110
    },
    {
      title: t('system.user.table.role'),
      dataIndex: 'role',
      width: 110,
      render: (text: string) => {
        const color = text === 'Administrator' ? 'green' : 'processing';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: t('common.actions'),
      dataIndex: 'key',
      width: 150,
      fixed: 'right',
      render: (key: string) => (
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

  const fetchUsers = async (params: any = {}) => {
    setLoading(true);
    try {
      const res = await getUsersList(params);
      const data = res.users.map((item: UserDataType) => ({
        key: item.id,
        username: item.username,
        name: item.lastName,
        email: item.email,
        role: item.role,
      }));
      setTableData(data);
      setTotal(res.count);
    } catch (error) {
      console.error(t('common.fetchFailed'), error);
      message.error(t('common.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTreeData = async () => {
    try {
      const res = await getOrgTree();
      const convertedGroups = convertGroups(res);
      setTreeData(convertedGroups);
      setFilteredTreeData(convertedGroups);
    } catch (error) {
      console.error(t('common.fetchFailed'), error);
      message.error(t('common.fetchFailed'));
    }
  };

  useEffect(() => {
    fetchUsers({ search: searchValue, page: currentPage, page_size: pageSize });
  }, [currentPage, pageSize, searchValue]);

  useEffect(() => {
    fetchTreeData();
  }, []);

  useEffect(() => {
    setIsDeleteDisabled(selectedRowKeys.length === 0);
  }, [selectedRowKeys]);

  const handleTreeSelect = (selectedKeys: React.Key[]) => {
    fetchUsers({ search: searchValue, page: currentPage, page_size: pageSize, group_id: selectedKeys[0] });
  };

  const handleEditUser = (key: React.Key) => {
    const user = getUser(key.toString());
    if (user) {
      openUserModal('edit', {
        ...user,
        lastName: user.name || '',
        roles: user.role?.split(',').map(role => ({ id: role, name: role })) || []
      });
    }
  };

  const convertGroups = (groups: OriginalGroup[]): TreeDataNode[] => {
    return groups.map((group) => ({
      key: group.id,
      title: group.name,
      children: group.subGroups ? convertGroups(group.subGroups) : []
    }));
  };

  const getUser = (key: string) => {
    return tableData.find((item: any) => item.key === key);
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
          await deleteUser(key);
          fetchUsers({ search: searchValue, page: currentPage, page_size: pageSize });
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
          const promises = selectedRowKeys.map(key => deleteUser(key as string));
          await Promise.all(promises);
          setSelectedRowKeys([]);
          fetchUsers({ search: searchValue, page: currentPage, page_size: pageSize });
          message.success(t('common.delSuccess'));
        } catch (error) {
          console.error(t('common.delFailed'), error);
          message.error(t('common.delFailed'));
        }
      },
    });
  };

  const openUserModal = (type: 'add' | 'edit', row: UserDataType) => {
    userModalRef.current?.showModal({
      type,
      form: row,
    });
  };

  const onSuccessUserModal = () => {
    message.success("Operation successful!");
    fetchUsers({ search: searchValue, page: currentPage, page_size: pageSize });
  };

  const handleTreeSearchChange = (value: string) => {
    setTreeSearchValue(value);
    filterTreeData(value);
  };

  const handleUserSearch = (value: string) => {
    setSearchValue(value);
    fetchUsers({ search: value, page: currentPage, page_size: pageSize });
  };

  const filterTreeData = (value: string) => {
    const filterFunc = (data: TreeDataNode[], searchQuery: string): TreeDataNode[] => {
      return data.reduce<TreeDataNode[]>((acc, item) => {
        const children = item.children ? filterFunc(item.children, searchQuery) : [];
        if ((item.title as string).toLowerCase().includes(searchQuery.toLowerCase()) || children.length) {
          acc.push({ ...item, children });
        }
        return acc;
      }, []);
    };

    const filteredTree = filterFunc(treeData, value);
    setFilteredTreeData(filteredTree);
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  return (
    <div className={`${userInfoStyle.userInfo} w-full`}>
      <TopSection title={t('system.user.title')} content={t('system.user.desc')} />
      <div className={`flex w-full overflow-hidden mt-4`} style={{ height: 'calc(100vh - 195px)' }}>
        <div className={`${userInfoStyle.bgColor} p-4 w-[230px] flex-shrink-0 flex flex-col justify-items-center items-center rounded-md mr-[17px]`}>
          <Input
            className="w-[204px]"
            placeholder={`${t('common.search')}...`}
            onChange={e => handleTreeSearchChange(e.target.value)}
            value={treeSearchValue}
          />
          <Tree
            className="w-[230px] mt-4 overflow-auto px-3"
            showLine
            expandAction={false}
            showIcon={false}
            defaultExpandAll
            treeData={filteredTreeData}
            onSelect={handleTreeSelect}
          />
        </div>
        <div className={`flex-1 h-full rounded-md overflow-hidden p-4 ${userInfoStyle.bgColor}`}>
          <div className="w-full mb-4">
            <div className="flex justify-end">
              <Search
                allowClear
                enterButton
                className='w-60 mr-[8px]'
                onSearch={handleUserSearch}
                placeholder={`${t('common.search')}...`}
              />
              <Button
                className="mr-[8px]"
                type="primary"
                onClick={() => {
                  openUserModal('add', {
                    username: '',
                    lastName: '',
                    email: '',
                    name: '',
                    groups: [],
                    roles: [],
                    key: ''
                  });
                }}
              >
                +{t('common.add')}
              </Button>
              <UserModal ref={userModalRef} treeData={treeData} onSuccess={onSuccessUserModal} />
              <Button
                onClick={showDeleteTeamConfirm}
                disabled={isDeleteDisabled}
              >
                {t('system.common.modifydelete')}
              </Button>
            </div>
          </div>
          <Spin spinning={loading}>
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
              dataSource={tableData}
              rowSelection={rowSelection}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default User;
