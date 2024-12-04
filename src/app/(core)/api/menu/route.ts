import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const EXCLUDED_DIRECTORIES = ['(core)'];

const getMenuItems = async (locale: string) => {
  const dirPath = path.join(process.cwd(), 'src', 'app');
  const directories = await fs.readdir(dirPath, { withFileTypes: true });

  const allMenuItems: any[] = [];

  for (const dirent of directories) {
    if (dirent.isDirectory() && !EXCLUDED_DIRECTORIES.includes(dirent.name)) {
      const menuPath = path.join(dirPath, dirent.name, 'constants', 'menu.json');

      try {
        await fs.access(menuPath);
        const menuContent = await fs.readFile(menuPath, 'utf-8');
        const menu = JSON.parse(menuContent);
        allMenuItems.push(menu[locale]);
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
