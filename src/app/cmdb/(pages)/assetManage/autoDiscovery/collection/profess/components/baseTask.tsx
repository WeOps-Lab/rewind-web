'use client';

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import FieldModal from '@/app/cmdb/(pages)/assetData/list/fieldModal';
import useApiClient from '@/utils/request';
import styles from '../index.module.scss';
import IpRangeInput from '@/app/cmdb/components/ipInput';
import { useCommon } from '@/app/cmdb/context/common';
import { FieldModalRef } from '@/app/cmdb/types/assetManage';
import { useTranslation } from '@/utils/i18n';
import { CYCLE_OPTIONS } from '@/app/cmdb/constants/professCollection';
import {
  CaretRightOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  createTaskValidationRules,
  ENTER_TYPE,
} from '@/app/cmdb/constants/professCollection';
import {
  Form,
  Radio,
  TimePicker,
  InputNumber,
  Space,
  Collapse,
  Tooltip,
  Input,
  Button,
  Select,
  Table,
} from 'antd';

interface TableItem {
  key: string;
  ip: string;
  status: string;
}
interface BaseTaskFormProps {
  children?: React.ReactNode;
  nodeId?: string;
  showAdvanced?: boolean;
  modelId: string;
  submitLoading?: boolean;
  instPlaceholder?: string;
  timeoutProps?: {
    min?: number;
    defaultValue?: number;
    addonAfter?: string;
  };
  onClose: () => void;
  onTest?: () => void;
}

export interface BaseTaskRef {
  instOptions: { label: string; value: string; [key: string]: any }[];
  accessPoints: { label: string; value: string; [key: string]: any }[];
}

