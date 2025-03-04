'use client';

import React from 'react';
import WithSideMenuLayout from '@/components/sub-layout';

const AutoDiscoveryLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ ['--custom-height' as string]: 'calc(100vh - 150px)' }}>
      <WithSideMenuLayout>{children}</WithSideMenuLayout>
    </div>
  );
};

export default AutoDiscoveryLayout;