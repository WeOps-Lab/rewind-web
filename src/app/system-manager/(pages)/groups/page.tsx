'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Form, message, Modal } from 'antd';
import OperateModal from '@/components/operate-modal';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import CustomTable from '@/components/custom-table';
import { AnyObject } from 'antd/es/_util/type';
import {
  DataType,
  OriginalGroup,
  ConvertedGroup,
} from '@/app/system-manager/types/groups';
import { useTranslation } from '@/utils/i18n';
import TopSection from '@/components/top-section';
import { useApiTeam } from '@/app/system-manager/api/groups/index';

const { Search } = Input;

const Groups = () => {
  const [form] = Form.useForm();
  // 修改的组织的key和添加子组织的key
  const [addsubteamkey, setAddsubteamkey] = useState('');
  const [renamekey, setRenamekey] = useState('');
  const [expandedRowKeysarr, setExpandedRowKeys] = useState<string[]>([]);
  // 添加组织，添加子组织，修改组织的弹窗的状态
  const [addteammodalOpen, setAddteammodalOpen] = useState(false);
  const [addSubteammodalOpen, setAddSubteammodalOpen] = useState(false);
  const [renameteammodalOpen, setRenameteammodalOpen] = useState(false);

  const { t } = useTranslation();
  // 获取接口
  const {
    getTeamDataApi,
    addTeamDataApi,
    addSubTeamApi,
    renameTeamApi,
    deleteteamApi,
  } = useApiTeam();
  // 团队的列表渲染的样式
  const columns: any = [
    { title: t('system.users.form.name'), dataIndex: 'name', width: 450 },
    {
      title: t('common.actions'),
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
            {t('system.groups.addsubGroups')}
          </Button>
          <Button
            className="mr-[8px]"
            type="link"
            onClick={() => {
              renameGroups(data.key);
            }}
          >
            {t('system.groups.rename')}
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
  // 组织的数据
  const [dataSource, setDataSource] = useState<DataType[]>();

  // 组件挂载获取组织数据
  useEffect(() => {
    fetchData();
  }, []);

  // 获取组织数据
  const fetchData = useCallback(async () => {
    const teamdata = await getTeamDataApi();
    const newData = convertGroups(teamdata);
    setDataSource(newData);
  }, [getTeamDataApi]);

  // 转换组织列表的数据
  const convertGroups = (groups: OriginalGroup[]): ConvertedGroup[] => {
    return groups.map((group) => ({
      key: group.id,
      name: group.name,
      childrenGroups: convertGroups(group.subGroups), // 递归转换子组
    }));
  };

  // 搜索组织
  const handleInputSearchChange = async (value: string) => {
    const teamdata = await getTeamDataApi();
    const filteredData = teamdata.filter((group: any) => group.name.includes(value));
    const newData = convertGroups(filteredData);
    setDataSource(newData);
  };

  // 添加父组织的触发事件
  const addGroups = () => {
    setAddteammodalOpen(true);
    form.resetFields();
  };

  const onOkaddteam = async () => {
    try {
      await form.validateFields();
      setAddteammodalOpen(false);
      await addTeamDataApi(form.getFieldValue('teamname'));
      await fetchData();
      message.success(t('system.groups.addSuccess'));
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  // 添加子组织的触发事件
  const addsubGroups = (key: string) => {
    setAddSubteammodalOpen(true);
    setAddsubteamkey(key);
    form.resetFields();
  };

  // 添加子组织的确定事件
  const onOkaddSubteam = async () => {
    try {
      await form.validateFields();
      const teamname = form.getFieldValue('teamname');
      await addSubTeamApi(addsubteamkey, teamname);
      await fetchData();
      message.success(t('system.groups.addSubSuccess'));
      setExpandedRowKeys((prev) => [...prev, addsubteamkey]);
      setAddSubteammodalOpen(false);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  // 修改组织的触发事件
  const renameGroups = (key: string) => {
    setRenameteammodalOpen(true);
    setRenamekey(key);
    form.resetFields();
    findNode(dataSource as DataType[], key);
  };

  // 查找要修改的组织，回显其数据
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

  // 修改组织的确定事件
  const onOkrenameteam = async () => {
    try {
      await form.validateFields();
      const rename = form.getFieldValue('renameteam');
      await renameTeamApi(rename, renamekey);
      await fetchData();
      message.success(t('system.groups.renameSuccess'));
      setRenameteammodalOpen(false);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  // 删除组织事件
  const deleteGroups = (key: string) => {
    showDeleteConfirm(key);
  };

  const onExpand = (expanded: boolean, record: AnyObject) => {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeysarr, record.key]);
    } else {
      setExpandedRowKeys(
        expandedRowKeysarr.filter((item) => item !== record.key)
      );
    }
  };

  // 删除组织的确定的弹窗
  const showDeleteConfirm = (key: string) => {
    Modal.confirm({
      title: t('common.delConfirm'),
      content: t('common.delConfirmCxt'),
      centered: true,
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk: async () => {
        await deleteteamApi(key);
        await fetchData();
        message.success(t('system.groups.deleteSuccess'));
      },
    });
  };

  return (
    <div className="w-full">
      <TopSection
        title={t('system.groups.title')}
        content={t('system.groups.desc')}
      />
      <div className="w-full mt-4 mb-4 flex justify-end">
        <Search
          allowClear
          enterButton
          className="w-60 mr-[8px]"
          onSearch={handleInputSearchChange}
          placeholder={`${t('common.search')}...`}
        />
        <Button
          type="primary"
          onClick={addGroups}
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
            onClick={onOkaddteam}
          >
            {t('common.confirm')}
          </Button>,
          <Button
            key="cancel"
            onClick={() => setAddteammodalOpen(false)}
          >
            {t('common.cancel')}
          </Button>,
        ]}
      >
        <Form style={{ maxWidth: 600 }} form={form}>
          <Form.Item
            name="teamname"
            label={t('system.users.form.name')}
            colon={false}
            rules={[{ required: true, message: t('common.inputErrorMessage') }]}
          >
            <Input placeholder={t('common.inputPlaceholder')} />
          </Form.Item>
        </Form>
      </OperateModal>
      <CustomTable
        rowKey="key"
        pagination={false}
        expandedRowKeys={expandedRowKeysarr}
        onExpand={(expanded, record) => {
          onExpand(expanded, record);
        }}
        scroll={{ y: 'calc(100vh - 300px)' }}
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
      {/* 添加子组织的弹窗 */}
      <OperateModal
        title={t('system.groups.addsubGroups')}
        closable={false}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        open={addSubteammodalOpen}
        footer={[
          <Button key="submit" type="primary" onClick={onOkaddSubteam}>
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
            label={t('system.users.form.name')}
            colon={false}
            rules={[{ required: true, message: t('common.inputErrorMessage') }]}
          >
            <Input placeholder={t('common.inputPlaceholder')} />
          </Form.Item>
        </Form>
      </OperateModal>
      {/* 修改组织的名字的弹窗 */}
      <OperateModal
        title={t('system.groups.rename')}
        closable={false}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        open={renameteammodalOpen}
        footer={[
          <Button key="submit" type="primary" onClick={onOkrenameteam}>
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
            label={t('system.users.form.name')}
            colon={false}
            rules={[{ required: true, message: t('common.inputErrorMessage') }]}
          >
            <Input placeholder={t('common.inputPlaceholder')} />
          </Form.Item>
        </Form>
      </OperateModal>
    </div>
  );
};

export default Groups;
