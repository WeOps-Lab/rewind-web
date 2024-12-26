'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMenus } from '@/context/menus';

export default function Home() {
  const router = useRouter();
  const menuItems = useMenus();

  useEffect(() => {
    if (menuItems.length > 0) {
      router.replace(menuItems[0].path);
    }
  }, [menuItems, router]);

  return null;
}
