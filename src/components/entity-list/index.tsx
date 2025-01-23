import React, { useState, useMemo, useCallback } from 'react';
import { Input, Spin, Dropdown, Tag, Button, Empty } from 'antd'; // 引入 Empty 组件
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';
import styles from './index.module.scss';
import PermissionWrapper from '@/components/permission';

interface EntityListProps<T> {
  data: T[];
  loading: boolean;
  menuActions?: (item: T) => React.ReactNode;
  singleAction?: (item: T) => { text: string, onClick: (item: T) => void };
  openModal?: (item?: T) => void;
  onSearch?: (value: string) => void;
  onCardClick?: (item: T) => void;
}

const EntityList = <T,>({
  data,
  loading,
  menuActions,
  singleAction,
  openModal,
  onSearch,
  onCardClick,
}: EntityListProps<T>) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const filteredItems = useMemo(() => {
    return data.filter((item) => (item as any).name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, searchTerm]);

  const tagColors = ['red', 'orange', 'blue', 'purple'];

  const getColorForTag = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % tagColors.length;
    return tagColors[index];
  };

  const renderCard = useCallback((item: T) => {
    const { id, name, description, icon, tag } = item as any;
    const singleButtonAction = singleAction ? singleAction(item) : null;

    return (
      <div
        key={id}
        className={`p-4 rounded-xl relative shadow-md ${onCardClick ? 'cursor-pointer' : ''} ${styles.commonCard}`}
        onClick={() => (onCardClick ? onCardClick(item) : undefined)}
        onMouseEnter={() => setHoveredCard(id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        {menuActions && (
          <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
            <Dropdown overlay={menuActions(item) as React.ReactElement} trigger={['click']} placement="bottomRight">
              <div className="cursor-pointer">
                <Icon type="sangedian-copy" className="text-xl" />
              </div>
            </Dropdown>
          </div>
        )}
        <div className="flex items-center mb-2">
          <div className="rounded-full">
            <Icon type={icon} className="text-4xl" />
          </div>
          <h3 className="ml-2 text-base font-semibold truncate" title={name}>
            {name}
          </h3>
        </div>
        {tag && tag.length > 0 && (
          <div className="mb-2">
            {tag.map((t: any, idx: number) => (
              <Tag key={idx} color={getColorForTag(t)} className="mr-1">
                {t}
              </Tag>
            ))}
          </div>
        )}
        <p className={`my-5 text-sm ${hoveredCard === id ? 'line-clamp-2' : 'line-clamp-3'} ${styles.desc}`}>{description}</p>
        {singleButtonAction && (
          <Button
            type="primary"
            className={`w-[92%] absolute bottom-2 left-1/2 transform -translate-x-1/2 ${hoveredCard === id ? '' : 'hidden'}`}
            onClick={(e) => {
              e.stopPropagation();
              singleButtonAction.onClick(item);
            }}
          >
            {singleButtonAction.text}
          </Button>
        )}
      </div>
    );
  }, []);

  return (
    <div className="w-full min-h-screen">
      <div className="flex justify-end mb-4">
        <Input
          size="large"
          placeholder={`${t('common.search')}...`}
          style={{ width: '350px' }}
          onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
        />
      </div>
      <Spin spinning={loading}>
        {filteredItems.length === 0 ? (
          <Empty description={t('common.noData')} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {openModal && (
              <PermissionWrapper
                requiredPermissions={['Add']}
                className={`shadow-md p-4 rounded-xl flex items-center justify-center cursor-pointer ${styles.addNew}`}
              >
                <div
                  className="w-full h-full flex items-center justify-center"
                  onClick={() => openModal()}
                >
                  <div className="text-center">
                    <div className="text-2xl">+</div>
                    <div className="mt-2">{t('common.addNew')}</div>
                  </div>
                </div>
              </PermissionWrapper>
            )}
            {filteredItems.map((item) => renderCard(item))}
          </div>
        )}
      </Spin>
    </div>
  );
};

export default EntityList;