const BaseTaskForm = forwardRef<BaseTaskRef, BaseTaskFormProps>(
  (
    {
      children,
      showAdvanced = true,
      nodeId,
      submitLoading,
      modelId,
      timeoutProps = {
        min: 0,
        defaultValue: 600,
        addonAfter: '',
      },
      instPlaceholder,
      onClose,
      onTest,
    },
    ref
  ) => {
    const { t } = useTranslation();
    const { post, get } = useApiClient();
    const form = Form.useFormInstance();
    const fieldRef = useRef<FieldModalRef>(null);
    const commonContext = useCommon();
    const authList = useRef(commonContext?.authOrganizations || []);
    const organizationList = authList.current;
    const users = useRef(commonContext?.userList || []);
    const userList = users.current;
    const [instOptLoading, setOptLoading] = useState(false);
    const [instOptions, setOptions] = useState<
      { label: string; value: string }[]
    >([]);
    const [IpRange] = useState([]);
    const [collectionType, setCollectionType] = useState('asset');
    const [data] = useState<TableItem[]>([
      {
        key: '1',
        ip: '192.168.1.1',
        status: '正常',
      },
      {
        key: '2',
        ip: '192.168.1.2',
        status: '异常',
      },
    ]);
    const [accessPoints, setAccessPoints] = useState<
      { label: string; value: string }[]
    >([]);
    const [accessPointLoading, setAccessPointLoading] = useState(false);

    const columns = [
      {
        title: 'IP',
        dataIndex: 'ip',
        key: 'ip',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
      },
    ];

    const rules: any = React.useMemo(
      () => createTaskValidationRules({ t, form }),
      [t, form]
    );

    const initRef = useRef(false);
    useEffect(() => {
      if (initRef.current) return;
      initRef.current = true;
      fetchOptions();
      fetchAccessPoints();
    }, []);

    const onIpChange = () => {};

    const fetchOptions = async () => {
      try {
        setOptLoading(true);
        const data = await post('/cmdb/api/instance/search/', {
          model_id: modelId,
          page: 1,
          page_size: 10000,
        });
        setOptions(
          data.insts.map((item: any) => ({
            label: item.inst_name,
            value: item._id,
            origin: item,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch inst:', error);
      } finally {
        setOptLoading(false);
      }
    };

    const fetchAccessPoints = async () => {
      try {
        setAccessPointLoading(true);
        const res = await get('/cmdb/api/collect/nodes/', {
          params: {
            page: 1,
            page_size: 10,
            name: '',
          },
        });
        setAccessPoints(
          res.nodes?.map((node: any) => ({
            label: node.name,
            value: node.id,
            origin: node,
          })) || []
        );
      } catch (error) {
        console.error('获取接入点失败:', error);
      } finally {
        setAccessPointLoading(false);
      }
    };

    const showFieldModal = async () => {
      try {
        const attrList = await get(`/cmdb/api/model/${modelId}/attr_list/`);
        fieldRef.current?.showModal({
          type: 'add',
          attrList,
          formInfo: {},
          subTitle: '',
          title: t('common.addNew'),
          model_id: modelId,
          list: [],
        });
      } catch (error) {
        console.error('Failed to get attr list:', error);
      }
    };

    useImperativeHandle(ref, () => ({
      instOptions,
      accessPoints,
    }));

    return (
      <>
        <div className={styles.mainContent}>
          <div className={styles.sectionTitle}>
            {t('Collection.baseSetting')}
          </div>

          <Form.Item
            name="taskName"
            label={t('Collection.taskNameLabel')}
            rules={rules.taskName}
          >
            <Input
              className="w-[420px]"
              placeholder={t('Collection.taskNamePlaceholder')}
            />
          </Form.Item>

          {/* 扫描周期 */}
          <Form.Item
            label={t('Collection.cycle')}
            name="cycle"
            rules={rules.cycle}
          >
            <Radio.Group>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Radio value={CYCLE_OPTIONS.DAILY}>
                    {t('Collection.dailyAt')}
                    <Form.Item
                      name="dailyTime"
                      noStyle
                      dependencies={['cycle']}
                      rules={rules.dailyTime}
                    >
                      <TimePicker
                        className="w-40 ml-2"
                        format="HH:mm"
                        placeholder={t('Collection.selectTime')}
                      />
                    </Form.Item>
                  </Radio>
                </div>
                <div className="flex items-center">
                  <Radio value={CYCLE_OPTIONS.INTERVAL}>
                    <Space>
                      {t('Collection.everyMinute')}
                      <Form.Item
                        name="intervalValue"
                        noStyle
                        dependencies={['cycle']}
                        rules={rules.intervalValue}
                      >
                        <InputNumber
                          className="w-20"
                          min={5}
                          placeholder={t('common.inputMsg')}
                        />
                      </Form.Item>
                      {t('Collection.executeInterval')}
                    </Space>
                  </Radio>
                </div>
                <Radio value={CYCLE_OPTIONS.ONCE}>
                  {t('Collection.executeOnce')}
                </Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          {/* 录入方式 */}
          {nodeId !== 'k8s' && (
            <Form.Item
              name="enterType"
              rules={rules.enterType}
              required
              label={
                <Space>
                  {t('Collection.enterType')}
                  <Tooltip title={t('Collection.enterTypeTooltip')}>
                    <QuestionCircleOutlined className=" text-gray-400" />
                  </Tooltip>
                </Space>
              }
            >
              <Radio.Group>
                <Radio value={ENTER_TYPE.AUTOMATIC}>
                  {t('Collection.automatic')}
                </Radio>
                <Radio value={ENTER_TYPE.APPROVAL}>
                  {t('Collection.approvalRequired')}
                </Radio>
              </Radio.Group>
            </Form.Item>
          )}

          {/* ip选择 */}
          {nodeId === 'network' && (
            <div className="mb-6 ml-8">
              <Radio.Group
                value={collectionType}
                onChange={(e) => setCollectionType(e.target.value)}
              >
                <Radio value="ip">{t('Collection.chooseIp')}</Radio>
                <Radio value="asset">{t('Collection.chooseAsset')}</Radio>
              </Radio.Group>
              {collectionType === 'ip' && (
                <div className="mt-6 mb-6">
                  <Space>
                    <Button type="primary">{t('common.select')}</Button>
                    <Button>{t('delete')}</Button>
                  </Space>
                  <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    className="mt-4 mb-4"
                  />
                </div>
              )}
            </div>
          )}

          {/* 实例选择 */}
          <Form.Item label={instPlaceholder} required>
            <Space>
              <Form.Item name="instId" rules={rules.instId} noStyle>
                <Select
                  style={{ width: '380px' }}
                  placeholder={instPlaceholder}
                  options={instOptions}
                  loading={instOptLoading}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                />
              </Form.Item>
              <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={showFieldModal}
              />
            </Space>
          </Form.Item>

          {/* IP范围 */}
          {nodeId === 'network' && (
            <Form.Item label={t('Collection.ipRange')} name="ipRange" required>
              <IpRangeInput value={IpRange} onChange={onIpChange} />
            </Form.Item>
          )}

          {/* 接入点 */}
          {nodeId !== 'k8s' && (
            <Form.Item
              label={t('Collection.accessPoint')}
              name="accessPointId"
              required
              rules={[
                {
                  required: true,
                  message: t('common.selectMsg') + t('Collection.accessPoint'),
                },
              ]}
            >
              <Select
                style={{ width: '420px' }}
                placeholder={
                  t('common.selectMsg') + t('Collection.accessPoint')
                }
                options={accessPoints}
                loading={accessPointLoading}
              />
            </Form.Item>
          )}

          {children}

          {showAdvanced && (
            <Collapse
              ghost
              expandIcon={({ isActive }) => (
                <CaretRightOutlined
                  rotate={isActive ? 90 : 0}
                  className="text-base"
                />
              )}
            >
              <Collapse.Panel
                header={
                  <div className={styles.panelHeader}>
                    {t('Collection.advanced')}
                  </div>
                }
                key="advanced"
              >
                <Form.Item
                  label={
                    <span>
                      {t('Collection.timeout')}
                      <Tooltip title={t('Collection.timeoutTooltip')}>
                        <QuestionCircleOutlined className="ml-1 text-gray-400" />
                      </Tooltip>
                    </span>
                  }
                  name="timeout"
                  rules={rules.timeout}
                >
                  <InputNumber
                    className="w-28"
                    min={timeoutProps.min}
                    defaultValue={timeoutProps.defaultValue}
                    addonAfter={timeoutProps.addonAfter}
                  />
                </Form.Item>
              </Collapse.Panel>
            </Collapse>
          )}
        </div>

        <div className="flex justify-end space-x-4 mr-6">
          {onTest && <Button onClick={onTest}>{t('Collection.test')}</Button>}
          <Button type="primary" htmlType="submit" loading={submitLoading}>
            {t('Collection.confirm')}
          </Button>
          <Button onClick={onClose} disabled={submitLoading}>
            {t('Collection.cancel')}
          </Button>
        </div>

        <FieldModal
          ref={fieldRef}
          userList={userList}
          organizationList={organizationList}
          onSuccess={fetchOptions}
        />
      </>
    );
  }
);

BaseTaskForm.displayName = 'BaseTaskForm';
export default BaseTaskForm;
