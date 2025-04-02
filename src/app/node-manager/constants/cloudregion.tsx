import { useTranslation } from '@/utils/i18n';
import { useMemo } from 'react';
import { SegmentedItem } from '@/app/node-manager/types';
import type { MenuProps } from 'antd';

const useTelegrafMap = (): Record<string, Record<string, string>> => {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      notInstall: {
        color: '#b2b5bd',
        text: t('node-manager.cloudregion.node.notInstalled'),
      },
      running: {
        color: '#2dcb56',
        text: t('node-manager.cloudregion.node.running'),
      },
      failed: {
        color: '#ea3636',
        text: t('node-manager.cloudregion.node.error'),
      },
    }),
    [t]
  );
};

const useInstallMap = (): Record<string, Record<string, string>> => {
  const { t } = useTranslation();
  return useMemo(
    () => ({
      installing: {
        color: 'var(--color-primary)',
        text: t('node-manager.cloudregion.node.installing'),
      },
      success: {
        color: '#2dcb56',
        text: t('node-manager.cloudregion.node.successInstall'),
      },
      failed: {
        color: '#ea3636',
        text: t('node-manager.cloudregion.node.failInstall'),
      },
    }),
    [t]
  );
};

const useInstallWays = (): SegmentedItem[] => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      {
        label: t('node-manager.cloudregion.node.remoteInstall'),
        value: 'remoteInstall',
      },
      {
        label: t('node-manager.cloudregion.node.manualInstall'),
        value: 'manualInstall',
      },
    ],
    [t]
  );
};

const useCollectoritems = (): MenuProps['items'] => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      {
        label: t('node-manager.cloudregion.node.installCollector'),
        key: 'installCollector',
      },
      {
        label: t('node-manager.cloudregion.node.startCollector'),
        key: 'startCollector',
      },
      {
        label: t('node-manager.cloudregion.node.restartCollector'),
        key: 'restartCollector',
      },
      {
        label: t('node-manager.cloudregion.node.uninstallCollector'),
        key: 'uninstallCollector',
      },
    ],
    [t]
  );
};

const useSidecaritems = (): MenuProps['items'] => {
  const { t } = useTranslation();
  return useMemo(
    () => [
      {
        label: (
          <div style={{ whiteSpace: 'nowrap' }}>
            {t('node-manager.cloudregion.node.restartSidecar')}
          </div>
        ),
        key: 'restartSidecar',
      },
      {
        label: (
          <div style={{ whiteSpace: 'nowrap' }}>
            {t('node-manager.cloudregion.node.uninstallSidecar')}
          </div>
        ),
        key: 'uninstallSidecar',
      },
    ],
    [t]
  );
};

const OPERATE_SYSTEMS: SegmentedItem[] = [
  {
    label: 'Windows',
    value: 'Windows',
  },
  {
    label: 'Linux',
    value: 'Linux',
  },
];

const BATCH_FIELD_MAPS: Record<string, string> = {
  system: 'operateSystem',
  group: 'organaziton',
  account: 'loginAccount',
  port: 'loginPort',
  password: 'loginPassword',
};

export {
  useTelegrafMap,
  useInstallWays,
  useInstallMap,
  useSidecaritems,
  useCollectoritems,
  OPERATE_SYSTEMS,
  BATCH_FIELD_MAPS,
};
