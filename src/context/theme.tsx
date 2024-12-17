'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import { ThemeConfig } from 'antd/es/config-provider/context';
import { lightTheme, darkTheme } from '@/constants/theme';
import { useTranslation } from '@/utils/i18n';
import { locales, LocaleKey } from '@/constants/locales';
import { dayjsLocales } from '@/constants/dayjsLocales';

const ThemeContext = createContext<{
  theme: ThemeConfig;
  setTheme: (isDark: boolean) => void;
    } | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(lightTheme);
  const [locale, setLocale] = useState(locales.en);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setTheme(darkTheme);
      document.documentElement.classList.add('dark');
    } else {
      setTheme(lightTheme);
      document.documentElement.classList.remove('dark');
    }

    const savedLocale = localStorage.getItem('locale') as LocaleKey;
    if (savedLocale && locales[savedLocale]) {
      setLocale(locales[savedLocale]);
      dayjs.locale(dayjsLocales[savedLocale]);
    } else {
      setLocale(locales.en);
      dayjs.locale(dayjsLocales['en']);
    }
  }, []);

  const changeTheme = (isDark: boolean) => {
    const newTheme = isDark ? darkTheme : lightTheme;
    setTheme(newTheme);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme }}>
      <ConfigProvider theme={theme} locale={locale}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const { t } = useTranslation();
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(t('common.useThemeError'));
  }
  return context;
};
