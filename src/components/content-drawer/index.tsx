import React from 'react';
import { Drawer } from 'antd';
import { useTranslation } from '@/utils/i18n';

interface ContentDrawerProps {
  visible: boolean;
  onClose: () => void;
  content: string;
}

const ContentDrawer: React.FC<ContentDrawerProps> = ({ visible, onClose, content }) => {
  const { t } = useTranslation();

  return (
    <Drawer
      title={t('common.viewDetails')}
      placement="right"
      onClose={onClose}
      visible={visible}
      width={600}
    >
      <p>{content}</p>
    </Drawer>
  );
};

export default ContentDrawer;