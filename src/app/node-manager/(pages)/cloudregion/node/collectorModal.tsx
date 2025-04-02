'use client';
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Form, Select, message, Button, Popconfirm } from 'antd';
import OperateModal from '@/components/operate-modal';
import type { FormInstance } from 'antd';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/utils/i18n';
import { ModalSuccess, ModalRef } from '@/app/node-manager/types/index';
import useApiCloudRegion from '@/app/node-manager/api/cloudregion';
import type { OptionItem } from '@/app/node-manager/types/index';
// import type {
//   CollectorItem,
//   IConfiglistprops,
// } from '@/app/node-manager/types/cloudregion';
import useCloudId from '@/app/node-manager/hooks/useCloudid';

const CollectorModal = forwardRef<ModalRef, ModalSuccess>(
  ({ onSuccess }, ref) => {
    const collectorformRef = useRef<FormInstance>(null);
    const router = useRouter();
    const { t } = useTranslation();
    const cloudid = useCloudId();
    const {
      getnodelist,
      //   batchbindcollector,
      batchoperationcollector,
      getconfiglist,
    } = useApiCloudRegion();
    const [type, setType] = useState<string>('installCollector');
    const [nodeids, setNodeids] = useState<string[]>(['']);
    const [collectorVisible, setCollectorVisible] = useState<boolean>(false);
    //需要二次弹窗确定的类型
    const Popconfirmarr = ['restartCollector', 'uninstallCollector'];
    const [configlist, setConfiglist] = useState<OptionItem[]>([]);
    const [collectorlist, setCollectorlist] = useState<OptionItem[]>([]);
    const [selectedsystem, setSelectedsystem] = useState<string>();
    const [versionLoading, setVersionLoading] = useState<boolean>(false);
    const [collectorLoading, setCollectorLoading] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
      showModal: ({ type, ids, selectedsystem }) => {
        setCollectorVisible(true);
        setType(type);
        setSelectedsystem(selectedsystem);
        if (ids) {
          setNodeids(ids);
        }
        initPage(type);
      },
    }));

    useEffect(() => {
      collectorformRef.current?.resetFields();
    }, [collectorformRef]);

    const initPage = (type: string) => {
      console.log(selectedsystem);
      Promise.all([
        type === 'installCollector' &&
          getnodelist({ cloud_region_id: Number(cloudid) }),
        getconfiglist(Number(cloudid)),
      ])
        .then((res) => {
          setConfiglist(res[0] || []);
          setCollectorlist(res[1] || []);
        })
        .finally(() => {
          setCollectorLoading(false);
          setVersionLoading(false);
        });
    };

    //关闭用户的弹窗(取消和确定事件)
    const handleCancel = () => {
      setCollectorVisible(false);
      setCollectorVisible(false);
      setVersionLoading(false);
    };

    //点击确定按钮的相关逻辑处理
    const handleConfirm = () => {
      if (Popconfirmarr.includes(type)) {
        return;
      }
      //表单验证
      collectorformRef.current?.validateFields().then((values) => {
        //处理更新和绑定配置
        const collector_id = collectorlist?.find(
          (item) => item.value === values?.Collector
        )?.value;
        const node_ids = nodeids;
        if (typeof collector_id === 'string') {
          batchoperationcollector({
            node_ids,
            collector_id,
            operation: 'start',
          }).then(() => {
            onSuccess();
          });
          setCollectorVisible(false);
        }
      });
    };

    //二次确认的弹窗
    const secondconfirm = () => {
      collectorformRef.current?.validateFields().then((values) => {
        const collector_id = collectorlist?.find(
          (item) => item.value === values?.Collector
        )?.value;
        const node_ids = nodeids;
        if (typeof collector_id === 'string') {
          batchoperationcollector({
            node_ids,
            collector_id,
            operation: type,
          }).then(() => {
            message.success(t('node-manager.cloudregion.node.stopsuccess'));
            onSuccess();
          });
        }
        setCollectorVisible(false);
        navigateToConfig();
      });
    };

    const navigateToConfig = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const name = searchParams.get('name');
      const cloud_region_id = searchParams.get('cloud_region_id');
      router.push(
        `/node-manager/cloudregion/configuration?could_region_id=${cloud_region_id}&name=${name}`
      );
    };
    return (
      <OperateModal
        title={t(`node-manager.cloudregion.node.${type}`)}
        open={collectorVisible}
        destroyOnClose
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onCancel={handleCancel}
        footer={
          <>
            <Button key="back" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            {Popconfirmarr.includes(type) ? (
              <Popconfirm
                title={t(`node-manager.cloudregion.node.${type}`)}
                description={t(`node-manager.cloudregion.node.${type}Info`)}
                okText={t('common.confirm')}
                cancelText={t('common.cancel')}
                onConfirm={secondconfirm}
              >
                <Button type="primary">{t('common.confirm')}</Button>
              </Popconfirm>
            ) : (
              <Button type="primary" onClick={handleConfirm}>
                {t('common.confirm')}
              </Button>
            )}
          </>
        }
      >
        <Form ref={collectorformRef} layout="vertical" colon={false}>
          <Form.Item
            name="Collector"
            label={t('node-manager.cloudregion.node.collector')}
            rules={[
              {
                required: true,
                message: t('common.required'),
              },
            ]}
          >
            <Select loading={collectorLoading} options={collectorlist}></Select>
          </Form.Item>
          {type === 'installCollector' && (
            <Form.Item
              name="version"
              label={t('node-manager.cloudregion.node.version')}
              rules={[
                {
                  required: true,
                  message: t('common.required'),
                },
              ]}
            >
              <Select loading={versionLoading} options={configlist}></Select>
            </Form.Item>
          )}
        </Form>
      </OperateModal>
    );
  }
);
CollectorModal.displayName = 'CollectorModal';
export default CollectorModal;
