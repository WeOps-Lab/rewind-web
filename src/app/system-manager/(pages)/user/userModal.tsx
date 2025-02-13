import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Input, Button, Form, Transfer, message, Spin, Tree, Select } from 'antd';
import OperateModal from '@/components/operate-modal';
import type { FormInstance } from 'antd';
import { useTranslation } from '@/utils/i18n';
import { useUserApi } from '@/app/system-manager/api/user/index';
import type { DataNode as TreeDataNode } from 'antd/lib/tree';
import { useClientData } from '@/context/client';
import { ZONEINFO_OPTIONS, LOCALE_OPTIONS } from '@/app/system-manager/constants/userDropdowns';

interface ModalProps {
  onSuccess: () => void;
  treeData: TreeDataNode[];
}

interface ModalConfig {
  type: 'add' | 'edit';
  userId?: string;
  groupKeys?: string[];
}

export interface ModalRef {
  showModal: (config: ModalConfig) => void;
}

const UserModal = forwardRef<ModalRef, ModalProps>(({ onSuccess, treeData }, ref) => {
  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);
  const { clientData } = useClientData();
  const [currentUserId, setCurrentUserId] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<'add' | 'edit'>('add');
  const [roleTreeData, setRoleTreeData] = useState<TreeDataNode[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { addUser, editUser, getUserDetail, getRoleList } = useUserApi();

  const fetchRoleInfo = async () => {
    try {
      const roleData = await getRoleList({ client_list: clientData });
      setRoleTreeData(
        roleData.map((item: any) => ({
          key: String(item.id),
          title: item.display_name,
          selectable: false,
          children: item.children.map((child: any) => ({
            key: String(child.role_id),
            title: child.role_name,
            selectable: true,
          })),
        })),
      );
    } catch {
      message.error(t('common.fetchFailed'));
    }
  };

  const fetchUserDetail = async (userId: string) => {
    setLoading(true);
    try {
      const id = clientData.map(client => client.id);
      const userDetail = await getUserDetail({ user_id: userId, id });
      if (userDetail) {
        setCurrentUserId(userId);
        formRef.current?.setFieldsValue({
          ...userDetail,
          roles: userDetail.roles?.map((role: { role_id: string }) => role.role_id) || [],
          groups: userDetail.groups?.map((group: { id: string }) => group.id) || [],
          zoneinfo: userDetail.attributes?.zoneinfo ? userDetail.attributes.zoneinfo[0] : undefined,
          locale: userDetail.attributes?.locale ? userDetail.attributes.locale[0] : undefined,
        });
        setSelectedRoles(userDetail.roles?.map((role: { role_id: string }) => role.role_id) || []);
        setSelectedGroups(userDetail.groups?.map((group: { id: string }) => group.id) || []);
      }
    } catch {
      message.error(t('common.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    showModal: ({ type, userId, groupKeys = [] }) => {
      setVisible(true);
      setType(type);
      formRef.current?.resetFields();

      if (type === 'edit' && userId) {
        fetchUserDetail(userId);
      } else if (type === 'add') {
        setSelectedGroups(groupKeys);
        setSelectedRoles([]);
        setTimeout(() => {
          formRef.current?.setFieldsValue({ groups: groupKeys, zoneinfo: "Asia/Shanghai", locale: "en" });
        }, 0);
      }
      fetchRoleInfo();
    },
  }));

  const handleCancel = () => {
    setVisible(false);
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      const formData = await formRef.current?.validateFields();
      const { zoneinfo, locale, ...restData } = formData;
      const roles: { id: string; name: string }[] = [];
      roleTreeData.forEach(parent => {
        if (parent.children) {
          parent.children.forEach((child: any) => {
            if (selectedRoles.includes(child.key)) {
              roles.push({ id: child.key as string, name: child.title as string });
            }
          });
        }
      });
      const payload = {
        ...restData,
        roles,
        attributes: { zoneinfo: [zoneinfo], locale: [locale] }
      };
      if (type === 'add') {
        await addUser(payload);
        message.success(t('common.addSuccess'));
      } else {
        await editUser({ user_id: currentUserId, ...payload });
        message.success(t('common.updateSuccess'));
      }
      onSuccess();
      setVisible(false);
    } catch {
      message.error(t('common.valFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const transformTreeData = (data: any) => {
    return data.map((node: any) => ({
      title: node.title || 'Unknown',
      value: node.key,
      key: node.key,
      children: node.children ? transformTreeData(node.children) : []
    }));
  };

  const filteredTreeData = treeData ? transformTreeData(treeData) : [];

  const flattenTree = (nodes: any[]): { key: string; title: string }[] => {
    return nodes.reduce((acc, node) => {
      acc.push({ key: node.value, title: node.title });
      if (node.children && node.children.length) {
        acc = acc.concat(flattenTree(node.children));
      }
      return acc;
    }, [] as { key: string; title: string }[]);
  };

  const groupDataSource = flattenTree(filteredTreeData);

  // 新增：将 roleTreeData 扁平化用于 Transfer 的 dataSource
  const flattenRoleData = (nodes: TreeDataNode[]): { key: string; title: string }[] => {
    return nodes.reduce<{ key: string; title: string }[]>((acc, node) => {
      if (node.selectable) {
        acc.push({ key: node.key as string, title: node.title as string });
      }
      if (node.children) {
        acc = acc.concat(flattenRoleData(node.children));
      }
      return acc;
    }, []);
  };
  const flattenedRoleData = flattenRoleData(roleTreeData);

  return (
    <OperateModal
      title={type === 'add' ? t('common.add') : t('common.edit')}
      width={860}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('common.cancel')}
        </Button>,
        <Button key="submit" type="primary" onClick={handleConfirm} loading={isSubmitting || loading}>
          {t('common.confirm')}
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Form ref={formRef} layout="vertical">
          <Form.Item
            name="username"
            label={t('system.user.form.username')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Input placeholder={`${t('common.inputMsg')}${t('system.user.form.username')}`} disabled={type === 'edit'} />
          </Form.Item>
          <Form.Item
            name="email"
            label={t('system.user.form.email')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Input placeholder={`${t('common.inputMsg')}${t('system.user.form.email')}`} />
          </Form.Item>
          <Form.Item
            name="lastName"
            label={t('system.user.form.lastName')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Input placeholder={`${t('common.inputMsg')}${t('system.user.form.lastName')}`} />
          </Form.Item>
          <Form.Item
            name="zoneinfo"
            label={t('system.user.form.zoneinfo')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Select showSearch placeholder={`${t('common.selectMsg')}${t('system.user.form.zoneinfo')}`}>
              {ZONEINFO_OPTIONS.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {t(option.label)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="locale"
            label={t('system.user.form.locale')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Select placeholder={`${t('common.selectMsg')}${t('system.user.form.locale')}`}>
              {LOCALE_OPTIONS.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {t(option.label)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="groups"
            label={t('system.user.form.group')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Transfer
              oneWay
              dataSource={groupDataSource}
              targetKeys={selectedGroups}
              className="tree-transfer"
              render={(item) => item.title}
              showSelectAll={false}
              onChange={nextTargetKeys => {
                setSelectedGroups(nextTargetKeys as string[]);
                formRef.current?.setFieldsValue({ groups: nextTargetKeys });
              }}
            >
              {({ direction }) => {
                if (direction === 'left') {
                  return (
                    <div style={{ padding: '4px', maxHeight: 250, overflow: 'auto' }}>
                      <Tree
                        blockNode
                        checkable
                        checkStrictly
                        defaultExpandAll
                        checkedKeys={selectedGroups}
                        treeData={filteredTreeData}
                        onCheck={(checkedKeys, info) => {
                          const newKeys = info.checkedNodes.map((node: any) => node.key);
                          setSelectedGroups(newKeys);
                          formRef.current?.setFieldsValue({ groups: newKeys });
                        }}
                      />
                    </div>
                  );
                }
                return null;
              }}
            </Transfer>
          </Form.Item>
          <Form.Item
            name="roles"
            label={t('system.user.form.role')}
            rules={[{ required: true, message: t('common.inputRequired') }]}
          >
            <Transfer
              oneWay
              dataSource={flattenedRoleData}
              targetKeys={selectedRoles}
              className="tree-transfer"
              render={(item) => item.title}
              showSelectAll={false}
              onChange={nextTargetKeys => {
                setSelectedRoles(nextTargetKeys as string[]);
                formRef.current?.setFieldsValue({ roles: nextTargetKeys });
              }}
            >
              {({ direction }) => {
                if (direction === 'left') {
                  return (
                    <div style={{ padding: '4px', maxHeight: 250, overflow: 'auto' }}>
                      <Tree
                        blockNode
                        checkable
                        selectable={false}
                        defaultExpandAll
                        checkedKeys={selectedRoles}
                        treeData={roleTreeData}
                        onCheck={(checkedKeys, info) => {
                          const newKeys = info.checkedNodes.map((node: any) => node.key);
                          setSelectedRoles(newKeys);
                          formRef.current?.setFieldsValue({ roles: newKeys });
                        }}
                      />
                    </div>
                  );
                }
              }}
            </Transfer>
          </Form.Item>
        </Form>
      </Spin>
    </OperateModal>
  );
});

UserModal.displayName = 'UserModal';
export default UserModal;
