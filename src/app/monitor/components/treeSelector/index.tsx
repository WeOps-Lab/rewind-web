import React, { useEffect, useState } from 'react';
import { Tree, Spin, Input } from 'antd';
import { TreeItem } from '@/app/monitor/types';
import { useTranslation } from '@/utils/i18n';

const { Search } = Input;

interface TreeComponentProps {
  data: TreeItem[];
  defaultSelectedKey?: string;
  loading?: boolean;
  onNodeSelect?: (key: string) => void;
}

const TreeComponent: React.FC<TreeComponentProps> = ({
  data,
  defaultSelectedKey,
  loading = false,
  onNodeSelect,
}) => {
  const { t } = useTranslation();
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [treeSearchValue, setTreeSearchValue] = useState<string>('');
  const [originalTreeData, setOriginalTreeData] = useState<TreeItem[]>([]);
  const [treeData, setTreeData] = useState<TreeItem[]>([]);

  useEffect(() => {
    if (defaultSelectedKey) {
      setSelectedKeys([defaultSelectedKey]);
      onNodeSelect?.(defaultSelectedKey);
    }
  }, [defaultSelectedKey]);

  useEffect(() => {
    setOriginalTreeData(data);
    setTreeData(data);
    setExpandedKeys(data.map((item) => item.key));
  }, [data]);

  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    const isFirstLevel = !!info.node?.children?.length;
    if (!isFirstLevel && selectedKeys?.length) {
      setSelectedKeys(selectedKeys);
      onNodeSelect?.(selectedKeys[0] as string);
    }
  };

  const filterTree = (data: TreeItem[], searchValue: string): TreeItem[] => {
    return data
      .map((item: any) => {
        const children = filterTree(item.children || [], searchValue);
        if (
          item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          children.length
        ) {
          return {
            ...item,
            children,
          };
        }
        return null;
      })
      .filter(Boolean) as TreeItem[];
  };

  const handleSearchTree = (value: string) => {
    if (!value) {
      setTreeData(originalTreeData);
    } else {
      const filteredData = filterTree(originalTreeData, value);
      setTreeData(filteredData);
    }
  };

  return (
    <div className='h-full'>
      <Spin spinning={loading}>
        <Search
          className="mb-[10px]"
          placeholder={t('common.searchPlaceHolder')}
          value={treeSearchValue}
          enterButton
          onChange={(e) => setTreeSearchValue(e.target.value)}
          onSearch={handleSearchTree}
        />
        <Tree
          showLine
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          treeData={treeData}
          onExpand={(keys) => setExpandedKeys(keys)}
          onSelect={handleSelect}
        />
      </Spin>
    </div>
  );
};

export default TreeComponent;
