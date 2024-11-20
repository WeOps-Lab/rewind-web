const getMenuItems = (formatMessage: any) => {
  return [
    { label: formatMessage({ id: 'studio.menu' }), icon: 'jiqiren2', path: '/studio' },
    { label: formatMessage({ id: 'knowledge.menu' }), icon: 'zhishiku1', path: '/knowledge' },
  ];
};

export default getMenuItems;