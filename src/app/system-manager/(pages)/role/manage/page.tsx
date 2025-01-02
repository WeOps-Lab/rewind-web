'use client';
import React, { useState, useEffect } from 'react';
import { Button, Input, Form, message, Spin, Popconfirm, Table, Tabs, Checkbox, TableColumnType } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import OperateModal from '@/components/operate-modal';
import { useRoleApi } from '@/app/system-manager/api/role';
import { Role, User } from '@/app/system-manager/types/role';
import TopSection from '@/components/top-section';

const { Search } = Input;
const { TabPane } = Tabs;

const RoleManagement: React.FC = () => {
  const [addRoleForm] = Form.useForm();
  const [renameRoleForm] = Form.useForm();

  const [roleList, setRoleList] = useState<Role[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);
  const [renameRoleModalOpen, setRenameRoleModalOpen] = useState(false);
  const [selectedUserKeys, setSelectedUserKeys] = useState<string[]>([]);
  const [permissionsCheckedKeys, setPermissionsCheckedKeys] = useState<{ [key: string]: string[] }>({});

  const { t } = useTranslation();
  const { getRoles, addRole, updateRole, deleteRole, getUsersByRole, updatePermissions } = useRoleApi();

  useEffect(() => {
    const initialRoles: Role[] = [
      { id: '1', name: 'Admin' },
      { id: '2', name: 'Editor' },
      { id: '3', name: 'Viewer' }
    ];
    const initialUsers: User[] = [
      { id: '1', name: 'User A', group: 'Group A', roles: ['Admin'] },
      { id: '2', name: 'User B', group: 'Group B', roles: ['Editor'] },
      { id: '3', name: 'User C', group: 'Group C', roles: ['Viewer'] }
    ];
    setRoleList(initialRoles);
    setUserList(initialUsers);
    setSelectedRole(initialRoles[0]);
  }, []);

  useEffect(() => {
    if (selectedRole) {
      fetchUsersByRole(selectedRole);
    }
  }, [selectedRole]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const roles = await getRoles();
      setRoleList(roles);
      if (roles.length > 0) setSelectedRole(roles[0]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByRole = async (role: Role) => {
    setLoading(true);
    try {
      const users = await getUsersByRole(role.id);
      setUserList(users);
    } finally {
      setLoading(false);
    }
  };

  const addRoleHandler = () => {
    setAddRoleModalOpen(true);
    addRoleForm.resetFields();
  };

  const onAddRole = async () => {
    setModalLoading(true);
    try {
      await addRoleForm.validateFields();
      const roleName = addRoleForm.getFieldValue('roleName');
      await addRole({ name: roleName });
      await fetchRoles();
      message.success(t('common.addSuccess'));
      setAddRoleModalOpen(false);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const renameRoleHandler = (role: Role) => {
    setRenameRoleModalOpen(true);
    renameRoleForm.setFieldsValue({ roleName: role.name });
  };

  const onRenameRole = async () => {
    setModalLoading(true);
    try {
      await renameRoleForm.validateFields();
      const newName = renameRoleForm.getFieldValue('roleName');
      if (selectedRole) {
        await updateRole({ id: selectedRole.id, name: newName });
      }
      await fetchRoles();
      if (selectedRole) await fetchUsersByRole(selectedRole);
      message.success(t('common.updateSuccess'));
      setRenameRoleModalOpen(false);
    } catch (error) {
      console.error('Failed:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const onDeleteRole = (role: Role) => {
    deleteRole(role.id)
      .then(async () => {
        message.success(t('common.delSuccess'));
        await fetchRoles();
        if (selectedRole) await fetchUsersByRole(selectedRole);
      })
      .catch((error) => {
        console.error('Failed:', error);
        message.error(t('common.delFail'));
      });
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
      render: (_: string, record: User) => (
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
    // Implement user delete logic here
    console.log('Delete user:', userId);
    message.success(t('common.delSuccess'));
  };

  const renderRoleItem = (role: Role) => (
    <div key={role.id} className="flex items-center justify-between p-2 bg-gray-100 mb-1">
      <div className="cursor-pointer" onClick={() => onSelectRole(role)}>{role.name}</div>
      <div>
        <Button type="link" onClick={() => renameRoleHandler(role)}><EditOutlined /></Button>
        <Popconfirm
          title={t('common.delConfirm')}
          okText={t('common.confirm')}
          cancelText={t('common.cancel')}
          onConfirm={() => onDeleteRole(role)}
        >
          <Button type="link"><DeleteOutlined /></Button>
        </Popconfirm>
      </div>
    </div>
  );

  const onSelectRole = (role: Role) => {
    setSelectedRole(role);
    fetchUsersByRole(role);
  };

  const permissionsData = [
    {
      key: '1',
      menu: 'Studio',
      operations: ['View', 'Add', 'Edit', 'Delete'],
      children: [
        { key: '1-1', menu: 'Bot-list', operations: ['View', 'Add', 'Edit', 'Delete'] },
        { key: '1-2', menu: 'Bot-Setting', operations: ['View', 'Edit', 'Save & Publish'] },
        { key: '1-3', menu: 'Bot-Channel', operations: ['View', 'Setting'] }
      ]
    },
    {
      key: '2',
      menu: 'Knowledge',
      operations: [],
      children: [
        { key: '2-1', menu: 'Knowledge-list', operations: ['View', 'Add', 'Edit', 'Delete'] },
        { key: '2-2', menu: 'Knowledge-Document', operations: ['View', 'Add', 'Set', 'Train', 'Delete'] }
      ]
    }
  ];

  const getAllOperationKeys = (record: any): string[] => {
    let keys = [...record.operations];
    if (record.children) {
      record.children.forEach((child: any) => {
        keys = keys.concat(getAllOperationKeys(child));
      });
    }
    return keys;
  };

  const updateCheckedKeys = (record: any, checked: boolean, prevState: { [key: string]: string[] }) => {
    const newCheckedKeys = { ...prevState };

    const handleOperations = (key: string, operations: string[], isChecked: boolean) => {
      if (isChecked) {
        newCheckedKeys[key] = [...new Set([...(newCheckedKeys[key] || []), ...operations])];
      } else {
        newCheckedKeys[key] = [];
      }
    };

    const handleChildren = (nodes: any[], isChecked: boolean) => {
      nodes.forEach((node) => {
        handleOperations(node.key, node.operations, isChecked);
        if (node.children) {
          handleChildren(node.children, isChecked);
        }
      });
    };

    handleOperations(record.key, record.operations, checked);
    if (record.children) {
      handleChildren(record.children, checked);
    }

    return newCheckedKeys;
  };

  const handleMenuCheckboxChange = (record: any, checked: boolean) => {
    setPermissionsCheckedKeys((prevState) => {
      const newCheckedKeys = updateCheckedKeys(record, checked, prevState);
      return { ...newCheckedKeys, [record.key]: checked ? getAllOperationKeys(record) : [] };
    });
  };

  const handleOperationCheckboxChange = (menuKey: string, operation: string, checked: boolean) => {
    setPermissionsCheckedKeys((prevState) => ({
      ...prevState,
      [menuKey]: checked
        ? [...(prevState[menuKey] || []), operation]
        : (prevState[menuKey] || []).filter((op) => op !== operation)
    }));
  };

  const renderPermissionTable = (data: any[]) => {
    const columns: TableColumnType<any>[] = [
      {
        title: t('system.permissions.menu'),
        dataIndex: 'menu',
        key: 'menu',
        render: (text: string, record: any) => (
          <Checkbox
            onChange={(e) => handleMenuCheckboxChange(record, e.target.checked)}
            checked={permissionsCheckedKeys[record.key]?.length > 0}
          >
            {text}
          </Checkbox>
        )
      },
      {
        title: t('system.permissions.operation'),
        dataIndex: 'operations',
        key: 'operations',
        render: (operations: string[], record: any) => (
          <div className="flex space-x-2">
            {operations.map((operation) => (
              <Checkbox
                key={operation}
                onChange={(e) => handleOperationCheckboxChange(record.key, operation, e.target.checked)}
                checked={permissionsCheckedKeys[record.key]?.includes(operation) || false}
              >
                {operation}
              </Checkbox>
            ))}
          </div>
        )
      }
    ];

    return <Table columns={columns} dataSource={data} expandable={{ childrenColumnName: 'children' }} pagination={false} />;
  };

  const handleConfirmPermissions = async () => {
    if (!selectedRole) return;

    setLoading(true);
    try {
      await updatePermissions(selectedRole.id, permissionsCheckedKeys);
      message.success(t('common.updateSuccess'));
    } catch (error) {
      console.error('Failed:', error);
      message.error(t('common.updateFail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <TopSection title={t('system.group.title')} content={t('system.group.desc')} />

      <div className="flex mt-4">
        <div className="w-1/4 p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h2>{t('system.role.title')}</h2>
            <Button type="primary" onClick={addRoleHandler}><PlusOutlined /> {t('common.add')}</Button>
          </div>
          <div>{roleList.map(renderRoleItem)}</div>
        </div>

        <div className="w-3/4 p-4 bg-white">
          <Tabs defaultActiveKey="1">
            <TabPane tab={t('system.role.users')} key="1">
              <div className="flex justify-between items-center mb-4">
                <h2>{t('system.user.title')}</h2>
                <Search placeholder={t('common.search')} onSearch={(value) => console.log(value)} className="max-w-xs" />
              </div>
              <Spin spinning={loading}>
                <Table
                  rowSelection={{
                    selectedRowKeys: selectedUserKeys,
                    onChange: (selectedRowKeys) => setSelectedUserKeys(selectedRowKeys as string[]),
                  }}
                  columns={columns}
                  dataSource={userList}
                  rowKey={(record) => record.id}
                  pagination={{ pageSize: 5 }}
                />
              </Spin>
            </TabPane>
            <TabPane tab={t('system.role.permissions')} key="2">
              <div className="flex justify-between items-center mb-4">
                <h2>{t('system.role.permissions')}</h2>
                <Button type="primary" onClick={handleConfirmPermissions}>{t('common.confirm')}</Button>
              </div>
              <div className="p-4 bg-white">
                {renderPermissionTable(permissionsData)}
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>

      <OperateModal
        title={t('system.role.add')}
        closable={false}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        okButtonProps={{ loading: modalLoading }}
        cancelButtonProps={{ disabled: modalLoading }}
        open={addRoleModalOpen}
        onOk={onAddRole}
        onCancel={() => setAddRoleModalOpen(false)}
      >
        <Form form={addRoleForm}>
          <Form.Item
            name="roleName"
            label={t('system.role.form.name')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Input placeholder={t('system.role.form.inputName')} />
          </Form.Item>
        </Form>
      </OperateModal>

      <OperateModal
        title={t('system.role.rename')}
        closable={false}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        okButtonProps={{ loading: modalLoading }}
        cancelButtonProps={{ disabled: modalLoading }}
        open={renameRoleModalOpen}
        onOk={onRenameRole}
        onCancel={() => setRenameRoleModalOpen(false)}
      >
        <Form form={renameRoleForm}>
          <Form.Item
            name="roleName"
            label={t('system.role.form.name')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Input placeholder={t('system.role.form.inputName')} />
          </Form.Item>
        </Form>
      </OperateModal>
    </div>
  );
};

export default RoleManagement;
