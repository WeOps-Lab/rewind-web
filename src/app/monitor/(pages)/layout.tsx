'use client';

import CommonProvider from '@/app/monitor/context/common';
import '@/app/monitor/styles/index.css';

export default function RootMonitor({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CommonProvider>{children}</CommonProvider>;
}