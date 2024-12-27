'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Form, message, Modal, Spin } from 'antd';
import CustomTable from '@/components/custom-table';
import TopSection from '@/components/top-section';
import OperateModal from '@/components/operate-modal';
import { DataType, OriginalGroup, ConvertedGroup } from '@/app/system-manager/types/group';
import { useTranslation } from '@/utils/i18n';
import { useApiTeam } from '@/app/system-manager/api/group/index';

const { Search } = Input;

const Groups = () => {
  const [form] = Form.useForm();
  const [addSubTeamKey, setAddSubTeamKey] = useState('');
  const [renameKey, setRenameKey] = useState('');
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [addTeamModalOpen, setAddTeamModalOpen] = useState(false);
  const [addSubTeamModalOpen, setAddSubTeamModalOpen] = useState(false);
  const [renameTeamModalOpen, setRenameTeamModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState<DataType[]>();
  const [loading, setLoading] = useState(false);

  const { t } = useTranslation();
  const { getTeamData, addTeamData, renameTeam, deleteTeam } = useApiTeam();

  const columns: any = [
    { title: t('system.user.form.name'), dataIndex: 'name', width: 450 },
    {
      title: t('common.actions'),
      dataIndex: 'actions',
      width: 300,
      render: (_: string, data: DataType) => (
        <>
          <Button type="link" className="mr-[8px]" onClick={() => addSubGroup(data.key)}>
            {t('system.group.addsubGroups')}
          </Button>
          <Button type="link" className="mr-[8px]" onClick={() => renameGroup(data.key)}>
            {t('system.group.rename')}
          </Button>
          {!data.children || data.children.length === 0 ? (
            <Button type="link" onClick={() => deleteGroup(data.key)}>
              {t('common.delete')}
            </Button>
          ) : null}
        </>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const teamData = await getTeamData();
      const convertedData = convertGroups(teamData);
      setDataSource(convertedData);
    } finally {
      setLoading(false);
    }
  }, [getTeamData]);

  const convertGroups = (groups: OriginalGroup[]): ConvertedGroup[] => {
    return groups.map((group) => {
      const groupData: ConvertedGroup = {
        key: group.id,
        name: group.name,
      };
      if (group.subGroups && group.subGroups.length > 0) {
        groupData.children = convertGroups(group.subGroups);
      }
      return groupData;
    });
  };

  const handleInputSearchChange = async (value: string) => {
    setLoading(true);
    try {
      const teamData = await getTeamData();
      const filteredData = teamData.filter((group: any) => group.name.includes(value));
      const newData = convertGroups(filteredData);
      setDataSource(newData);
    } finally {
      setLoading(false);
    }
  };

  const addGroup = () => {
    setAddTeamModalOpen(true);
    form.resetFields();
  };

  const onAddTeam = async () => {
    try {
      await form.validateFields();
      setAddTeamModalOpen(false);
      await addTeamData({
        group_name: form.getFieldValue('teamName')
      });
      await fetchData();
      message.success(t('common.addSuccess'));
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const addSubGroup = (key: string) => {
    setAddSubTeamModalOpen(true);
    setAddSubTeamKey(key);
    form.resetFields();
  };

  const onAddSubTeam = async () => {
    try {
      await form.validateFields();
      const teamName = form.getFieldValue('teamName');
      await addTeamData({
        group_name: teamName,
        parent_group_id: addSubTeamKey
      });
      await fetchData();
      message.success(t('common.addSuccess'));
      setExpandedRowKeys((prev) => [...prev, addSubTeamKey]);
      setAddSubTeamModalOpen(false);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const renameGroup = (key: string) => {
    setRenameTeamModalOpen(true);
    setRenameKey(key);
    form.resetFields();
    findNode(dataSource as DataType[], key);
  };

  const findNode = (treeData: DataType[], targetKey: string): DataType | undefined => {
    for (const node of treeData) {
      if (node.key === targetKey) {
        form.setFieldsValue({ renameTeam: node.name });
        return node;
      } else if (node.children) {
        const childNode = findNode(node.children, targetKey);
        if (childNode) return childNode;
      }
    }
  };

  const onRenameTeam = async () => {
    try {
      await form.validateFields();
      const newName = form.getFieldValue('renameTeam');
      await renameTeam(newName, renameKey);
      await fetchData();
      message.success(t('system.group.renameSuccess'));
      setRenameTeamModalOpen(false);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  const deleteGroup = (key: string) => {
    showDeleteConfirm(key);
  };

  const onExpand = (expanded: boolean, record: DataType) => {
    setExpandedRowKeys(prev => expanded ? [...prev, record.key] : prev.filter(key => key !== record.key));
  };

  const showDeleteConfirm = (key: string) => {
    Modal.confirm({
      title: t('common.delConfirm'),
      content: t('common.delConfirmCxt'),
      centered: true,
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk: async () => {
        await deleteTeam(key);
        await fetchData();
        message.success(t('common.delSuccess'));
      },
    });
  };

  return (
    <div className="w-full">
      <TopSection title={t('system.group.title')} content={t('system.group.desc')} />
      <div className="w-full mt-4 mb-4 flex justify-end">
        <Search
          allowClear
          enterButton
          className="w-60 mr-[8px]"
          onSearch={handleInputSearchChange}
          placeholder={`${t('common.search')}...`}
        />
        <Button type="primary" onClick={addGroup}>+{t('common.add')}</Button>
      </div>

      <Spin spinning={loading}>
        <CustomTable
          rowKey="key"
          pagination={false}
          expandedRowKeys={expandedRowKeys}
          onExpand={onExpand}
          scroll={{ y: 'calc(100vh - 300px)' }}
          columns={columns}
          dataSource={dataSource}
        />
      </Spin>

      <OperateModal
        title={t('common.add')}
        closable={false}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        open={addTeamModalOpen}
        onOk={onAddTeam}
        onCancel={() => setAddTeamModalOpen(false)}
      >
        <Form form={form}>
          <Form.Item
            name="teamName"
            label={t('system.user.form.name')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Input placeholder={`${t('common.inputMsg')}${t('system.user.form.name')}`} />
          </Form.Item>
        </Form>
      </OperateModal>

      <OperateModal
        title={t('system.group.addSubGroups')}
        closable={false}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        open={addSubTeamModalOpen}
        onOk={onAddSubTeam}
        onCancel={() => setAddSubTeamModalOpen(false)}
      >
        <Form form={form}>
          <Form.Item
            name="teamName"
            label={t('system.user.form.name')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Input placeholder={`${t('common.inputMsg')}${t('system.user.form.name')}`} />
          </Form.Item>
        </Form>
      </OperateModal>

      {/* Rename Team Modal */}
      <OperateModal
        title={t('system.group.rename')}
        closable={false}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        open={renameTeamModalOpen}
        onOk={onRenameTeam}
        onCancel={() => setRenameTeamModalOpen(false)}
      >
        <Form form={form}>
          <Form.Item
            name="renameTeam"
            label={t('system.user.form.name')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Input placeholder={`${t('common.inputMsg')}${t('system.user.form.name')}`} />
          </Form.Item>
        </Form>
      </OperateModal>
    </div>
  );
};

export default Groups;
