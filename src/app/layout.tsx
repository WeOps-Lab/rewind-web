'use client';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import '@/styles/globals.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { SessionProvider } from 'next-auth/react';
import { LocaleProvider } from '@/context/locale';
import { ThemeProvider } from '@/context/theme';
import { MenusProvider } from '@/context/menus';
import AuthProvider from '@/context/auth';
import TopMenu from '@/components/top-menu';
import { PermissionsProvider } from '@/context/permission';
import { ConfigProvider } from "antd";

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script src="/iconfont.js" strategy="afterInteractive" />
      </head>
      <body className={inter.className}>
        <SessionProvider refetchInterval={30 * 60}>
          <ConfigProvider>
            <LocaleProvider>
              <ThemeProvider>
                <AuthProvider>
                  <PermissionsProvider>
                    <MenusProvider>
                      <div className="flex flex-col min-h-screen">
                        <header className="sticky top-0 left-0 right-0 flex justify-between items-center header-bg">
                          <TopMenu />
                        </header>
                        <main className="flex-1 p-4 h-full flex">
                          <AntdRegistry>{children}</AntdRegistry>
                        </main>
                      </div>
                    </MenusProvider>
                  </PermissionsProvider>
                </AuthProvider>
              </ThemeProvider>
            </LocaleProvider>
          </ConfigProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
