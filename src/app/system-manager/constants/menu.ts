const getMenuItems = (formatMessage: any) => {
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
