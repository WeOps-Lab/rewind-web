import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { createIntl, createIntlCache } from 'react-intl';
import { getMergedMessages } from '@/utils/mergedMessage';

const EXCLUDED_DIRECTORIES = ['api', 'auth'];

interface MergedMessages {
  [key: string]: any;
  en?: any;
  zh?: any;
}

const getIntl = async (locale: string) => {
  const mergedMessages: MergedMessages = await getMergedMessages();
  const messages = mergedMessages[locale];
  const cache = createIntlCache();
  const intl = createIntl({
    locale,
    messages
  }, cache);
  return intl;
};

const getMenuItems = async (locale: string) => {
  const intl = await getIntl(locale);
  const formatMessage = intl.formatMessage;

  const dirPath = path.join(process.cwd(), 'src', 'app');
  const directories = await fs.readdir(dirPath, { withFileTypes: true });

  let allMenuItems: any[] = [];

  for (const dirent of directories) {
    if (dirent.isDirectory() && !EXCLUDED_DIRECTORIES.includes(dirent.name)) {
      const menuPath = path.join(dirPath, dirent.name, 'constants', 'menu.ts');

      try {
        await fs.access(menuPath);
        const { default: getMenuItems } = await import(`@/app/${dirent.name}/constants/menu`);
        const menuItems = getMenuItems(formatMessage);
        allMenuItems = allMenuItems.concat(menuItems);
      } catch (err) {
        console.error(`Failed to load menu for ${dirent.name}:`, err);
      }
    }
  }

  return allMenuItems;
};

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') === 'en' ? 'en' : 'zh';
    const menuItems = await getMenuItems(locale);
    console.log('Final menu items:', menuItems);
    return NextResponse.json(menuItems, { status: 200 });
  } catch (error) {
    console.error('Failed to load menus:', error);
    return NextResponse.json({ message: 'Failed to load menus', error }, { status: 500 });
  }
};

export const POST = async () => {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
};