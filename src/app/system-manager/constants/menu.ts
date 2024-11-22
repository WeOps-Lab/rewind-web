const getMenuItems = (formatMessage: any) => {
  return [
    {
      label: formatMessage({ id: 'User' }),
      icon: 'jiqiren2',
      path: '/system-manager/userspage',
    },
    {
      label: formatMessage({ id: 'Team' }),
      icon: 'jiqiren2',
      path: '/system-manager/teamspage',
    },
  ];
};

export default getMenuItems;
