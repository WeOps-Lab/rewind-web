'use client';
import React from 'react';
import { Input, message, Modal,Tree,Button, ConfigProvider } from 'antd';
import { Flex, Table, Tag,TreeDataNode } from 'antd';
import type { TableColumnsType } from 'antd';
import { useState, useEffect, useRef } from 'react';
import WithSideMenuLayout from '@/components/sub-layout/index'
import TopSection from '@/app/system-manager/components/top-section'
import UserModal, { ModalRef } from './userModal';
import { useTranslation } from '@/utils/i18n';
import { getRandomColor } from '../utils/common';
import { useUsernamegeApi } from "@/app/system-manager/api/usermanageapi/usernamegeapi";
import { OriginalGroup } from "@/app/system-manager/types/groupstypes";
import { UserDataType,TableRowSelection, ConvertedtreeGroup } from '@/app/system-manager/types/userstypes'
import userInfoStyle from './index.module.scss';

const User = () => {
  //hook函数
  //表格数据
  const [tabledata, setTableData] = useState<UserDataType[]>([]);
  // 选中的用户状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const modifydeleteuseref = useRef<HTMLButtonElement>(null);
  const modifyroleuseref = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();
  const { confirm } = Modal;
  const userRef = useRef<ModalRef>(null);
  const {
    getuserslistApi,
    getorgtreeApi,
    deleteUserApi
  } = useUsernamegeApi();
  // 数据
  const { DirectoryTree } = Tree;
  const [treeData, setTreaData] = useState<TreeDataNode[]>();

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
              const usertabledata:UserDataType = getuser(key) as UserDataType;
              openUerModal('edit', {
                username: usertabledata.username,
                name: usertabledata.name,
                email: usertabledata.email,
                number: usertabledata.number,
                team: usertabledata.team,
                role: usertabledata.role,
                key: usertabledata.key
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

  //useEffect函数
  // 接口请求
  useEffect(() => {
    getuserslistApi().then((res) => {
      const temp = res.users.map((item:UserDataType) => {
        return {
          key: item.id,
          username: item.username,
          name: item.firstName,
          email: item.email,
          number: item.createdTimestamp,
          team: 'refdh',
          role: 'fhdhf',
        }
      });
      setTableData(temp);
    })
  }, []);
  //获取组织树
  useEffect(() => {
    getorgtreeApi().then((res) => {
      const newdata = convertGroups(res);
      setTreaData(newdata as TreeDataNode[]);
    })
  }, []);
  //当用户未选中多选项，禁用按钮
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

  //普通的方法
  //获取一个指定key的table用户信息
  const getuser = (key: string) => {
    const user = tabledata.find((item) => item.key === key);
    return user;
  };
  //转换组织列表的数据格式
  const convertGroups = (groups: OriginalGroup []): ConvertedtreeGroup[] => {
    return groups.map((group) => ({
      key: group.id,
      title: group.name,
      children: [convertGroups(group.subGroups)], // 递归转换子组
    }));
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection: TableRowSelection<UserDataType> = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // 删除用户的弹窗确定
  const showDeleteConfirm = (key: string) => {
    confirm({
      title: t('teampage.modal.title'),
      content: t('teampage.modal.content'),
      centered: true,
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      async onOk() {
        try {
          // 删除用户
          await deleteUserApi(key);
          // 获取用户列表
          const res = await getuserslistApi();
          const temp = res.users.map((item : UserDataType) => ({
            key: item.id,
            username: item.username,
            name: item.firstName,
            email: item.email,
            number: item.createdTimestamp,
            team: 'refdh',  // 根据实际数据进行修改
            role: 'fhdhf',  // 根据实际数据进行修改
          }));
          // 更新表格数据
          setTableData(temp);
          message.success("Delete user successfully!");
        } catch (error) {
          // 错误处理
          console.error('Something went wrong:', error);
          message.error('Failed to delete user or fetch users list.');
        }
      },
    });
  };

  // 批量删除组织的弹窗确定
  const showDeleteTeamConfirm = () => {
    confirm({
      title: t('teampage.modal.title'),
      content: t('teampage.modal.content'),
      centered: true,
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk() {
        const newData = tabledata.filter((item) => !selectedRowKeys.includes(item.key));
        setTableData(newData);
        //  modifydeleteApi();
        // getuserslistApi();
        message.success("delete users successfully!");
      },
    });
  };

  //根据传入的值打开对应的用户弹窗（添加用户弹窗和编辑用户的弹窗）
  const openUerModal = (type: string, row: { username: string; name: string; email: string; number: string; team: string; role: string; key: string; }) => {
    userRef.current?.showModal({
      type,
      form: row,
    });
  };
  // 当用户添加用户或者编辑用户成功后,更新用户列表
  const onsuccessusermodal = () => {
    message.success("Add user successfully!");
    getuserslistApi().then((res) => {
      const temp = res.users.map((item : UserDataType) => {
        return {
          key: item.id,
          username: item.username,
          name: item.firstName,
          email: item.email,
          number: item.createdTimestamp,
          team: 'refdh',
          role: 'fhdhf',
        }
      });
      setTableData(temp);
    })
  };
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
                <Button className="mr-1" type="primary" onClick={() => {
                  openUerModal('add', {
                    username: '',
                    name: '',
                    email: '',
                    number: '',
                    team: 'Team1',
                    role: 'Normal users',
                    key: ''
                  })
                }}>
                  +{t('common.add')}
                </Button>
                {/* 添加用户和编辑用户的弹窗组件 */}
                <UserModal ref={userRef} onSuccess={onsuccessusermodal} ></UserModal>
                {/* 批量修改用户角色 */}
                <Button
                  ref={modifyroleuseref}
                  className="mr-1 op-8"
                  onClick={() => {
                    openUerModal('modifyrole', {
                      key: 'fdfd',
                      username: 'ffffff',
                      name: '',
                      email: '',
                      number: '',
                      team: 'Team1',
                      role: 'Normal users',
                    })
                  }}
                >
                  {t('common.modifyrole')}
                </Button>
                {/* 批量删除 */}
                <Button
                  ref={modifydeleteuseref}
                  className="mr-1"
                  onClick={() => {
                    showDeleteTeamConfirm();
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
