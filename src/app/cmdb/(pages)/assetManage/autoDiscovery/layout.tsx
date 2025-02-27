'use client';

import React, { useEffect } from 'react';
import WithSideMenuLayout from '@/components/sub-layout';
import useApiClient from '@/utils/request';

const AutoDiscoveryLayout = ({ children }: { children: React.ReactNode }) => {
  const { get, isLoading } = useApiClient();

  useEffect(() => {
    if (isLoading) return;
  }, [isLoading, get]);

  return <WithSideMenuLayout>{children}</WithSideMenuLayout>;
};

export default AutoDiscoveryLayout;
