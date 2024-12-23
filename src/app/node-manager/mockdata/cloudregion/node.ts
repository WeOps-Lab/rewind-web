import type { MenuProps } from "antd";

const data = [
  {
    key: '1',
    ip: `1.1.1.1`,
    operatingsystem: 'Windows',
    sidecar: 'Running',
  },
  {
    key: '2',
    ip: `1.1.1.2`,
    operatingsystem: 'Linux',
    sidecar: 'Running',
  },
  {
    key: '3',
    ip: `1.1.1.3`,
    operatingsystem: 'Windows',
    sidecar: 'Error',
  },
  {
    key: '4',
    ip: `1.1.1.4`,
    operatingsystem: 'Linux',
    sidecar: 'Error',
  },
  {
    key: '5',
    ip: `1.1.1.5`,
    operatingsystem: 'Windows',
    sidecar: 'Running',
  },
  {
    key: '6',
    ip: `1.1.1.6`,
    operatingsystem: 'Linux',
    sidecar: 'Running',
  },
  {
    key: '7',
    ip: `1.1.1.7`,
    operatingsystem: 'Windows',
    sidecar: 'Error',
  },
  {
    key: '8',
    ip: `1.1.1.8`,
    operatingsystem: 'Linux',
    sidecar: 'Error',
  },
  {
    key: '9',
    ip: `1.1.1.9`,
    operatingsystem: 'Windows',
    sidecar: 'Error',
  },
  {
    key: '10',
    ip: `1.1.1.10`,
    operatingsystem: 'Windows',
    sidecar: 'Error',
  },
];

const updateitems: MenuProps['items'] = [
  {
    key: '1',
    label: '文件1',
  },
  {
    key: '2',
    label: '文件2',
  },
  {
    key: '3',
    label: '文件3',
  },
];
export{data,updateitems};
