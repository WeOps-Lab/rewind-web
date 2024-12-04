import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const EXCLUDED_DIRECTORIES = ['(core)'];

interface NestedMessages {
  [key: string]: string | NestedMessages;
}

const flattenMessages = (nestedMessages: NestedMessages, prefix = ''): { [key: string]: string } => {
  return Object.keys(nestedMessages).reduce((messages: { [key: string]: string }, key: string) => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      messages[prefixedKey] = value;
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey));
    }

    return messages;
  }, {});
};

const deepMerge = (target: any, source: any) => {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
};

let cachedMessages: { [locale: string]: any } | null = null;

const getMergedMessages = async () => {
  if (cachedMessages) {
    return cachedMessages;
  }

  const localesDir = path.resolve(process.cwd(), 'src', 'app');

  // Load base messages
  const baseEnMessages = JSON.parse(await fs.readFile(path.resolve(process.cwd(), 'src', 'locales', 'en.json'), 'utf8'));
  const baseZhMessages = JSON.parse(await fs.readFile(path.resolve(process.cwd(), 'src', 'locales', 'zh.json'), 'utf8'));

  const baseMessages = {
    en: flattenMessages(baseEnMessages),
    zh: flattenMessages(baseZhMessages)
  };

  type Locale = 'en' | 'zh';

  const mergedMessages: { [key in Locale]: any } = {
    en: { ...baseMessages.en },
    zh: { ...baseMessages.zh },
  };

  // Merge messages from app subdirectories
  const apps = await fs.readdir(localesDir, { withFileTypes: true });
  for (const app of apps) {
    if (app.isDirectory() && !EXCLUDED_DIRECTORIES.includes(app.name)) {
      const appLocalesDir = path.join(localesDir, app.name, 'locales');

      for (const locale of ['en', 'zh']) {
        try {
          const filePath = path.join(appLocalesDir, `${locale}.json`);
          await fs.access(filePath);

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

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') === 'en' ? 'en' : 'zh';
    const mergedMessages = await getMergedMessages();
    return NextResponse.json(mergedMessages[locale], { status: 200 });
  } catch (error) {
    console.error('Failed to load locales:', error);
    return NextResponse.json({ message: 'Failed to load locales', error }, { status: 500 });
  }
};

export const POST = async () => {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
};
