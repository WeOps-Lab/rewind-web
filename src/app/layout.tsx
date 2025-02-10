'use client';

import { useEffect, useState, useCallback } from 'react';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { useRouter, usePathname } from 'next/navigation';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { SessionProvider } from 'next-auth/react';
import { LocaleProvider } from '@/context/locale';
import { ThemeProvider } from '@/context/theme';
import { MenusProvider, useMenus } from '@/context/menus';
import { UserInfoProvider } from '@/context/userInfo';
import { ClientProvider } from '@/context/client';
import { PermissionsProvider, usePermissions } from '@/context/permissions';
import AuthProvider from '@/context/auth';
import TopMenu from '@/components/top-menu';
import { ConfigProvider } from 'antd';
import Spin from '@/components/spin';
import '@/styles/globals.css';
import { MenuItem } from '@/types/index'

const inter = Inter({ subsets: ['latin'] });

const Loader = () => (
  <div className="flex justify-center items-center h-screen">
    <Spin />
  </div>
);

const LayoutWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { loading: permissionsLoading, hasPermission } = usePermissions();
  const { loading: menusLoading, configMenus } = useMenus();
  const router = useRouter();
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);

  const isLoading = permissionsLoading || menusLoading;
  const excludedPaths = ['/no-permission', '/no-found', '/', '/auth/signin', '/auth/signout'];

  const isPathInMenu = useCallback((path: string, menus: MenuItem[]): boolean => {
    for (const menu of menus) {
      if (menu.url?.startsWith(path) || path.startsWith(menu.url)) {
        return true;
      }
      if (menu.children && isPathInMenu(path, menu.children)) {
        return true;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    const checkPermission = async () => {
      if (!isLoading) {
        if (excludedPaths.includes(pathname)) {
          setIsAllowed(true);
          return;
        }

        if (isPathInMenu(pathname, configMenus)) {
          if (hasPermission(pathname)) {
            setIsAllowed(true);
          } else {
            setIsAllowed(false);
            router.replace('/no-permission');
          }
        } else {
          setIsAllowed(false);
          router.replace('/no-found');
        }
      }
    };

    checkPermission();
  }, [isLoading, pathname]);

  // 显示加载动画，或在没有权限时避免加载页面
  if (isLoading || (!isAllowed && !excludedPaths.includes(pathname))) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 left-0 right-0 flex justify-between items-center header-bg">
        <TopMenu />
      </header>
      <main className="flex-1 p-4 flex">
        <AntdRegistry>{children}</AntdRegistry>
      </main>
    </div>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-site.png" type="image/png"/>
        <Script src="/iconfont.js" strategy="afterInteractive"/>
      </head>
      <body className={inter.className}>
        {/* 全局 Context Provider 配置 */}
        <SessionProvider refetchInterval={30 * 60}>
          <ConfigProvider>
            <LocaleProvider>
              <ThemeProvider>
                <AuthProvider>
                  <UserInfoProvider>
                    <ClientProvider>
                      <MenusProvider>
                        <PermissionsProvider>
                          {/* 渲染布局 */}
                          <LayoutWithProviders>{children}</LayoutWithProviders>
                        </PermissionsProvider>
                      </MenusProvider>
                    </ClientProvider>
                  </UserInfoProvider>
                </AuthProvider>
              </ThemeProvider>
            </LocaleProvider>
          </ConfigProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
