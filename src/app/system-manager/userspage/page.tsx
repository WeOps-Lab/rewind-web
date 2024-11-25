'use client';
import React from 'react';
import { Input, Form, Radio, Select, message, Popconfirm } from 'antd';
import { Tree } from 'antd';
import { Button, ConfigProvider } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { getRandomColor } from '../utils/common';
import IntroductionInfo from '../components/introduction-info';
import OperateModal from '@/components/operate-modal';
import { Flex, Table, Tag } from 'antd';
import type { PopconfirmProps, RadioChangeEvent } from 'antd';
import type { TreeDataNode } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import userInfoStyle from './index.module.scss';
import { useTranslation } from '@/utils/i18n';
import useApiClient from '@/utils/request';
import RoleDescription from "../components/role-description";




// 定义接口
interface DataType {
  key: React.Key;
  username: string;
  name: string;
  email: string;
  number: string;
  team: string;
  role: string;
}

interface Access {
  manageGroupMembership: boolean;
  view: boolean;
  mapRoles: boolean;
  impersonate: boolean;
  manage: boolean;
}

// 定义 BruteForceStatus 接口
interface BruteForceStatus {
  numFailures: number;
  disabled: boolean;
  lastIPFailure: string;
  lastFailure: number;
}

// 定义 User 接口
interface User {
  id: string;
  createdTimestamp: number;
  username: string;
  enabled: boolean;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  Number: string;
  email: string;
  access: Access;
  team: string;
  role: string;
  bruteForceStatus: BruteForceStatus;
}

// 定义组织列表的接口


type TableRowSelection<T extends object = object> =
  TableProps<T>['rowSelection'];

