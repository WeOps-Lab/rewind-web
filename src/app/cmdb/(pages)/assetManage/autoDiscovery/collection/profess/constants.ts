export type ExecStatusKey = 'add' | 'update' | 'association' | 'delete';

export interface ExecStatus {
  color: string;
  text: string;
}

type ExecStatusMapType = {
  [K in ExecStatusKey]: ExecStatus;
};

export const createExecStatusMap = (
  t: (key: string) => string
): ExecStatusMapType => ({
  add: {
    color: 'success',
    text: t('Collection.execStatus.add'),
  },
  update: {
    color: 'processing',
    text: t('Collection.execStatus.update'),
  },
  association: {
    color: 'processing',
    text: t('Collection.execStatus.association'),
  },
  delete: {
    color: 'error',
    text: t('Collection.execStatus.delete'),
  },
});

export const CYCLE_OPTIONS = {
  DAILY: 'timing',
  INTERVAL: 'cycle',
  ONCE: 'close',
} as const;

export const FORM_INITIAL_VALUES = {
  cycle: CYCLE_OPTIONS.ONCE,
  intervalMinutes: 60,
  timeout: 60,
  inst: undefined,
};

export const createValidationRules = (t: (key: string) => string) => ({
  name: [
    {
      required: true,
      message: t('Collection.k8sTask.nameRequired'),
    },
  ],
  cycle: [
    {
      required: true,
      message: t('Collection.k8sTask.cycleRequired'),
    },
  ],
  inst: [
    {
      required: true,
      message: t('Collection.k8sTask.instRequired'),
    },
  ],
  intervalMinutes: [
    {
      required: true,
      message: t('Collection.k8sTask.intervalRequired'),
    },
  ],
  timeout: [
    {
      required: true,
      message: t('Collection.k8sTask.timeoutRequired'),
    },
  ],
});
