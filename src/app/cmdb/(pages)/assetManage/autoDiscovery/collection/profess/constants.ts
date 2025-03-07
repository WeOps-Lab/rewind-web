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

export const EXEC_STATUS = {
  UNEXECUTED: 0,
  COLLECTING: 1,
  SUCCESS: 2,
  ERROR: 3,
  TIMEOUT: 4,
  WRITING: 5,
  FORCE_STOP: 6,
  PENDING_APPROVAL: 7,
} as const;

export type ExecStatusType = (typeof EXEC_STATUS)[keyof typeof EXEC_STATUS];

export const getExecStatusConfig = (t: (key: string) => string) => ({
  [EXEC_STATUS.UNEXECUTED]: {
    text: t('Collection.execStatus.unexecuted'),
    color: 'var(--color-text-3)',
  },
  [EXEC_STATUS.COLLECTING]: {
    text: t('Collection.execStatus.collecting'),
    color: 'var(--color-primary)',
  },
  [EXEC_STATUS.SUCCESS]: {
    text: t('Collection.execStatus.success'),
    color: '#4ACF88',
  },
  [EXEC_STATUS.ERROR]: {
    text: t('Collection.execStatus.error'),
    color: '#FF6A57',
  },
  [EXEC_STATUS.TIMEOUT]: {
    text: t('Collection.execStatus.timeout'),
    color: '#FF6A57',
  },
  [EXEC_STATUS.WRITING]: {
    text: t('Collection.execStatus.writing'),
    color: 'var(--color-primary)',
  },
  [EXEC_STATUS.FORCE_STOP]: {
    text: t('Collection.execStatus.forceStop'),
    color: '#FF6A57',
  },
  [EXEC_STATUS.PENDING_APPROVAL]: {
    text: t('Collection.execStatus.pendingApproval'),
    color: '#F7BA1E',
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

export type AlertType = 'info' | 'warning' | 'error';

export interface TabConfig {
  count: number;
  label: string;
  message: string;
  alertType: AlertType;
  columns: {
    title: string;
    dataIndex: string;
    width: number;
  }[];
}

export const TASK_DETAIL_CONFIG: Record<string, TabConfig> = {
  add: {
    count: 0,
    label: '新增资产',
    message:
      '注：针对资产新增进行审批，审批通过后，资产的相关信息会同步更新至资产记录。',
    alertType: 'warning',
    columns: [
      { title: '对象类型', dataIndex: 'model_id', width: 160 },
      { title: '实例名', dataIndex: 'inst_name', width: 260 },
      //   { title: '状态', dataIndex: '_status', width: 120 },
    ],
  },
  update: {
    count: 4,
    label: '更新资产',
    message: '注：展示任务执行后资产更新情况，自动更新至在资产记录。',
    alertType: 'warning',
    columns: [
      { title: '对象类型', dataIndex: 'model_id', width: 160 },
      { title: '实例名', dataIndex: 'inst_name', width: 260 },
      // { title: '更新状态', dataIndex: '_status', width: 120 },
    ],
  },
  //   relation: {
  //     count: 0,
  //     label: '新增关联',
  //     message: '注：展示任务执行后，新创建的资产关联情况，自动更新至在资产记录。',
  //     alertType: 'warning',
  //     columns: [
  //         { title: '源对象类型', dataIndex: 'type', width: 180 },
  //         { title: '源实例', dataIndex: 'inst_name', width: 260 },
  //         { title: '关联状态', dataIndex: '_status', width: 120 },
  //     ],
  //   },
  delete: {
    count: 3,
    label: '下架资产',
    message:
      '注：展示任务执行后，采集到已下架的资产，需要手动操作“下架”，方可在资产记录更新。',
    alertType: 'warning',
    columns: [
      { title: '对象类型', dataIndex: 'model_id', width: 160 },
      { title: '实例名', dataIndex: 'inst_name', width: 260 },
      //   { title: '下架状态', dataIndex: '_status', width: 120 },
    ],
  },
};

export const MOCK_TABLE_DATA = [
  {
    key: '1',
    type: '自定义ipmi采集模型',
    instance: 'ex_useripmi-10.10.25.62',
    status: '已更新',
  },
];
