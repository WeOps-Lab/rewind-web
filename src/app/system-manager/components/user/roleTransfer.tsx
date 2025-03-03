import React from 'react';
import { Transfer, Tree } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { DataNode as TreeDataNode } from 'antd/lib/tree';

interface RoleTransferProps {
  roleTreeData: TreeDataNode[];
  selectedRoles: string[];
  onChange: (newRoles: string[]) => void;
}

export const flattenRoleData = (nodes: TreeDataNode[]): { key: string; title: string }[] => {
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

const filterTreeData = (nodes: TreeDataNode[], selectedRoles: string[]): TreeDataNode[] => {
  return nodes.reduce<TreeDataNode[]>((acc, node) => {
    const newNode = { ...node };
    if (node.children) {
      const filtered = filterTreeData(node.children, selectedRoles);
      if (filtered.length > 0) {
        newNode.children = filtered;
        acc.push(newNode);
      } else if (selectedRoles.includes(String(node.key))) {
        acc.push(newNode);
      }
    } else if (selectedRoles.includes(String(node.key))) {
      acc.push(newNode);
    }
    return acc;
  }, []);
};

const getSubtreeKeys = (node: TreeDataNode): string[] => {
  const keys = [String(node.key)];
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => {
      keys.push(...getSubtreeKeys(child));
    });
  }
  return keys;
};

const cleanSelectedRoles = (
  selected: string[],
  nodes: TreeDataNode[]
): string[] => {
  let result = [...selected];
  nodes.forEach(node => {
    if (!node.selectable && node.children) {
      const childSelectable = flattenRoleData(node.children).map(item => item.key);
      if (result.includes(String(node.key))) {
        if (!childSelectable.every(childKey => result.includes(childKey))) {
          result = result.filter(key => key !== String(node.key));
        }
      }
      result = cleanSelectedRoles(result, node.children);
    }
  });
  return result;
};

const transformRightTree = (
  nodes: TreeDataNode[],
  roleTreeData: TreeDataNode[],
  selectedRoles: string[],
  onRemove: (newRoles: string[]) => void
): TreeDataNode[] => {
  return nodes.map(node => ({
    ...node,
    title: (
      <div className="flex justify-between items-center w-full">
        <span>{typeof node.title === 'function' ? node.title(node) : node.title}</span>
        <DeleteOutlined
          className="cursor-pointer text-[var(--color-text-4)]"
          onClick={e => {
            e.stopPropagation();
            const keysToRemove = getSubtreeKeys(node);
            let updated = selectedRoles.filter(key => !keysToRemove.includes(key));
            updated = cleanSelectedRoles(updated, roleTreeData);
            onRemove(updated);
          }}
        />
      </div>
    ),
    children: node.children ? transformRightTree(node.children, roleTreeData, selectedRoles, onRemove) : []
  }));
};

// 新增：辅助函数递归获取所有节点的 key
const getAllKeys = (nodes: TreeDataNode[]): string[] => {
  return nodes.reduce<string[]>((acc, node) => {
    acc.push(String(node.key));
    if (node.children) {
      acc.push(...getAllKeys(node.children));
    }
    return acc;
  }, []);
};

const RoleTransfer: React.FC<RoleTransferProps> = ({ roleTreeData, selectedRoles, onChange }) => {
  const flattenedRoleData = flattenRoleData(roleTreeData);
  const leftExpandedKeys = getAllKeys(roleTreeData);

  // 获取右侧过滤后的 tree 数据
  const filteredRightData = filterTreeData(roleTreeData, selectedRoles);
  const rightTransformedData = transformRightTree(filteredRightData, roleTreeData, selectedRoles, onChange);
  const rightExpandedKeys = getAllKeys(rightTransformedData);

  return (
    <Transfer
      oneWay
      dataSource={flattenedRoleData}
      targetKeys={selectedRoles}
      className="tree-transfer"
      render={(item) => item.title}
      showSelectAll={false}
      onChange={(nextTargetKeys) => {
        onChange(nextTargetKeys as string[]);
      }}
    >
      {({ direction }) => {
        if (direction === 'left') {
          return (
            <div className="p-1 max-h-[250px] overflow-auto">
              <Tree
                blockNode
                checkable
                selectable={false}
                expandedKeys={leftExpandedKeys}
                checkedKeys={selectedRoles}
                treeData={roleTreeData}
                onCheck={(checkedKeys, info) => {
                  const newKeys = info.checkedNodes.map((node: any) => node.key);
                  onChange(newKeys);
                }}
              />
            </div>
          );
        } else if (direction === 'right') {
          return (
            <div className="w-full p-1 max-h-[250px] overflow-auto">
              <Tree
                blockNode
                selectable={false}
                expandedKeys={rightExpandedKeys}
                treeData={rightTransformedData}
              />
            </div>
          );
        }
      }}
    </Transfer>
  );
};

export default RoleTransfer;
