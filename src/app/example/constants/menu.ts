const getMenuItems = (formatMessage: any) => {
  return [
    {
      label: formatMessage({ id: 'app.menu.home' }),
      icon: 'jiqiren2',
      path: '/example',
    },
  ];
};

export default getMenuItems;
