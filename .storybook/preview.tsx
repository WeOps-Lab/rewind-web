import type { Preview } from '@storybook/react';
import '@/styles/globals.css';
import Script from 'next/script';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { LocaleProvider } from '@/context/locale';
import { ThemeProvider } from '@/context/theme';
import { PermissionsProvider } from '@/context/permission';

const mockSession = {
  username: 'umr',
  expires: '3023-12-31T23:59:59.999Z',
};


const preview: Preview = {
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession}>
        <Script src="/iconfont.js" strategy="afterInteractive" />
        <LocaleProvider>
          <ThemeProvider>
            <PermissionsProvider>
              <AntdRegistry>
                <Story />
              </AntdRegistry>
            </PermissionsProvider>
          </ThemeProvider>
        </LocaleProvider>
      </SessionProvider>
    ),
  ],
  tags: ['autodocs'],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
