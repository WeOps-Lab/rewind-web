import path from 'path';
import fs from 'fs/promises';
import flattenMessages from '@/utils/flattenMessage';

import baseEnMessages from '@/locales/en.json';
import baseZhMessages from '@/locales/zh.json';

const EXCLUDED_DIRECTORIES = ['api', 'auth'];

let cachedMessages: { [locale: string]: any } | null = null;

const deepMerge = (target: any, source: any) => {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
};

export const getMergedMessages = async () => {
  if (cachedMessages) {
    return cachedMessages;
  }

  const localesDir = path.resolve(process.cwd(), 'src/app');

  const baseMessages = {
    en: flattenMessages(baseEnMessages),
    zh: flattenMessages(baseZhMessages)
  }

  type Locale = 'en' | 'zh';
  
  const mergedMessages: { [key in Locale]: any } = {
    en: { ...baseMessages.en },
    zh: { ...baseMessages.zh },
  };

  const apps = await fs.readdir(localesDir, { withFileTypes: true });
  for (const app of apps) {
    if (app.isDirectory() && !EXCLUDED_DIRECTORIES.includes(app.name)) {
      const appLocalesDir = path.join(localesDir, app.name, 'locales');

      for (const locale of ['en', 'zh']) {
        try {
          await fs.access(appLocalesDir);
          const filePath = path.join(appLocalesDir, `${locale}.json`);

          const messages = flattenMessages(JSON.parse(await fs.readFile(filePath, 'utf8')));
          mergedMessages[locale as Locale] = deepMerge(mergedMessages[locale as Locale], messages);
        } catch (error) {
          console.error(`Error loading locale for ${app.name}:`, error);
        }
      }
    }
  }

  cachedMessages = mergedMessages;
  return mergedMessages;
};