'use client';
import React from 'react';
import Contentdrawer from '@/components/content-drawer';




const User = () => {
  return (
    <div>
      <Contentdrawer visible={false} onClose={function (): void {
        throw new Error('Function not implemented.');
      } } content={''}/>
    </div>
  );
};
export default User;

