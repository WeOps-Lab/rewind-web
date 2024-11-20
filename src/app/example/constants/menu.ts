const getMenuItems = (formatMessage: any) => {
  return [
    { label: formatMessage({ id: 'studio.menu' }), icon: 'jiqiren2', path: '/example' },
  ];
};

export default getMenuItems;