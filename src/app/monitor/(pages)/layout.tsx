'use client';

import CommonProvider from '@/app/monitor/context/common';

export default function RootMonitor({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CommonProvider>{children}</CommonProvider>;
}