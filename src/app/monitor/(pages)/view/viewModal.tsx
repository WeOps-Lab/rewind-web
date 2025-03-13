'use client';

import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Button, Tabs } from 'antd';
import OperateDrawer from '@/app/monitor/components/operate-drawer';
import { ModalRef, TabItem } from '@/app/monitor/types';
import { ChartProps, ViewModalProps } from '@/app/monitor/types/monitor';
import { useTranslation } from '@/utils/i18n';
import MonitorView from './monitorView';
import MonitorAlarm from './monitorAlarm';
import { INIT_VIEW_MODAL_FORM } from '@/app/monitor/constants/monitor';

const ViewModal = forwardRef<ModalRef, ViewModalProps>(
  ({ monitorObject, monitorName, plugins, metrics, objects = [] }, ref) => {
    const { t } = useTranslation();
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [viewConfig, setViewConfig] =
      useState<ChartProps>(INIT_VIEW_MODAL_FORM);
    const tabs: TabItem[] = [
      {
        label: t('monitor.views.monitorView'),
        key: 'monitorView',
      },
      //   {
      //     label: t('monitor.views.alertList'),
      //     key: 'alertList',
      //   },
    ];
    const [currentTab, setCurrentTab] = useState<string>('monitorView');

    useImperativeHandle(ref, () => ({
      showModal: ({ title, form }) => {
        // 开启弹窗的交互
        setGroupVisible(true);
        setTitle(title);
        setViewConfig(form);
      },
    }));

    const changeTab = (val: string) => {
      setCurrentTab(val);
    };

    const handleCancel = () => {
      setGroupVisible(false);
      setCurrentTab('monitorView');
      setViewConfig(INIT_VIEW_MODAL_FORM);
    };

    return (
      <div>
        <OperateDrawer
          width={950}
          title={title}
          subTitle={viewConfig.instance_name}
          visible={groupVisible}
          onClose={handleCancel}
          footer={
            <div>
              <Button onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          }
        >
          <Tabs activeKey={currentTab} items={tabs} onChange={changeTab} />
          {currentTab === 'monitorView' ? (
            <MonitorView
              monitorObject={monitorObject}
              monitorName={monitorName}
              plugins={plugins}
              form={viewConfig}
            />
          ) : (
            <MonitorAlarm
              monitorObject={monitorObject}
              monitorName={monitorName}
              plugins={plugins}
              form={viewConfig}
              metrics={metrics}
              objects={objects}
            />
          )}
        </OperateDrawer>
      </div>
    );
  }
);
ViewModal.displayName = 'ViewModal';
export default ViewModal;
