"use client";
import React, { useState, useEffect } from 'react';
import { Button, Input, Form, message, Spin, Popconfirm, Tabs, Select } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import { useSearchParams } from 'next/navigation';
import CustomTable from '@/components/custom-table';
import OperateModal from '@/components/operate-modal';
import { useRoleApi } from '@/app/system-manager/api/role';
import { Role, User } from '@/app/system-manager/types/role';
import TopSection from '@/components/top-section';
import PermissionTable from './permissionTable';
import RoleList from './roleList';

const { Search } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const RoleManagement: React.FC = () => {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [roleForm] = Form.useForm();
  const [addUserForm] = Form.useForm();

  const [roleList, setRoleList] = useState<Role[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [allUserList, setAllUserList] = useState<User[]>([]);
  const [tableData, setTableData] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [allUserLoading, setAllUserLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [selectedUserKeys, setSelectedUserKeys] = useState<React.Key[]>([]);
  const [permissionsCheckedKeys, setPermissionsCheckedKeys] = useState<{ [key: string]: string[] }>({});
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [activeTab, setActiveTab] = useState('1');

  const roleApi = useRoleApi();

  useEffect(() => {
    fetchRoles();
    handleTableChange(1, pageSize);
  }, []);

  useEffect(() => {
    if (selectedRole) fetchUsersByRole(selectedRole);
  }, [selectedRole]);

  const handleTableChange = (page: number, size?: number) => {
    const newPageSize = size || pageSize;
    const offset = (page - 1) * newPageSize;
    const paginatedData = userList.slice(offset, offset + newPageSize);

    setTableData(paginatedData);
    setCurrentPage(page);
    setPageSize(newPageSize);
    setTotal(userList.length);
  };

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const roles = await roleApi.getRoles({ params: { client_id: id } });
      setRoleList(roles);
      if (roles.length > 0) setSelectedRole(roles[0]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchUsersByRole = async (role: Role) => {
    setLoading(true);
    try {
      const users = await roleApi.getUsersByRole({ params: { role_id: role.id, client_id: id } });
      setUserList(users);
      handleTableChange(currentPage, pageSize);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setAllUserLoading(true);
    try {
      const users = await roleApi.getAllUser();
      setAllUserList(users);
    } catch (error) {
      console.error(`${t('common.fetchFailed')}:`, error);
    } finally {
      setAllUserLoading(false);
    }
  };

  const fetchRolePermissions = async (role: Role) => {
    setLoading(true);
    try {
      const permissions = await roleApi.getRolePermissions({ params: { role_id: role.id, client_id: id } });
      console.log('permissions', permissions);
    } catch (error) {
      console.error(`${t('common.fetchFailed')}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const showRoleModal = (role: Role | null = null) => {
    setIsEditingRole(!!role);
    if (role) {
      roleForm.setFieldsValue({ roleName: role.name });
    } else {
      roleForm.resetFields();
    }
    setRoleModalOpen(true);
  };

  const handleRoleModalSubmit = async () => {
    setModalLoading(true);
    try {
      await roleForm.validateFields();
      const roleName = roleForm.getFieldValue('roleName');
      if (isEditingRole && selectedRole) {
        await roleApi.updateRole({ client_id: id, role_id: selectedRole.id, name: roleName });
      } else {
        await roleApi.addRole({ client_id: id, name: roleName });
      }
      await fetchRoles();
      message.success(isEditingRole ? t('common.updateSuccess') : t('common.addSuccess'));
      setRoleModalOpen(false);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const onDeleteRole = async (role: Role) => {
    try {
      await roleApi.deleteRole(role.id);
      message.success(t('common.delSuccess'));
      await fetchRoles();
      if (selectedRole) await fetchUsersByRole(selectedRole);
    } catch (error) {
      console.error('Failed:', error);
      message.error(t('common.delFail'));
    }
  };

  const columns = [
    {
      title: t('system.user.form.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('system.user.form.group'),
      dataIndex: 'group',
      key: 'group',
    },
    {
      title: t('system.user.form.role'),
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => roles.join(', '),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: User) => (
        <Popconfirm
          title={t('common.delConfirm')}
          okText={t('common.confirm')}
          cancelText={t('common.cancel')}
          onConfirm={() => handleDeleteUser(record.id)}
        >
          <Button type="link"><DeleteOutlined />{t('common.delete')}</Button>
        </Popconfirm>
      ),
    },
  ];

  const handleDeleteUser = async (userId: string) => {
    try {
      await roleApi.deleteUser(userId);
      message.success(t('common.delSuccess'));
      fetchUsersByRole(selectedRole!);
    } catch (error) {
      console.error('Failed:', error);
      message.error(t('common.delFail'));
    }
  };

  const onSelectRole = (role: Role) => {
    setSelectedRole(role);
    fetchUsersByRole(role);
  };

  const handleConfirmPermissions = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      await roleApi.updateRolePermissions({
        id: selectedRole.id,
        keys: permissionsCheckedKeys
      });
      message.success(t('common.updateSuccess'));
    } catch (error) {
      console.error('Failed:', error);
      message.error(t('common.updateFail'));
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = (value: string) => {
    const filteredUsers = userList.filter((user) =>
      user.name.toLowerCase().includes(value.toLowerCase()) ||
      user.group.toLowerCase().includes(value.toLowerCase()) ||
      user.roles.some(role => role.toLowerCase().includes(value.toLowerCase()))
    );
    setUserList(filteredUsers);
    handleTableChange(1, pageSize);
  };

  const openUserModal = () => {
    if (!allUserList.length) fetchAllUsers();
    addUserForm.resetFields();
    setAddUserModalOpen(true);
  };

  const handleAddUser = async () => {
    setModalLoading(true);
    try {
      const values = await addUserForm.validateFields();
      await roleApi.addUser(values);
      message.success(t('common.addSuccess'));
      fetchUsersByRole(selectedRole!);
      handleTableChange(currentPage, pageSize);
      setAddUserModalOpen(false);
    } catch (error) {
      console.error('Failed:', error);
      message.error(t('common.addFail'));
    } finally {
      setModalLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (!selectedRole) return;
    if (key === '1') {
      fetchUsersByRole(selectedRole);
    } else {
      fetchRolePermissions(selectedRole);
    }
  };

  const permissionsData = [
    {
      key: '1',
      menu: 'Studio',
      children: [
        { key: '1-1', menu: 'Bot-list', operations: ['View', 'Add', 'Edit', 'Delete'] },
        { key: '1-2', menu: 'Bot-Setting', operations: ['View', 'Edit', 'Save & Publish'] },
        { key: '1-3', menu: 'Bot-Channel', operations: ['View', 'Setting'] }
      ]
    },
    {
      key: '2',
      menu: 'Knowledge',
      children: [
        { key: '2-1', menu: 'Knowledge-list', operations: ['View', 'Add', 'Edit', 'Delete'] },
        { key: '2-2', menu: 'Knowledge-Document', operations: ['View', 'Add', 'Set', 'Train', 'Delete'] }
      ]
    }
  ];

  return (
    <div className="w-full">
      <TopSection title={t('system.group.title')} content={t('system.group.desc')} />
      <div className="flex mt-4 w-full" style={{ height: 'calc(100vh - 195px)' }}>
        <RoleList
          loadingRoles={loadingRoles}
          roleList={roleList}
          selectedRole={selectedRole}
          onSelectRole={onSelectRole}
          showRoleModal={showRoleModal}
          onDeleteRole={onDeleteRole}
          t={t}
        />
        <div className="flex-1 p-4 overflow-hidden bg-[var(--color-bg-1)] rounded-md">
          <Tabs defaultActiveKey="1" activeKey={activeTab} onChange={handleTabChange}>
            <TabPane tab={t('system.role.users')} key="1">
              <div className="flex justify-end mb-4">
                <Search
                  allowClear
                  enterButton
                  className='w-60 mr-[8px]'
                  onSearch={handleUserSearch}
                  placeholder={`${t('common.search')}`}
                />
                <Button
                  className="mr-[8px]"
                  type="primary"
                  onClick={openUserModal}
                >
                  +{t('common.add')}
                </Button>
                <Button
                  onClick={() => console.log('Delete selected users')}
                  disabled={selectedUserKeys.length === 0}
                >
                  {t('system.common.modifydelete')}
                </Button>
              </div>
              <Spin spinning={loading}>
                <CustomTable
                  scroll={{ y: 'calc(100vh - 370px)' }}
                  rowSelection={{
                    selectedRowKeys: selectedUserKeys,
                    onChange: (selectedRowKeys) => setSelectedUserKeys(selectedRowKeys as React.Key[]),
                  }}
                  columns={columns}
                  dataSource={tableData}
                  rowKey={(record) => record.id}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    onChange: handleTableChange,
                  }}
                />
              </Spin>
            </TabPane>
            <TabPane tab={t('system.role.permissions')} key="2">
              <div className="flex justify-end items-center mb-4">
                <Button type="primary" onClick={handleConfirmPermissions}>{t('common.confirm')}</Button>
              </div>
              <PermissionTable
                t={t}
                loading={loading}
                permissionsData={permissionsData}
                permissionsCheckedKeys={permissionsCheckedKeys}
                setPermissionsCheckedKeys={(keyMap) => setPermissionsCheckedKeys(keyMap)}
              />
            </TabPane>
          </Tabs>
        </div>
      </div>

      <OperateModal
        title={isEditingRole ? t('system.role.updateRole') : t('system.role.addRole')}
        closable={false}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        okButtonProps={{ loading: modalLoading }}
        cancelButtonProps={{ disabled: modalLoading }}
        open={roleModalOpen}
        onOk={handleRoleModalSubmit}
        onCancel={() => setRoleModalOpen(false)}
      >
        <Form form={roleForm}>
          <Form.Item
            name="roleName"
            label={t('system.role.name')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Input placeholder={t('system.role.name')} />
          </Form.Item>
        </Form>
      </OperateModal>

      <OperateModal
        title={t('system.role.addUser')}
        closable={false}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        okButtonProps={{ loading: modalLoading }}
        cancelButtonProps={{ disabled: modalLoading }}
        open={addUserModalOpen}
        onOk={handleAddUser}
        onCancel={() => setAddUserModalOpen(false)}
      >
        <Form form={addUserForm}>
          <Form.Item
            name="users"
            label={t('system.role.users')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Select
              mode="multiple"
              disabled={allUserLoading}
              loading={allUserLoading}
              placeholder={`${t('common.select')} ${t('system.role.users')}`}
            >
              {allUserList.map(user => (
                <Option key={user.id} value={user.id}>{user.username}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </OperateModal>
    </div>
  );
};

export default RoleManagement;