const User = () => {
  //hook函数
  const [tabledata, setTableData] = useState<DataType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  //控制Modal的打开和关闭
  const [addmodalOpen, setAddModalOpen] = useState(false);
  //编辑的Modal的打开和关闭
  const [editmodelOpen, setEditmodalOpen] = useState(false);
  //控制修改角色的弹窗
  const [modalVisible, setModalVisible] = useState(false);
  //主要控制选中的用户名
  const [username, setUsername] = useState(['zhangsan']);
  const [modifyRoleOpen, setModifyRoleOpen] = useState<boolean>(false);
  const [editkey, setEditkey] = useState(1);
  const [edituseName, setEdituseName] = useState<string>('');
  //表单的数据初始化
  const [form] = Form.useForm();
  const [onlykeytable, setOnlykeytable] = useState<number>(tabledata.length);
  const modifydeleteuseref = useRef<HTMLButtonElement>(null);
  const modifyroleuseref = useRef<HTMLButtonElement>(null);
  const { get, del, post, put } = useApiClient();
  const [addroleselect, setAddroleselect] = useState<boolean>(true);
  const [eidtroleselect, setEidtroleselect] = useState<boolean>(true);
  const [modifyroleselect, setModifyroleselect] = useState<boolean>(true);

  const { t } = useTranslation();
  const tableItems =
  {
    username: t('tableItem.username'),
    name: t('tableItem.name'),
    email: t('tableItem.email'),
    number: t('tableItem.number'),
    team: t('tableItem.team'),
    role: t('tableItem.role'),
    actions: t('tableItem.actions'),
    administrator: t('tableItem.administrator'),
    normalusers: t('tableItem.normalusers'),

  }



  const commonItems = {
    delete: t('common.delete'),
    search: t('common.search'),
    add: t('common.add'),
    cancel: t('common.cancel'),
    confirm: t('common.confirm'),
    edit: t('common.edit'),
    modifyrole: t('common.modifyrole'),
    modifydelete: t('common.modifydelete'),
    addNew: t('common.addNew')

  }

  // 数据
  const { DirectoryTree } = Tree;
  const treeData: TreeDataNode[] = [
    {
      title: '默认目录1',
      key: '0-0',
      children: [
        {
          title: '总公司',
          key: '1-0-0',
          children: [
            {
              title: '下一级-被修改-11',
              key: '1-0-0-0',
              children: [
                {
                  title: '88-1-1',
                  key: '1-0-0-0-0',
                  children: [
                    { title: '112', key: '1-0-0-0-0-0' },
                    { title: '113', key: '1-0-0-0-0-1' },
                  ],
                },
              ],
            },
            { title: 'IT部门', key: '2-0-0-1' },
            {
              title: '测试部门2',
              key: '3-0-0-2',
              children: [
                { title: 'testuuu', key: '3-0-0-0-0', isLeaf: true },
                { title: 'ffadas', key: '3-0-0-0-1', isLeaf: true },
              ],
            },
            { title: 'testeeeee', key: '4-0-0-3' },
            {
              title: '测试重ssstt',
              key: '5-0-0-4',
              children: [{ title: '公司下1', key: '5-0-0-0-0', isLeaf: true }],
            },
            { title: '组织角色A', key: '6-0-0-5' },
          ],
        },
        { title: '焦煤集团', key: '2-0-1' },
        { title: '11212', key: '3-0-2' },
        { title: 'WeOps', key: '4-0-3' },
        {
          title: '测试部门1',
          key: '4-0-4',
          children: [{ title: '测试部门2', key: '4-0-0-0', isLeaf: true }],
        },
      ],
    },
  ];

  // 表格数据
  const columns: TableColumnsType<DataType> = [
    {
      title: 'USERNAME',
      dataIndex: 'username',
      width: 185,
      render: (text) => {
        const color = getRandomColor();
        return (
          <div className="flex" style={{ height: '17px', lineHeight: '17px' }}>
            <span
              className="h-5 w-5 rounded-[10px] text-center text-[12px] mr-1"
              style={{ color: '#ffffff', backgroundColor: color }}
            >
              {text?.substring(0, 1)}
            </span>
            <span>{text}</span>
          </div>
        );
      },
    },
    { title: 'NAME', dataIndex: 'name', width: 100 },
    { title: 'EMAIL', dataIndex: 'email', width: 185 },
    { title: 'NUMBER', dataIndex: 'number', width: 110 },
    { title: 'TEAM', dataIndex: 'team', width: 80 },
    {
      title: 'ROLE',
      dataIndex: 'role',
      width: 110,
      render: (text) => {
        const color = text === 'Administrator' ? 'green' : 'processing';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Actions',
      dataIndex: 'key',
      width: 150,
      render: (key) => {
        return (
          <><Button
            onClick={() => {
              editeuser(key);
            }}
            color="primary"
            variant="link"
          >
            Edit
          </Button>
          <Popconfirm
            title="Do you Want to delete these item?"
            description="After deletion,the data cannot be recovered."
            onConfirm={() => { deleteuse(key); }}
            okText="OK"
            cancelText="Cancel"
          >
            <Button
              color="primary"
              variant="link"
            >
                Delete
            </Button>
          </Popconfirm>
          </>
        );
      },
    },
  ];

  const dataSource = Array.from<DataType>({ length: 4 }).map<DataType>(
    (_, index) => ({
      key: index,
      username: `username${index}`,
      name: `zhangsan${index}`,
      email: `email${index}@gmail.com`,
      number: 'Administrator',
      team: 'Team A',
      role: 'Administrator',
    })
  );

  const options = [
    { label: tableItems.administrator, value: 'Administrator' },
    { label: tableItems.normalusers, value: 'Normal users' },
  ];

  //useEffect函数

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    form.setFieldsValue({ role: `Administrator` });
  }, []);

  useEffect(() => {
    getuserslistApi();
  }, []);
  useEffect(() => {
    getgrouplistApi();
  }, []);


  useEffect(() => {
    const disableButton = (ref: React.RefObject<HTMLButtonElement>, condition: boolean) => {
      if (condition) {
        ref.current?.setAttribute('disabled', 'true');
      } else {
        ref.current?.removeAttribute('disabled');
      }
    };

    const isDisabled = selectedRowKeys.length === 0;
    disableButton(modifydeleteuseref, isDisabled);
    disableButton(modifyroleuseref, isDisabled);
  }, [selectedRowKeys]);

  const init = () => {
    setTableData(dataSource);
    setOnlykeytable(dataSource.length);
  }
  //普通的方法
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  //添加添加数据的功能
  const addData = () => {
    //初始化数据
    setAddModalOpen(true);
    form.resetFields();
    form.setFieldsValue({ role: 'Administrator', team: 'Team A' });
  };

  function onOk() {
    //点击确定按钮，将数据添加到表格中
    setTableData([...tabledata, { ...form.getFieldsValue(), key: onlykeytable }]);
    addUserApi(onlykeytable);
    getuserslistApi();
    setOnlykeytable(onlykeytable + 1);
    setAddModalOpen(false);
    setSelectedRowKeys([]);
  }

  //批量修改用户的权限
  function modifyRole() {
    //初始化数据
    setModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ role: 'Administrator' });
    const arr = [...selectedRowKeys];
    //获取名字
    const newarr: string[] = [];
    arr.forEach((item) => {
      tabledata.find((itemname) => {
        if (itemname.key === item) {
          newarr.push(itemname.username);
        }
      });
    });
    setUsername(newarr);
  }
  // 点击确定按钮，将修改数据添加到表格中
  const modifyroleModalOpen = () => {
    const newRole = form.getFieldsValue().role;
    const newData = tabledata.map((item) => {
      if (selectedRowKeys.includes(item.key)) {
        return { ...item, role: newRole };
      }
      return item;
    });
    setTableData(newData);
    modifyroleApi();
    getuserslistApi();
    setModalVisible(false);
    setSelectedRowKeys([]);
  };
  // 关闭弹窗
  const handleModalClose = () => {
    setModalVisible(false);
  };
  //批量删除用户
  const confirm: PopconfirmProps['onConfirm'] = () => {
    const newData = tabledata.filter((item) => !selectedRowKeys.includes(item.key));
    setTableData(newData);
    modifydeleteApi();
    getuserslistApi();
    setModifyRoleOpen(false);
  };

  const cancel: PopconfirmProps['onCancel'] = () => {
    setModifyRoleOpen(false);
  };

  //编辑用户
  function editeuser(key: number) {
    setEditkey(key);
    setEditmodalOpen(true);
    form.resetFields();
    const [editfinishdata] = tabledata.filter((item) => item.key === key);
    form.setFieldsValue({ ...editfinishdata });
    console.log(form.getFieldsValue());
    setEdituseName(editfinishdata.username);
  }
  //点击确定按钮，将修改数据添加到表格中
  function oneditOk() {
    const newarr: DataType[] = tabledata.map((item) => {
      //添加key值
      return item.key === editkey
        ? { ...form.getFieldsValue(), key: editkey }
        : item;
    });
    setTableData(newarr);
    editUserApi(editkey);
    getuserslistApi();
    setEditmodalOpen(false);
    setSelectedRowKeys([]);
  }

  function oneditCancel() {
    setEditmodalOpen(false);
  }

  //删除用户
  function deleteuse(key: number) {
    deleteuserApi(key);
    const newData = tabledata.filter((item) => item.key !== key);
    setTableData(newData);
    getuserslistApi();
    message.success('Delete successfully');
  }

  const onFormValuesChange = (changedValues: any) => {
    // 得到当前选中的值
    if (changedValues.role === "Administrator") {
      setAddroleselect(true);
    } else {
      return false;
    }
  };
  // 单选事件变化
  function addradiochang(e: RadioChangeEvent) {
    if (e.target.value === "Administrator") {
      setEidtroleselect(true);
    } else {
      setAddroleselect(false);
    }
  }
  function editradiochang(e: RadioChangeEvent) {
    if (e.target.value === "Administrator") {
      setEidtroleselect(true);
    } else {
      setEidtroleselect(false);
    }
  }
  function modifyroleradiochang(e: RadioChangeEvent) {
    if (e.target.value === "Administrator") {
      setModifyroleselect(true);
    } else {
      setModifyroleselect(false);
    }
  }



  //api接口
  //获取用户列表
  async function getuserslistApi() {
    const userslistdata = await get('/lite/user/', { params: { page: 1, page_size: 10 } });
    const temparr: DataType[] = [];
    userslistdata.forEach((item: User) => {
      temparr.push({
        key: item.id,
        username: item.username,
        name: item.firstName,
        email: item.email,
        number: item.Number,
        team: item.team,
        role: item.role
      });
    });
    setTableData(temparr);
  }

  async function editUserApi(id: number) {
    try {
      const response: { message: string } = await put(`/lite/user/${id}/`, {
        ...form.getFieldsValue()
      })
      message.success(response.message);
    } catch (error: any) {
      message.error('Error while editing user');
      throw new Error(error?.message || 'Unknown error occurred');
    }
  }

  async function modifyroleApi() {
    try {
      const response: { message: string } = await put('/lite/modifyrole', {
        selectedRowKeys
      })
      message.success(response.message);
    } catch (error: any) {
      console.log(error);
    }
  }

  async function modifydeleteApi() {
    try {
      const response: { message: string } = await del(`/lite/modifydelete`, {
        params: {
          selectedRowKeys
        }
      })
      message.success(response.message);
    } catch (error: any) {
      message.error('Error while modifydelete user');
      throw new Error(error?.message || 'Unknown error occurred');
    }
  }

  async function addUserApi(key: number) {
    try {
      const response: { message: string } = await post(`/lite/user/`, {
        params: {
          ...form.getFieldsValue(),
          key
        }
      })
      message.success(response.message);
    } catch (error: any) {
      message.error('Error while addUser user');
      throw new Error(error?.message || 'Unknown error occurred');
    }
  }

  // const [ contextHolder] = message.useMessage();
  async function deleteuserApi(key: number) {
    const delmessage = await del(`/lite/user/${key}/`);
    message.success(delmessage.repmessage);
  }
  async function getgrouplistApi() {
    try {
      const response: { message: string } = await get(`/lite/group/`)
      message.success(response.message);
    } catch (error: any) {
      // message.error('Error while getgrouplist',error);
      console.log(error);
      // throw new Error(error?.message || 'Unknown error occurred');
    }
  }
  return (
    <div className={`${userInfoStyle.userInfo} ${userInfoStyle.bgHeight}`}>
      {/* {contextHolder} */}
      <IntroductionInfo
        message="Display all information.You can maintain user information and assign roles."
        title="Users"
      />
      <div className={`flex overflow-hidden`} style={{ height: 'calc(100vh - 160px)' }}>
        {/* 左边 */}
        <div className={`${userInfoStyle.bgColor} w-[230px] flex-shrink-0 flex flex-col justify-items-center items-center r-bg-color mt-4 rounded-md mr-3`}>
          <Input className="mx-3 mt-2 w-[204px]" placeholder={`${commonItems.search}...`} />
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#E6F4FF',
              }
            }}
          >
            <DirectoryTree
              className="w-[230px] mt-4 overflow-auto px-3"
              multiple
              showIcon={false}
              defaultExpandAll
              treeData={treeData}
            />
          </ConfigProvider>
        </div>
        {/* 右边 */}
        <div className="ml-auto mt-4 flex-1 min-w-[640px]" style={{ height: 'calc(100vh - 170px)', width: 'calc(100vw - 310px)' }}>
          <div className="w-full h-11 mb-2">
            <div className="flex justify-between">
              <div className="w-[200px]">
                <Input className="mt-2" placeholder={`${commonItems.search}...`} />
              </div>
              <div className="flex">
                <Button className="mr-1 mt-2" type="primary" onClick={addData}>
                  +{commonItems.add}
                </Button>
                {/* add弹窗 */}
                <OperateModal
                  title={commonItems.addNew}
                  closable={false}
                  open={addmodalOpen}
                  okText={commonItems.confirm}
                  cancelText={commonItems.cancel}
                  width={500}
                  footer={[
                    <Button key="submit" type="primary" onClick={() => onOk()}>
                      Confirm
                    </Button>,
                    <Button key="cancel" onClick={() => setAddModalOpen(false)}>
                      Cancel
                    </Button>,
                  ]}
                >
                  <Form style={{ maxWidth: 600 }} form={form}>
                    <Form.Item
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                      name="username" label={`${tableItems.username}*`} colon={false}>
                      <Input placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item
                      name="name"
                      label={`${tableItems.name}`}
                      colon={false}
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                    >
                      <Input placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                      name="email"
                      label={`${tableItems.email}`}
                      colon={false}
                    >
                      <Input placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                      name="number"
                      label={`${tableItems.number}`}
                      colon={false}
                    >
                      <Input placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                      name="team"
                      label={`${tableItems.team}*`}
                      colon={false}
                    >
                      <Select
                        style={{ width: 120 }}
                        defaultValue="team1"
                        allowClear
                        options={[
                          { value: 'team1', label: 'team1' },
                          { value: 'team2', label: 'team2' },
                        ]}
                        placeholder="select it"
                      />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                      label={`${tableItems.role}*`}
                      name="role" colon={false}>
                      <Radio.Group className={`${userInfoStyle.removeSingleChoiceInterval}`} block options={options} onChange={addradiochang} />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                      label={'  '}
                      name="comment" colon={false}>
                      <RoleDescription modifyRoleSelect={addroleselect} />
                    </Form.Item>
                  </Form>
                </OperateModal>
                {/* edit */}
                <OperateModal
                  closable={false}
                  title={`Edite-${edituseName}`}
                  open={editmodelOpen}
                  okText={commonItems.confirm}
                  cancelText={commonItems.cancel}
                  footer={[
                    <Button key="submit" type="primary" onClick={() => oneditOk()}>
                      Confirm
                    </Button>,
                    <Button key="cancel" onClick={() => oneditCancel()}>
                      Cancel
                    </Button>,
                  ]}
                >
                  <Form style={{ maxWidth: 600 }} form={form}>
                    <Form.Item
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                      name="username" label={`${tableItems.username}*`} colon={false}>
                      <Input disabled={true} placeholder={edituseName} ></Input>
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                      name="name"
                      label={`${tableItems.name}`}
                      colon={false}
                    >
                      <Input placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                      name="email"
                      label={`${tableItems.email}`}
                      colon={false}
                    >
                      <Input placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                      name="number"
                      label={`${tableItems.number}`}
                      colon={false}
                    >
                      <Input placeholder="input placeholder" />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                      name="team"
                      label={`${tableItems.team}*`}
                      colon={false}
                    >
                      <Select
                        style={{ width: 120 }}
                        defaultValue="team A"
                        allowClear
                        options={[
                          { value: 'team A', label: 'team A' },
                          { value: 'team B', label: 'team B' },
                        ]}
                        placeholder="select it"
                      />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                      label={`${tableItems.role}*`}
                      name="role" colon={false}>
                      <Radio.Group className={`${userInfoStyle.removeSingleChoiceInterval}`} block options={options} onChange={editradiochang} />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 18 }}
                      label={'  '}
                      name="comment" colon={false}>
                      {<RoleDescription modifyRoleSelect={eidtroleselect} ></RoleDescription>}
                    </Form.Item>
                  </Form>
                </OperateModal>
                {/* 批量修改角色 */}
                <Button
                  ref={modifyroleuseref}
                  className="mr-1 mt-2 op-8"
                  onClick={modifyRole}
                >
                  {commonItems.modifyrole}
                </Button>
                <OperateModal
                  width={500}
                  title="Batch Modify Roles"
                  closable={false}
                  open={modalVisible}
                  okText={commonItems.confirm}
                  cancelText={commonItems.cancel}
                  footer={[
                    <Button key="submit" type="primary" onClick={() => modifyroleModalOpen()}>
                      Confirm
                    </Button>,
                    <Button key="cancel" onClick={() => handleModalClose()}>
                      Cancel
                    </Button>,
                  ]}
                >
                  <Form style={{ maxWidth: 600 }} form={form} onValuesChange={onFormValuesChange}>
                    <Form.Item
                      colon={false}>
                      <span>Selected users:</span>
                      <span className="text-[#1890ff]">
                        {username.toString()}
                      </span>
                    </Form.Item>
                    <Form.Item
                      name="role" colon={false}>
                      <Radio.Group className={`${userInfoStyle.removeSingleChoiceInterval}`} block options={options} onChange={modifyroleradiochang} />
                    </Form.Item>
                    <Form.Item

                      label={''} name="comment" colon={false}>
                      <RoleDescription modifyRoleSelect={modifyroleselect}></RoleDescription>
                    </Form.Item>
                  </Form>
                </OperateModal>
                {/* 批量删除 */}
                <Button
                  ref={modifydeleteuseref}
                  className="mr-1 mt-2 red"
                  onClick={() => {
                    setModifyRoleOpen(true);
                  }}
                >
                  {commonItems.modifydelete}

                </Button>

                <OperateModal
                  open={modifyRoleOpen}
                  title={
                    <>
                      <p className="font-[20px] mt-[16px] ml-[50px] text-center">
                        Confirm deletion of the selected users?
                      </p>
                    </>
                  }
                  footer={null}
                  closeIcon={null}
                  okText={commonItems.confirm}
                  cancelText={commonItems.cancel}
                >
                  <Button className="mt-[20px] ml-[150px]" type="primary" onClick={confirm}>
                    {commonItems.confirm}
                  </Button>
                  <Button
                    className="ml-4"
                    type="default"
                    onClick={cancel}
                  >
                    {commonItems.cancel}
                  </Button>
                </OperateModal>
              </div>
            </div>
          </div>
          <div className={`${userInfoStyle.bgColor} pt-[29px] pl-[9px] pr-[9px]`}>
            <Flex gap="middle" vertical>
              <ConfigProvider
                theme={{
                  components: {
                    Table: {
                      headerSplitColor: "#fafafa",
                    }
                  }
                }}
              >
                <Table<DataType>
                  size={'middle'}
                  scroll={{ y: 'calc(100vh - 360px)', x: 'calc(100vw - 250px)' }}
                  pagination={{ pageSize: 5 }}
                  columns={columns}
                  dataSource={tabledata}
                  rowSelection={rowSelection}
                />
              </ConfigProvider>
            </Flex>
          </div>
        </div>
      </div>
    </div>
  );
};
export default User;
