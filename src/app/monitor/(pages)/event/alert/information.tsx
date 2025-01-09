'use client';
import React, { useRef } from 'react';
import { Descriptions } from 'antd';
import { TableDataItem, Organization, UserItem } from '@/app/monitor/types';
import { useTranslation } from '@/utils/i18n';
import informationStyle from './index.module.scss';
import { useLocalizedTime } from '@/hooks/useLocalizedTime';
import LineChart from '@/app/monitor/components/charts/lineChart';
import { ObectItem } from '@/app/monitor/types/monitor';
import { findUnitNameById, showGroupName } from '@/app/monitor/utils/common';
import { useCommon } from '@/app/monitor/context/common';
import { Modal, message, Button } from 'antd';
import useApiClient from '@/utils/request';
import { LEVEL_MAP, useLevelList } from '@/app/monitor/constants/monitor';

const Information: React.FC<TableDataItem> = ({
  formData,
  chartData,
  objects,
  userList,
  onClose,
}) => {
  const { t } = useTranslation();
  const { convertToLocalizedTime } = useLocalizedTime();
  const LEVEL_LIST = useLevelList();
  const { confirm } = Modal;
  const { patch } = useApiClient();
  const commonContext = useCommon();
  const authList = useRef(commonContext?.authOrganizations || []);
  const organizationList: Organization[] = authList.current;

  const checkDetail = (row: TableDataItem) => {
    const params = {
      monitorObjId: row.monitor_instance?.monitor_object,
      name:
        objects.find(
          (item: ObectItem) => item.id === row.monitor_instance?.monitor_object
        )?.name || '',
      instance_id: row.monitor_instance?.id,
      instance_name: row.monitor_instance?.name,
    };
    const queryString = new URLSearchParams(params).toString();
    const url = `/monitor/view/detail/overview?${queryString}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const showAlertCloseConfirm = (row: TableDataItem) => {
    confirm({
      title: t('monitor.events.closeTitle'),
      content: t('monitor.events.closeContent'),
      centered: true,
      onOk() {
        return new Promise(async (resolve) => {
          try {
            await patch(`/monitor/api/monitor_alert/${row.id}/`, {
              status: 'closed',
            });
            message.success(t('monitor.events.successfullyClosed'));
            onClose();
          } finally {
            resolve(true);
          }
        });
      },
    });
  };

  const getUsers = (id: string) => {
    return userList.find((item: UserItem) => item.id === id)?.username || '--';
  };

  const showNotifiers = (row: TableDataItem) => {
    return (
      (row.policy?.notice_users || [])
        .map((item: string) => getUsers(item))
        .join(',') || '--'
    );
  };

  return (
    <div className={informationStyle.information}>
      <Descriptions title={t('monitor.events.information')} column={2} bordered>
        <Descriptions.Item label={t('common.time')}>
          {formData.updated_at
            ? convertToLocalizedTime(formData.updated_at)
            : '--'}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.events.level')}>
          <div
            className={informationStyle.level}
            style={{
              borderLeft: `4px solid ${LEVEL_MAP[formData.level]}`,
            }}
          >
            <span
              style={{
                color: LEVEL_MAP[formData.level] as string,
              }}
            >
              {LEVEL_LIST.find((item) => item.value === formData.level)
                ?.label || '--'}
            </span>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.events.firstAlertTime')}>
          {formData.start_event_time
            ? convertToLocalizedTime(formData.start_event_time)
            : '--'}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.events.information')} span={3}>
          {`${formData.content},${t('monitor.value')}:${formData.alertValue}`}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.events.assetType')}>
          {objects.find(
            (item: ObectItem) =>
              item.id === formData.monitor_instance?.monitor_object
          )?.display_name || '--'}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.asset')}>
          <div className="flex justify-between">
            {formData.monitor_instance?.name || '--'}{' '}
            <a
              href="#"
              className="text-blue-500 w-[36px]"
              onClick={() => checkDetail(formData)}
            >
              {t('common.more')}
            </a>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.events.assetGroup')}>
          {showGroupName(
            formData.policy?.organizations || [],
            organizationList
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.events.strategyName')}>
          {formData.policy?.name || '--'}
        </Descriptions.Item>
        {formData.status === 'closed' && (
          <Descriptions.Item label={t('monitor.events.alertEndTime')}>
            {formData.end_event_time
              ? convertToLocalizedTime(formData.end_event_time)
              : '--'}
          </Descriptions.Item>
        )}
        <Descriptions.Item label={t('monitor.events.notify')}>
          {t(
            `monitor.events.${
              formData.policy?.notice ? 'notified' : 'unnotified'
            }`
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('common.operator')}>
          {formData.operator || '--'}
        </Descriptions.Item>
        <Descriptions.Item label={t('monitor.events.notifier')}>
          {showNotifiers(formData)}
        </Descriptions.Item>
      </Descriptions>
      <div className="mt-4">
        <Button
          type="link"
          disabled={formData.status !== 'new'}
          onClick={() => showAlertCloseConfirm(formData)}
        >
          {t('monitor.events.closeAlert')}
        </Button>
      </div>
      <div className="mt-4">
        <h3 className="font-[600] text-[16px] mb-[15px]">
          {t('monitor.views.indexView')}
        </h3>
        <div className="text-[12px]">{`${
          formData.metric?.display_name
        }（${findUnitNameById(formData.metric?.unit)}）`}</div>
        <div className="h-[250px]">
          <LineChart
            allowSelect={false}
            data={chartData}
            unit={formData.metric?.unit}
            metric={formData.metric}
          />
        </div>
        <div className='hidden'>
          <h3  className="font-[600] text-[16px] mb-[15px]">报文</h3>
          <div className='bg-[var(--color-fill-2)] p-[10px] text-[12px] leading-[24px]'>
            【功能项】SNMP Trap的告警展示 1、列表：
            级别+时间+策略名称：和之前的取值一样 资产：取trap中的“IP Address”
            资产类型：根据trap中的type确定 指标和值：根据trap报文的OID映射展示
            2、详情： 最下面的视图改为“报文”，展示报文的原始值
          </div>
        </div>
      </div>
    </div>
  );
};

export default Information;