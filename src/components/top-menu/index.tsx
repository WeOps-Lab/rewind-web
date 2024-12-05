import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import UserInfo from '../user-info';
import Icon from '@/components/icon';
import menuStyle from './index.module.scss';

const TopMenu = () => {
  const [menuItems, setMenuItems] = useState<Array<{ label: string; icon: string; path: string }>>([]);
  const pathname = usePathname();

  useEffect(() => {
    const fetchMenus = async () => {
      const locale = localStorage.getItem('locale') || 'en';
      try {
        const response = await fetch(`/api/menu?locale=${locale}`);
        if (!response.ok) {
          throw new Error('Failed to fetch menus');
        }
        const menus = await response.json();
        setMenuItems(menus);
      } catch (error) {
        console.error('Failed to fetch menus:', error);
        try {
          const menuResponse = await fetch(`/menus/${locale}.json`);
          const menus = await menuResponse.json();
          setMenuItems(menus);
        } catch {
          console.error('Failed to load menus from local:', error);
        }
      }
    };

    fetchMenus();
  }, []);

  return (
    <div className="z-30 flex flex-col grow-0 shrink-0 w-full basis-auto min-h-[56px]">
      <div className="flex flex-1 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Image src="/logo-site.png" className="block w-auto h-10" alt="logo" width={100} height={40} />
          <div>WeOps</div>
        </div>
        <div className="flex items-center space-x-4">
          {menuItems.map((item) => {
            const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
            return (
              <Link key={item.path} href={item.path} prefetch={false} legacyBehavior>
                <a className={`px-3 py-2 rounded-[10px] flex items-center ${menuStyle.menuCol} ${isActive ? menuStyle.active : ''}`}>
                  <Icon type={item.icon} className="mr-2 w-4 h-4" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </div>
        <div className="flex items-center flex-shrink-0 space-x-4">
          <UserInfo />
        </div>
      </div>
    </div>
  );
};

export default TopMenu;
