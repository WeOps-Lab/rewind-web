'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { useTranslation } from '@/utils/i18n';
import EntityList from '@/components/entity-list';
import { useRoleApi } from '@/app/system-manager/api/role/index';

const RolePage = () => {
  const { t } = useTranslation();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getClientData } = useRoleApi();
  const router = useRouter();

  const loadItems = async (searchTerm = '') => {
    setLoading(true);
    try {
      console.log('loadItems');
      const data = await getClientData();
      const filteredData = data.filter((item: { name: string }) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
      setDataList(filteredData.map((item: { name: string }) => ({
        ...item,
        icon: 'rizhiguanli',
      })));
      console.log('data', filteredData);
    } catch {
      message.error(t('common.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSearch = async (value: string) => {
    await loadItems(value);
  };

  const handleCardClick = (item: any) => {
    router.push(`/system-manager/role/manage?id=${item.id}&clientId=${item.client_id}`);
  };

  return (
    <div className='w-full'>
      <EntityList
        data={dataList}
        loading={loading}
        onSearch={handleSearch}
        onCardClick={handleCardClick}
      />
    </div>
  );
};

export default RolePage;
