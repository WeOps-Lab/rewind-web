'use client';
import React, { useState,  useEffect } from 'react';
import { Button, Input, Form, message, ConfigProvider, Modal } from 'antd';
import OperateModal from '@/components/operate-modal';
import GroupsStyle from './index.module.scss';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import CustomTable from '@/components/custom-table';
import { AnyObject } from 'antd/es/_util/type';
import {
  DataType,
  OriginalGroup,
  ConvertedGroup,
} from '@/app/system-manager/types/groupstypes';
import { useTranslation } from '@/utils/i18n';
import TopSection from '@/app/system-manager/components/top-section';
import { useApiTeam } from '@/app/system-manager/api/teammanageapi/teammanageapi';

const Groups = () => {
  
  const [form] = Form.useForm();
  //修改的组织的key和添加子组织的key
  const [addsubteamkey, setAddsubteamkey] = useState('6');
  const [renamekey, setRenamekey] = useState('1');
  // const [sortablearr, setSortablearr] = useState(['1', '2', '3', '4', '5']);
  const [expandedRowKeysarr, setExpandedRowKeys] = useState(['0']);
  //添加组织，添加子组织，修改组织的弹窗的状态
  const [addteammodalOpen, setAddteammodalOpen] = useState(false);
  const [addSubteammodalOpen, setAddSubteammodalOpen] = useState(false);
  const [renameteammodalOpen, setRenameteammodalOpen] = useState(false);

  const { t } = useTranslation();
  //获取接口
  const {
    getTeamDataApi,
    addTeamDataApi,
    addSubTeamApi,
    renameTeamApi,
    deleteteamApi,
  } = useApiTeam();
  //团队的列表渲染的样式
  const columns: any = [
    { title: t('tableItem.name'), dataIndex: 'name', width: 450 },
    {
      title: t('tableItem.actions'),
      dataIndex: 'actions',
      width: 300,
      render: (arr: string[], data: DataType) => (
        <>
          <Button
            className="mr-[8px]"
            type="link"
            onClick={() => {
              addsubGroups(data.key);
            }}
          >
            {t('common.addsubGroups')}
          </Button>
          <Button
            className="mr-[8px]"
            type="link"
            onClick={() => {
              renameGroups(data.key);
            }}
          >
            {t('common.rename')}
          </Button>
          {!data.children || data.children.length === 0 ? (
            <>
              <Button
                className="mr-[8px]"
                type="link"
                onClick={() => {
                  deleteGroups(data.key);
                }}
              >
                {t('common.delete')}
              </Button>
            </>
          ) : null}
        </>
      ),
    },
  ];
  //组织的数据
  const [dataSource, setDataSource] = React.useState<DataType[]>();

  //组件挂载获取组织数据
  useEffect(() => {
    getTeamDataApi().then((teamdata) => {
      const newData = convertGroups(teamdata);
      console.log(newData, 'hdhfhd');
      setDataSource(newData);
    });
  }, []);

  //转换组织列表的数据
  const convertGroups = (groups: OriginalGroup[]): ConvertedGroup[] => {
    return groups.map((group) => ({
      key: group.id,
      name: group.name,
      childrenGroups: convertGroups(group.subGroups), // 递归转换子组
    }));
  };
  //添加父组织的触发事件
  function addGroups() {
    setAddteammodalOpen(true);
    form.resetFields();
  }
  async function onOkaddteam() {
    setAddteammodalOpen(false);
    await addTeamDataApi(form.getFieldValue('teamname')).then((res) => {
      console.log(res, 'res');
    });
    await getTeamDataApi().then((teamdata) => {
      const newData = convertGroups(teamdata);
      setDataSource(newData);
    });
    message.success('add Groups successfully!');
  }

  //添加子组织的触发事件
  function addsubGroups(key: string) {
    setAddSubteammodalOpen(true);
    setAddsubteamkey(key);
    form.resetFields();
  }
  //添加子组织的确定事件
  async function onOkaddSubteam() {
    await addSubTeamApi(
      addsubteamkey,
      form.getFieldValue('teamname')
    ).then((res) => {
      message.success(res.message);
    });
    await getTeamDataApi().then((teamdata) => {
      const newData = convertGroups(teamdata);
      setDataSource(newData);
    });
    message.success('add SubGroups successfully!');
    //设置张开的节点
    setExpandedRowKeys([...expandedRowKeysarr, addsubteamkey]);
    setAddSubteammodalOpen(false);
  }

  //修改组织的触发事件
  function renameGroups(key: string) {
    setRenameteammodalOpen(true);
    setRenamekey(key);
    form.resetFields();
    findNode(dataSource as DataType[], key);
  }
  //查找要修改的组织，回显其数据
  const findNode = (treeData: DataType[], targetKey: string): DataType[] => {
    return treeData.map((node) => {
      if (node.key === targetKey) {
        form.setFieldsValue({ renameteam: node.name });
      } else if (node.children) {
        return {
          ...node,
          children: findNode(node.children, targetKey),
        };
      }
      return node;
    });
  };

  //修改组织的确定事件
  async function onOkrenameteam() {
    console.log(renamekey, 'renamekey');
    const rename = form.getFieldValue('renameteam');
    await renameTeamApi(rename, renamekey).then((res) => {
      console.log(res, 'res');
    });
    await getTeamDataApi().then((teamdata) => {
      const newData = convertGroups(teamdata);
      setDataSource(newData);
    });
    message.success('renameGroups successfully!');
    setRenameteammodalOpen(false);
  }

  //删除组织事件
  function deleteGroups(key: string) {
    showDeleteConfirm(key);
  }

  function onExpand(expanded: boolean, record: AnyObject) {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeysarr, record.key]);
    } else {
      setExpandedRowKeys(
        expandedRowKeysarr.filter((item) => item !== record.key)
      );
    }
  }

  const testwww = async () => {
    const res =await getTeamDataApi();
    console.log(res, 'teamdata');
  };

  // 删除组织的确定的弹窗
  const { confirm } = Modal;
  const showDeleteConfirm = (key: string) => {
    confirm({
      title: t('teampage.modal.title'),
      content: t('teampage.modal.content'),
      centered: true,
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await deleteteamApi(key);
            await getTeamDataApi().then((teamdata) => {
              const newData = convertGroups(teamdata);
              setDataSource(newData);
            });
            message.success('deleteGroups successfully!');
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  return (
    <div className={`${GroupsStyle.height}`}>
      <button onClick={testwww}>test</button>
      <TopSection
        title={t('teampage.topinfo.title')}
        content={t('teampage.topinfo.desc')}
      ></TopSection>
      <div className="w-full h-[32px] mt-[23px] mb-[23px] flex justify-between">
        <Input
          className="inputwidth"
          placeholder={`${t('common.search')}...`}
        />{' '}
        <Button
          type="primary"
          onClick={() => {
            addGroups();
          }}
        >
          +{t('common.add')}
        </Button>
      </div>
      {/* 添加父组织的弹窗 */}
      <OperateModal
        title={t('common.add')}
        closable={false}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        open={addteammodalOpen}
        footer={[
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              onOkaddteam();
            }}
          >
            {t('common.confirm')}
          </Button>,
          <Button
            key="cancel"
            onClick={() => {
              setAddteammodalOpen(false);
            }}
          >
            {t('common.cancel')}
          </Button>,
        ]}
      >
        <Form style={{ maxWidth: 600 }} form={form}>
          <Form.Item
            name="teamname"
            label={`${t('tableItem.name')}*`}
            colon={false}
          >
            <Input placeholder="input placeholder" />
          </Form.Item>
        </Form>
      </OperateModal>
      {/* 修改组织的名字的弹窗 */}
      {/* 拖拽的表格 */}
      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerSplitColor: '#fafafa',
              selectionColumnWidth: 10,
              bodySortBg: '#787878',
            },
          },
        }}
      >
        <CustomTable
          rowKey="key"
          pagination={false}
          expandedRowKeys={expandedRowKeysarr}
          onExpand={(expanded, record) => {
            onExpand(expanded, record);
          }}
          size="small"
          scroll={{ y: 'calc(100vh - 300px)', x: 'calc(100vw-100px)' }}
          // components={{ body: { row: Row } }}
          columns={columns}
          expandable={{
            expandIcon: ({ expanded, onExpand, record }) =>
              record.children && record.children.length > 0 ? (
                expanded ? (
                  <CaretDownOutlined onClick={(e) => onExpand(record, e)} />
                ) : (
                  <CaretRightOutlined
                    onClick={(e) => onExpand(record, e)}
                  />
                )
              ) : null,
            indentSize: 22,
          }}
          dataSource={dataSource}
        />
      </ConfigProvider>
      {/* 添加子组织的弹窗 */}
      <OperateModal
        title={t('common.addsubGroups')}
        closable={false}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        open={addSubteammodalOpen}
        footer={[
          <Button key="submit" type="primary" onClick={() => onOkaddSubteam()}>
            {t('common.confirm')}
          </Button>,
          <Button key="cancel" onClick={() => setAddSubteammodalOpen(false)}>
            {t('common.cancel')}
          </Button>,
        ]}
      >
        <Form style={{ maxWidth: 600 }} form={form}>
          <Form.Item
            name="teamname"
            label={`${t('tableItem.name')}*`}
            colon={false}
          >
            <Input placeholder="input placeholder" />
          </Form.Item>
        </Form>
      </OperateModal>
      {/* 修改组织的名字的弹窗 */}
      <OperateModal
        title={t('common.rename')}
        closable={false}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        open={renameteammodalOpen}
        footer={[
          <Button key="submit" type="primary" onClick={() => onOkrenameteam()}>
            {t('common.confirm')}
          </Button>,
          <Button key="cancel" onClick={() => setRenameteammodalOpen(false)}>
            {t('common.cancel')}
          </Button>,
        ]}
      >
        <Form style={{ maxWidth: 600 }} form={form}>
          <Form.Item
            name="renameteam"
            label={`${t('tableItem.name')}*`}
            colon={false}
          >
            <Input placeholder="input placeholder" />
          </Form.Item>
        </Form>
      </OperateModal>
    </div>
  );
};
export default Groups;
