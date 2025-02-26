import React, { useState, useMemo, useCallback } from 'react';
import { Input, Spin, Dropdown, Tag, Button, Empty } from 'antd';
import { useTranslation } from '@/utils/i18n';
import Icon from '@/components/icon';
import styles from './index.module.scss';
import { EntityListProps } from '@/types';
import PermissionWrapper from '@/components/permission';

const { Search } = Input;

const EntityList = <T,>({
  data,
  loading,
  searchSize = 'large',
  menuActions,
  singleAction,
  openModal,
  onSearch,
  onCardClick,
  displayTagBelowName,
}: EntityListProps<T> & { displayTagBelowName?: boolean }) => {
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
    return data.filter((item) => (item as any).name?.toLowerCase().includes(searchTerm.toLowerCase()));
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
        onMouseEnter={() => setHoveredCard((current) => (current !== id ? id : current))}
        onMouseLeave={() => setHoveredCard((current) => (current === id ? null : current))}
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
        <div className="flex items-center">
          <div
            className={displayTagBelowName ? 'flex items-center justify-center' : 'rounded-full'}
            style={displayTagBelowName ? { height: 'auto' } : {}}
          >
            <Icon type={icon} className={displayTagBelowName ? `text-6xl` : 'text-4xl'} />
          </div>
          <div className="ml-2">
            <h3 className="text-base font-semibold truncate" title={name}>
              {name}
            </h3>
            {displayTagBelowName && tag && tag.length > 0 && (
              <div>
                {tag.map((t: any, idx: number) => (
                  <Tag key={idx} color={getColorForTag(t)} className="mr-1">
                    {t}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </div>
        {!displayTagBelowName && tag && tag.length > 0 && (
          <div className="mt-2">
            {tag.map((t: any, idx: number) => (
              <Tag key={idx} color={getColorForTag(t)} className="mr-1">
                {t}
              </Tag>
            ))}
          </div>
        )}
        <div className="h-[66px]">
          <p
            className={`mt-3 text-sm max-h-[66px] ${hoveredCard === id ? 'line-clamp-2' : 'line-clamp-3'} ${styles.desc}`}>{description}</p>
        </div>
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
  }, [displayTagBelowName, hoveredCard]);

  return (
    <div className="w-full h-full">
      <div className="flex justify-end mb-4">
        <Search
          size={searchSize}
          allowClear
          enterButton
          placeholder={`${t('common.search')}...`}
          style={{width: '350px'}}
          onSearch={handleSearch}
        />
      </div>
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Spin spinning={loading}></Spin>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default EntityList;
