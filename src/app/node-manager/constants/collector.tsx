import { useTranslation } from '@/utils/i18n';
import { useMemo } from 'react';

const useMenuItem = () => {
  const { t } = useTranslation();
  return useMemo(() => [
    {
      key: 'edit',
      title: 'edit',
      config: {
        title: 'editCollector', type: 'edit'
      }
    },
    {
      key: 'upload',
      title: 'uploadPackge',
      config: {
        title: 'uploadPackge', type: 'upload'
      }
    },
    {
      key: 'delete',
      title: 'delete',
      config: {
        title: 'deleteCollector', type: 'delete'
      }
    }
  ],[t])
};

export {
  useMenuItem
}