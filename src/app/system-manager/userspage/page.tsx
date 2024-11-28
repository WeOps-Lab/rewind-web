'use client';
import React from 'react';
import { Input, Form, message, Modal } from 'antd';
import { Tree } from 'antd';
import { Button, ConfigProvider } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { getRandomColor } from '../utils/common';
import { Flex, Table, Tag } from 'antd';
import type { TreeDataNode } from 'antd';
import type { TableColumnsType } from 'antd';
import userInfoStyle from './index.module.scss';
import useApiClient from '@/utils/request';
import { UserDataType, TransmitUserData, TableRowSelection } from '@/app/system-manager/types/userstypes'
import { useTranslation } from '@/utils/i18n';
import WithSideMenuLayout from '@/components/sub-layout/index'
import TopSection from '@/app/system-manager/components/top-section'
import UserModal,{ModalRef} from './userModal';

const User = () => {
  //hook函数
  const [tabledata, setTableData] = useState<UserDataType[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  //控制Modal的打开和关闭
  // const [addmodalOpen, setAddModalOpen] = useState(false);
  // //编辑的Modal的打开和关闭
  // const [editmodelOpen, setEditmodalOpen] = useState(false);
  // //控制修改角色的弹窗
  // const [modalVisible, setModalVisible] = useState(false);
  // //主要控制选中的用户名
  // const [username, setUsername] = useState(['zhangsan']);
  // const [editkey, setEditkey] = useState(1);
  // const [edituseName, setEdituseName] = useState<string>('');
  //表单的数据初始化
  const [form] = Form.useForm();
  // const [onlykeytable, setOnlykeytable] = useState<number>(tabledata.length);
  const modifydeleteuseref = useRef<HTMLButtonElement>(null);
  const modifyroleuseref = useRef<HTMLButtonElement>(null);
  const { get, del} = useApiClient();
  // const [addroleselect, setAddroleselect] = useState<boolean>(true);
  // const [eidtroleselect, setEidtroleselect] = useState<boolean>(true);
  // const [modifyroleselect, setModifyroleselect] = useState<boolean>(true);
  const { t } = useTranslation();
  const { confirm } = Modal;
  const userRef = useRef<ModalRef>(null);
  // 数据
  const { DirectoryTree } = Tree;
  //组织树形数据
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

  // 用户表格数据
  const columns: TableColumnsType<UserDataType> = [
    {
      title: t('userpage.contentright.bottontable.username'),
      dataIndex: 'username',
      width: 185,
      fixed: 'left',
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
    { title: t('userpage.contentright.bottontable.name'), dataIndex: 'name', width: 100 },
    { title: t('userpage.contentright.bottontable.email'), dataIndex: 'email', width: 185 },
    { title: t('userpage.contentright.bottontable.number'), dataIndex: 'number', width: 110 },
    { title: t('userpage.contentright.bottontable.team'), dataIndex: 'team', width: 80 },
    {
      title: t('userpage.contentright.bottontable.role'),
      dataIndex: 'role',
      width: 110,
      render: (text) => {
        const color = text === 'Administrator' ? 'green' : 'processing';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: t('userpage.contentright.bottontable.actions'),
      dataIndex: 'key',
      width: 150,
      fixed: 'right',
      render: (key) => {
        return (
          <><Button
            onClick={() => {
              // 将要回显示的数据传给user的弹窗组件
              // tabledata.map((item) => {
              //   if(item.key === key){
              //     setEdituserdata(() => ((item) => {
              //       console.log(item)
              //       return item;
              //     })() as unknown as UserDataType)
              //     console.log(edituserdata)
              //   }
              // })
              openUerModal('edit', {
                username: 'chen',
                name: 'chen',
                email: 'chen',
                number: 'chen',
                team: 'Team 1',
                role: 'Normal users',
                key: ''
              });

              // editeuser(key);
            }}
            color="primary"
            variant="link"
          >
            {t('common.edit')}
          </Button>
          {/* 删除的一条用户信息 */}
          <Button
            color="primary"
            variant="link"
            onClick={() => {
              showDeleteConfirm(key);

            }}
          >
            {t('common.delete')}
          </Button>
          </>
        );
      },
    },
  ];
  const dataSource = Array.from<UserDataType>({ length: 4 }).map<UserDataType>(
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
  //useEffect函数

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    form.setFieldsValue({ role: `Administrator` });
  }, []);
  // 接口请求
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
    // setOnlykeytable(dataSource.length);
  }
  //普通的方法
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection: TableRowSelection<UserDataType> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };
  //添加添加数据的功能
  // const addData = () => {
  //   //初始化数据
  //   setAddModalOpen(true);
  //   form.resetFields();
  //   form.setFieldsValue({ role: 'Normal users', team: 'Team A' });
  // };

  // function onOk() {
  //   // 点击确定按钮，将数据添加到表格中
  //   const temp = handleEmptyFields(form.getFieldsValue());
  //   setTableData([...tabledata, { ...temp, key: onlykeytable }]);
  //   addUserApi(onlykeytable);
  //   getuserslistApi();
  //   setOnlykeytable(onlykeytable + 1);
  //   setAddModalOpen(false);
  //   console.log(form.getFieldsValue());
  //   setSelectedRowKeys([]);
  // }

  //批量修改用户的权限
  // function modifyRole() {
  //   //初始化数据
  //   setModalVisible(true);
  //   form.resetFields();
  //   form.setFieldsValue({ role: 'Administrator' });
  //   const arr = [...selectedRowKeys];
  //   //获取名字
  //   const newarr: string[] = [];
  //   arr.forEach((item) => {
  //     tabledata.find((itemname) => {
  //       if (itemname.key === item) {
  //         newarr.push(itemname.username);
  //       }
  //     });
  //   });
  //   setUsername(newarr);
  // }
  // 点击确定按钮，将修改数据添加到表格中
  // const modifyroleModalOpen = () => {
  //   const newRole = form.getFieldsValue().role;
  //   const newData = tabledata.map((item) => {
  //     if (selectedRowKeys.includes(item.key)) {
  //       return { ...item, role: newRole };
  //     }
  //     return item;
  //   });
  //   setTableData(newData);
  //   modifyroleApi();
  //   getuserslistApi();
  //   setModalVisible(false);
  //   setSelectedRowKeys([]);
  // };
  // 关闭弹窗
  // const handleModalClose = () => {
  //   setModalVisible(false);
  // };

  //编辑用户
  // function editeuser(key: number) {
  //   setEditkey(key);
  //   setEditmodalOpen(true);
  //   form.resetFields();
  //   const [editfinishdata] = tabledata.filter((item) => item.key === key);
  //   form.setFieldsValue({ ...editfinishdata });
  //   console.log(form.getFieldsValue());
  //   setEdituseName(editfinishdata.username);
  // }
  // //点击确定按钮，将修改数据添加到表格中
  // function oneditOk() {
  //   const newarr: UserDataType[] = tabledata.map((item) => {
  //     //添加key值
  //     return item.key === editkey
  //       ? { ...form.getFieldsValue(), key: editkey }
  //       : item;
  //   });
  //   setTableData(newarr);
  //   editUserApi(editkey);
  //   getuserslistApi();
  //   setEditmodalOpen(false);
  //   setSelectedRowKeys([]);
  // }

  // function oneditCancel() {
  //   setEditmodalOpen(false);
  // }

  //删除用户
  function deleteuser(key: number) {
    deleteuserApi(key);
    const newData = tabledata.filter((item) => item.key !== key);
    setTableData(newData);
    getuserslistApi();
  }

  // const onFormValuesChange = (changedValues: any) => {
  //   // 得到当前选中的值
  //   if (changedValues.role === "Administrator") {
  //     setAddroleselect(true);
  //   } else {
  //     return false;
  //   }
  // };
  // 添加用户的单选事件变化监听事件
  // function addradiochang(e: RadioChangeEvent) {
  //   if (e.target.value === "Administrator") {
  //     setAddroleselect(true);
  //   } else {
  //     setAddroleselect(false);
  //   }
  // }
  // function editradiochang(e: RadioChangeEvent) {
  //   if (e.target.value === "Administrator") {
  //     setEidtroleselect(true);
  //   } else {
  //     setEidtroleselect(false);
  //   }
  // }
  // function modifyroleradiochang(e: RadioChangeEvent) {
  //   if (e.target.value === "Administrator") {
  //     setModifyroleselect(true);
  //   } else {
  //     setModifyroleselect(false);
  //   }
  // }
  // 删除用户的弹窗确定
  const showDeleteConfirm = (key: number) => {
    confirm({
      title: t('teampage.modal.title'),
      content: t('teampage.modal.content'),
      centered: true,
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk() {
        return new Promise(async (resolve) => {
          try {
            deleteuser(key)
            message.success("delete users successfully!");
            await del(`/api/username`);
            message.success("delete users successfully!");
          } finally {
            resolve(true);
          }
        });
      },
    });
  };


  // 删除组织的弹窗确定
  const showDeleteTeamConfirm = (key: number) => {
    confirm({
      title: t('teampage.modal.title'),
      content: t('teampage.modal.content'),
      centered: true,
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk() {
        const newData = tabledata.filter((item) => !selectedRowKeys.includes(item.key));
        setTableData(newData);
        modifydeleteApi();
        getuserslistApi();
        return new Promise(async (resolve) => {
          try {
            deleteuser(key)
            message.success("delete users successfully!");
            await del(`/api/username`);
            message.success("delete users successfully!");
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  //根据传入的值打开对应的用户弹窗（添加用户弹窗和编辑用户的弹窗）
  const openUerModal = (type: string, row: { username: string; name: string; email: string; number: string; team: string; role: string; key: string; } ) => {
    userRef.current?.showModal({
      type,
      form: row,
    });
  };


  //api接口
  //获取用户列表
  async function getuserslistApi() {
    const userslistdata = await get('/lite/user/', { params: { page: 1, page_size: 10 } });
    const temparr: UserDataType[] = [];
    userslistdata.forEach((item: TransmitUserData) => {
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

  // async function editUserApi(id: number) {
  //   try {
  //     const response: { message: string } = await put(`/lite/user/${id}/`, {
  //       ...form.getFieldsValue()
  //     })
  //     message.success(response.message);
  //   } catch (error: any) {
  //     message.error('Error while editing user');
  //     throw new Error(error?.message || 'Unknown error occurred');
  //   }
  // }

  // async function modifyroleApi() {
  //   try {
  //     const response: { message: string } = await put('/lite/modifyrole', {
  //       selectedRowKeys
  //     })
  //     message.success(response.message);
  //   } catch (error: any) {
  //     console.log(error);
  //   }
  // }

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

  // async function addUserApi(key: number) {
  //   try {
  //     const response: { message: string } = await post(`/lite/user/`, {
  //       params: {
  //         ...form.getFieldsValue(),
  //         key
  //       }
  //     })
  //     message.success(response.message);
  //   } catch (error: any) {
  //     message.error('Error while addUser user');
  //     throw new Error(error?.message || 'Unknown error occurred');
  //   }
  // }

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
      <TopSection title={t('userpage.topinfo.title')} content={t('userpage.topinfo.desc')}></TopSection>
      <div className={`flex overflow-hidden mt-[27px]`} style={{ height: 'calc(100vh - 160px)' }}>
        {/* 左边 */}
        <div className={`${userInfoStyle.bgColor} w-[230px] flex-shrink-0 flex flex-col justify-items-center items-center r-bg-color  rounded-md mr-[17px]`}>
          <Input className="mx-3 mt-[17px] w-[204px]" placeholder={`${t('common.search')}...`} />
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#E6F4FF',
              }
            }}
          >
            <DirectoryTree
              className="w-[230px] mt-4 overflow-auto px-3"
              expandAction={false}
              multiple
              showIcon={false}
              defaultExpandAll
              treeData={treeData}
            />
          </ConfigProvider>
        </div>
        {/* 右边内容区域 */}
        <WithSideMenuLayout showSideMenu={false} menuItems={[]}  >
          <div className="w-full h-11 mb-2">
            <div className="flex justify-between">
              <div className="w-[200px]">
                <Input className="" placeholder={`${t('common.search')}...`} />
              </div>
              <div className="flex">
                {/* 添加用户的按钮 */}
                <Button className="mr-1" type="primary" onClick={() => { openUerModal('add',{
                  key: 'fdfd',
                  username: '',
                  name:'',
                  email: '',
                  number: '',
                  team: 'Team1',
                  role: 'Normal users',
                }) }}>
                  +{t('common.add')}
                </Button>
                {/* 添加用户和编辑用户的弹窗组件 */}
                <UserModal ref={userRef} onSuccess={(successuserdata,reptype)=>{console.log('我是一个成功的回调',successuserdata,reptype)}} ></UserModal>
                {/* 批量修改用户角色 */}
                <Button
                  ref={modifyroleuseref}
                  className="mr-1 op-8"
                  onClick={() => { openUerModal('modifyrole',{
                    key: 'fdfd',
                    username: 'ffffff',
                    name:'',
                    email: '',
                    number: '',
                    team: 'Team1',
                    role: 'Normal users',
                  }) }}
                >
                  {t('common.modifyrole')}
                </Button>
                {/* 批量删除 */}
                <Button
                  ref={modifydeleteuseref}
                  className="mr-1"
                  onClick={() => {
                    showDeleteTeamConfirm(3);
                  }}
                >
                  {t('common.modifydelete')}
                </Button>
              </div>
            </div>
          </div>
          <div className={`${userInfoStyle.bgColor}`}>
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
                {/* 用户的表单页面 */}
                <Table<UserDataType>
                  size={'middle'}
                  scroll={{ y: '300px', x: 'calc(100vw - 250px)' }}
                  pagination={{ pageSize: 5 }}
                  columns={columns}
                  dataSource={tabledata}
                  rowSelection={rowSelection}
                />
              </ConfigProvider>
            </Flex>
          </div>
        </WithSideMenuLayout>
      </div>
    </div>
  );
};
export default User;
