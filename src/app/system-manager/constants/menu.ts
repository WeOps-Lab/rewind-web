// import { useTranslation } from '@/utils/i18n';
const getMenuItems = (formatMessage: any) => {
  // const { t } = useTranslation();
  return [
    {
      label: formatMessage({ id: 'User' }),
      icon: 'icon-yonghu',
      path: '/system-manager/userspage',
    },
    {
      label: formatMessage({ id: 'Team' }),
      icon: 'icon-tuandui',
      path: '/system-manager/teamspage',
    },
  ];
};

export default getMenuItems;
