import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Popover } from 'antd';
import { CaretDownFilled } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import { useMenus } from '@/context/menus';
import UserInfo from '../user-info';
import Icon from '@/components/icon';
import styles from './index.module.scss';

const TopMenu = () => {
  const { t } = useTranslation();
  const menuItems = useMenus();
  const pathname = usePathname();
  const apps: Array<{ name: string; icon: string }> = [
    { name: 'Monitor', icon: 'jiankong1' },
    { name: 'Logs', icon: 'rizhiguanli' },
    { name: 'Resource', icon: 'zichanguanli' },
    { name: 'System', icon: 'yingyongxitongguanli' },
  ];

  const renderContent = (
    <div className='grid grid-cols-3 gap-4 max-h-[350px] overflow-auto'>
      {apps.map((app) => (
        <div key={app.name} className={`group flex flex-col items-center p-4 rounded-sm cursor-pointer ${styles.navApp}`}>
          <Icon type={app.icon} className="mr-2 text-2xl mb-1 transition-transform duration-300 transform group-hover:scale-125" />
          {app.name}
        </div>
      ))}
    </div>
  );

  return (
    <div className="z-30 flex flex-col grow-0 shrink-0 w-full basis-auto h-[56px] relative">
      <div className="flex items-center justify-between px-4 w-full h-full">
        <div className="flex items-center space-x-2">
          <Image src="/logo-site.png" className="block w-auto h-10" alt="logo" width={100} height={40} />
          <div>WeOps</div>
          <Popover content={renderContent} title={t('common.appList')} trigger="hover">
            <div className={`flex items-center justify-center cursor-pointer rounded-[10px] px-3 py-2 ${styles.nav}`}>
              <Icon type='caidandaohang' className='mr-1' />
              <CaretDownFilled className={`text-sm ${styles.icons}`} />
            </div>
          </Popover>
        </div>
        <div className="flex items-center flex-shrink-0 space-x-4">
          <UserInfo />
        </div>
      </div>
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center space-x-4">
          {menuItems.map((item) => {
            const isActive = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path);
            return (
              <Link key={item.path} href={item.path} prefetch={false} legacyBehavior>
                <a className={`px-3 py-2 rounded-[10px] flex items-center ${styles.menuCol} ${isActive ? styles.active : ''}`}>
                  <Icon type={item.icon} className="mr-2 w-4 h-4" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopMenu;
