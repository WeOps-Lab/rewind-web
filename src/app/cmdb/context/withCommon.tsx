'use client';

import CommonProvider from './common';

export const withCommon = (WrappedComponent: React.ComponentType<any>) => {
  return function WithCommonComponent(props: any) {
    return (
      <CommonProvider>
        <WrappedComponent {...props} />
      </CommonProvider>
    );
  };
};