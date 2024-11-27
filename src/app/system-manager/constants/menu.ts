// import { useTranslation } from '@/utils/i18n';
const getMenuItems = (formatMessage: any) => {
  // const { t } = useTranslation();
  return [
    {
      label: formatMessage({ id: 'app.menu.user' }),
      icon: 'yonghu',
      path: '/system-manager/userspage',
    },
    {
      label: formatMessage({ id: 'app.menu.teams' }),
      icon: 'tuandui',
      path: '/system-manager/teamspage',
    },
  ];
};

export default getMenuItems;
