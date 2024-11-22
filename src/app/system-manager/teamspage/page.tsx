'use client';
import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Button, Input, Form, message, Popconfirm, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import IntroductionInfo from '../components/introduction-info';
import OperateModal from '@/components/operate-modal';
import teamsStyle from './index.module.scss';
import { CaretDownOutlined, CaretRightOutlined, HolderOutlined } from '@ant-design/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CustomTable from '@/components/custom-table';
import { useTranslation } from '@/utils/i18n';
import { AnyObject } from 'antd/es/_util/type';
import useApiClient from '@/utils/request';
import { v4 as uuidv4 } from 'uuid';
//接口
interface DataType {
  key: string;
  name: string;
  children?: DataType[];
}

interface RowContextProps {
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  listeners?: SyntheticListenerMap;
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

interface Access {
  view: boolean;
  viewMembers: boolean;
  manageMembers: boolean;
  manage: boolean;
  manageMembership: boolean;
}

interface SubGroup {
  id: string;
  name: string;
  path: string;
  subGroupCount: number;
  subGroups: SubGroup[];
  access: Access;
}

interface Group {
  id: string;
  name: string;
  path: string;
  subGroupCount: number;
  subGroups: SubGroup[];
}


const Teams = () => {
  //hook函数
  const RowContext = React.createContext<RowContextProps>({});
  const Row: React.FC<RowProps> = (props) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: props['data-row-key'] });

    const style: React.CSSProperties = {
      ...props.style,
      transform: CSS.Translate.toString(transform),
      transition,
      ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    const contextValue = useMemo<RowContextProps>(
      () => ({ setActivatorNodeRef, listeners }),
      [setActivatorNodeRef, listeners],
    );

    return (
      <RowContext.Provider value={contextValue}>
        <tr {...props} ref={setNodeRef} style={style} {...attributes} />
      </RowContext.Provider>
    );
  };

  const [addSubteammodalOpen, setAddSubteammodalOpen] = useState(false);
  const [renameteammodalOpen, setRenameteammodalOpen] = useState(false);
  const [renamekey, setRenamekey] = useState('1');
  const [form] = Form.useForm();
  const [addsubteamkey, setAddsubteamkey] = useState('6');
  const [sortablearr, setSortablearr] = useState(['1', '2', '3', '4', '5']);
  const [expandedRowKeysarr, setExpandedRowKeys] = useState(['0']);

  const [datasourcefatherid, setDatasourcefatherid] = useState(['1']);
  const { get, del, put, post } = useApiClient();


  const { t } = useTranslation();
  const commonItems = {
    search: t('common.search'),
    cancel: t('common.cancel'),
    confirm: t('common.confirm')
  }

  const tableItem = {
    name: t('tableItem.name'),
    actions: t('tableItem.actions')
  }


  const teamItem = {
    addsubteams: t('teamItem.addsubteams'),
    rename: t('teamItem.rename'),
    delete: t('teamItem.delete'),
    teams: t('teamItem.teams'),
    teaminfo: t('teamItem.teaminfo'),
  }

  //数据
  const columns: any = [
    { key: 'sort', align: 'center', width: 28, render: (key: DataType) => (!datasourcefatherid.includes(key.key) ? true : false) ? <DragHandle /> : null },
    { title: tableItem.name, dataIndex: 'name', width: 450 },
    {
      title: tableItem.actions,
      dataIndex: 'actions',
      width: 300,
      render: (arr: string[], key: DataType) => (
        <>
          <Button className='mr-[8px]' type='link' onClick={() => { addsubteams(key) }}>
            {teamItem.addsubteams}
          </Button>
          <Button className='mr-[8px]' type='link' onClick={() => { renameteams(key) }}>
            {teamItem.rename}
          </Button>
          {!key.children || key.children.length === 0 ? (
            <Popconfirm
              title="Do you Want to delete this item?"
              description="After deletion, the data cannot be recovered."
              onConfirm={() => { deleteteams(key) }}
              okText="OK"
              cancelText="Cancel"
            >
              <Button className='mr-[8px]' type='link'>
                {teamItem.delete}
              </Button>
            </Popconfirm>
          ) : null}
        </>
      )
    }

  ];
  const [dataSource, setDataSource] = React.useState<DataType[]>();
  const [onlykeytable, setOnlykeytable] = useState<string>('6');

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id && over?.id) {
      const ActiveNode = findNodeByKey(dataSource as DataType[], active.id.toString());
      if (!isAncestor(dataSource as DataType[], active.id.toString(), over?.id.toString() as string)) {
        let temp = deleteNode(dataSource as DataType[], active.id.toString());
        setDataSource(temp)
        temp = addNode(temp, over?.id.toString() as string, ActiveNode as DataType)
        setDataSource(temp);
        setExpandedRowKeys([...expandedRowKeysarr, over?.id.toString()])
      }
    }
    //通过api来完成team的拖拽功能
    const drapteamresult=await dragTeamApi(active.id.toString(), over?.id);
    if (drapteamresult === 'ok') {
      message.success('Drag team success');
    } else {
      message.error('Drag team failed');
    }
    

  };


  //useEffect函数
  useEffect(() => {
    getOrganizationalDataApi();
  }, [])



  //普通函数
  const DragHandle: React.FC = () => {
    const { setActivatorNodeRef, listeners } = useContext(RowContext);
    return (
      <Button
        type="text"
        size="small"
        icon={<HolderOutlined />}
        style={{ cursor: 'move' }}
        ref={setActivatorNodeRef}
        {...listeners}
      />
    );
  };

  const addNode = (treeData: DataType[], targetKey: string, newNode: DataType): DataType[] => {
    return treeData.map(node => {
      if (node.key === targetKey) {
        return {
          ...node,
          children: [...(node.children || []), newNode]
        };
      } else if (node.children) {
        return {
          ...node,
          children: addNode(node.children, targetKey, newNode)
        };
      }
      return node;
    });
  };

  function addsubteams(key: { key: string }) {
    setAddSubteammodalOpen(true);
    setAddsubteamkey(key.key);
    form.resetFields();
  }
  function onOkaddSubteam() {
    const newData = addNode(dataSource as DataType[], addsubteamkey, { key: onlykeytable, name: form.getFieldValue('teamname') })
    setDataSource(newData);
    addSubTeamApi(onlykeytable);
    setSortablearr([...sortablearr, onlykeytable])
    setExpandedRowKeys([...expandedRowKeysarr, addsubteamkey])
    const newkey = generateUUID();
    setOnlykeytable(newkey);
    setAddSubteammodalOpen(false);
  }


  const renameNode = (treeData: DataType[], targetKey: string, renameTeam: string): DataType[] => {
    return treeData.map(node => {
      if (node.key === targetKey) {
        return {
          ...node,
          name: renameTeam
        };
      } else if (node.children) {
        return {
          ...node,
          children: renameNode(node.children, targetKey, renameTeam)
        };
      }
      return node;
    });
  };

  const findNode = (treeData: DataType[], targetKey: string): DataType[] => {
    return treeData.map(node => {
      if (node.key === targetKey) {
        form.setFieldsValue({ renameteam: node.name })
      } else if (node.children) {
        return {
          ...node,
          children: findNode(node.children, targetKey)
        };
      }
      return node;
    });
  };

  function findNodeByKey(tree: DataType[], key: string): DataType | null {
    for (const node of tree) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const foundInChildren = findNodeByKey(node.children, key);
        if (foundInChildren) {
          return foundInChildren;
        }
      }
    }
    return null;
  }

  function renameteams(key: { key: string }) {
    setRenameteammodalOpen(true);
    setRenamekey(key.key);
    form.resetFields();
    findNode(dataSource as DataType[], key.key)
  }



  function onOkrenameteam() {
    const newData = renameNode(dataSource as DataType[], renamekey, form.getFieldValue('renameteam'))
    setDataSource(newData);
    renameTeamApi();
    setRenameteammodalOpen(false);
  }

  const deleteNode = (treeData: DataType[], targetKey: string): DataType[] => {
    return treeData.filter(node => node.key !== targetKey).map(node => {
      if (node.children) {
        return {
          ...node,
          children: deleteNode(node.children, targetKey)
        };
      }
      return node;
    });
  };
  function deleteteams(key: { key: string }) {
    const newData = deleteNode(dataSource as DataType[], key.key);
    setDataSource(newData);
    deleteteamApi(key.key);
    getOrganizationalDataApi();
  }

  const isAncestor = (treeData: DataType[], nodeAKey: string, nodeBKey: string): boolean => {
    const findInSubtree = (subtree: DataType[], targetKey: string) => {
      for (const node of subtree) {
        if (node.key === targetKey) {
          return true;
        } else if (node.children) {
          if (findInSubtree(node.children, targetKey)) {
            return true;
          }
        }
      }
      return false;
    };
    for (const rootNode of treeData) {
      if (rootNode.key === nodeAKey) {
        if (findInSubtree(rootNode.children || [], nodeBKey)) {
          return true;
        }
      }
      else if (rootNode.children) {
        for (const node of rootNode.children) {
          if (isAncestor([node], nodeAKey, nodeBKey)) {
            return true;
          }
        }
      }

    }
    return false;
  };

  function onExpand(expanded: boolean, record: AnyObject) {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeysarr, record.key])
    } else {
      setExpandedRowKeys(expandedRowKeysarr.filter(item => item !== record.key))
    }
  }

  const transformGroups = (groups: Group[]): DataType[] => {
    return groups.map((group: { id: string; name: string; subGroups: Group[] | []; }) => {
      return {
        key: group.id,
        name: group.name,
        children: group.subGroups && group.subGroups.length > 0
          ? transformGroups(group.subGroups)
          : []
      };
    });
  };

  const generateUUID = () => {
    const newUUID = uuidv4();
    return newUUID;
  };

  //api函数
  async function getOrganizationalDataApi() {
    const data = await get('/lite/group/', {
      params: {
        max: 11
      },
    });
    const arr = transformGroups(data);
    setDataSource(arr);
    const datasourcefatherid: string[] = []
    arr.forEach((item: DataType) => {
      datasourcefatherid.push(item.key);
    });
    setDatasourcefatherid(datasourcefatherid)
  }


  async function addSubTeamApi(parent_group_id: string) {
    try {
      const response: { message: string } = await post(`/lite/group/`, {
        params: {
          group_name: form.getFieldValue('teamname'),
          parent_group_id
        },
      });
      message.success(response.message);

    } catch (error) {
      console.error('Failed to add subteam:', error);
    }
  }

  async function renameTeamApi() {
    try {
      const response: { message: string } = await put(`/lite/group/${renamekey}`, {
        params: {
          group_name: form.getFieldValue('renameteam'),
        },
      });
      message.success(response.message)
    } catch (error) {
      console.error('Failed to rename team:', error);
    }
  }

  async function deleteteamApi(group_id: string) {
    try {
      const response: { message: string } = await del(`/lite/group/delete_groups/`, {
        params: {
          group_id
        },
      });
      message.success(response.message);
    } catch (error) {
      console.log(error)
    }
  }
  
  async function dragTeamApi(dragactive_id: string, dragover_id: unknown) {
    try {
      const response: { message: string } = await post(`/lite/group/`, {
        params: {
          dragactive_id,
          dragover_id
        },
      });
      message.success(response.message);
      return response.message;
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className={`${teamsStyle.height}`} >
      <IntroductionInfo title={teamItem.teams} message={teamItem.teaminfo} />
      <div className='w-full h-[24px] mt-[19px] mb-[19px]'><Input className='inputwidth' placeholder={`${commonItems.search}...`}  /></div>
      <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
        <SortableContext items={[]} strategy={verticalListSortingStrategy}>
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerSplitColor: "#fafafa",
                  selectionColumnWidth: 10,
                }
              }
            }}
          >
            <CustomTable
              rowKey="key"
              pagination={false}
              expandedRowKeys={expandedRowKeysarr}
              onExpand={(expanded, record) => { onExpand(expanded, record) }}
              size="small"
              expandIconColumnIndex={1}
              scroll={{ y: 'calc(100vh - 300px)', x: 'calc(100vw-100px)' }}
              components={{ body: { row: Row } }}
              columns={columns}
              expandable={{
                expandIcon: ({ expanded, onExpand, record }) =>
                  expanded ? (
                    <CaretDownOutlined onClick={e => onExpand(record, e)} />
                  ) : (
                    <CaretRightOutlined onClick={e => onExpand(record, e)} />
                  ),
                indentSize: 22,
              }}
              dataSource={dataSource}
            />
          </ConfigProvider>

        </SortableContext>
      </DndContext>
      <OperateModal
        title={'Add Sub-team'}
        closable={false}
        okText={commonItems.confirm}
        cancelText={commonItems.cancel}
        open={addSubteammodalOpen}
        footer={[
          <Button key="submit" type="primary" onClick={() => onOkaddSubteam()}>
            Confirm
          </Button>,
          <Button key="cancel" onClick={() => setAddSubteammodalOpen(false)}>
            Cancel
          </Button>,
        ]}
      >
        <Form style={{ maxWidth: 600 }} form={form}>
          <Form.Item name="teamname" label={`${'Name'}*`} colon={false}>
            <Input placeholder="input placeholder" />
          </Form.Item>
        </Form>
      </OperateModal>
      <OperateModal
        title={'Rename'}
        closable={false}
        okText={commonItems.confirm}
        cancelText={commonItems.cancel}
        open={renameteammodalOpen}
        footer={[
          <Button key="submit" type="primary" onClick={() => onOkrenameteam()}>
            Confirm
          </Button>,
          <Button key="cancel" onClick={() => setRenameteammodalOpen(false)}>
            Cancel
          </Button>,
        ]}
      >
        <Form style={{ maxWidth: 600 }} form={form}>
          <Form.Item name="renameteam" label={`${'Name'}*`} colon={false}>
            <Input placeholder="input placeholder" />
          </Form.Item>
        </Form>
      </OperateModal>
    </div>
  );
};

export default Teams;
