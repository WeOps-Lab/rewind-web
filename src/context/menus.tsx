import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
}

const MenusContext = createContext<MenuItem[]>([]);

export const MenusProvider = ({ children }: { children: ReactNode }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

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
    <MenusContext.Provider value={menuItems}>
      {children}
    </MenusContext.Provider>
  );
};

// 创建一个能使用Context数据的钩子函数
export const useMenus = () => {
  return useContext(MenusContext);
};
