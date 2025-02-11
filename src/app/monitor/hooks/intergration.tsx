import React, { useMemo } from 'react';
import { Form, Checkbox, Space, Select, Input, InputNumber } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import { TIMEOUT_UNITS } from '@/app/monitor/constants/monitor';

const { Option } = Select;

interface UseColumnsAndFormItemsParams {
  collectType: string;
  columns: any[];
  authPasswordRef: React.RefObject<any>;
  privPasswordRef: React.RefObject<any>;
  passwordRef: React.RefObject<any>;
  authPasswordDisabled: boolean;
  privPasswordDisabled: boolean;
  passwordDisabled: boolean;
  handleEditAuthPassword: () => void;
  handleEditPrivPassword: () => void;
  handleEditPassword: () => void;
}

const useColumnsAndFormItems = ({
  collectType,
  columns,
  authPasswordRef,
  privPasswordRef,
  passwordRef,
  authPasswordDisabled,
  privPasswordDisabled,
  passwordDisabled,
  handleEditAuthPassword,
  handleEditPrivPassword,
  handleEditPassword,
}: UseColumnsAndFormItemsParams) => {
  const { t } = useTranslation();

  const result = useMemo(() => {
    switch (collectType) {
      case 'host':
        return {
          displaycolumns: [columns[0], ...columns.slice(4, 7)],
          formItems: (
            <Form.Item
              label={t('monitor.intergrations.metricType')}
              name="metric_type"
              rules={[
                {
                  required: true,
                  message: t('common.required'),
                },
              ]}
            >
              <Checkbox.Group>
                <Space direction="vertical">
                  <Checkbox value="cpu">
                    <span>
                      <span className="w-[80px] inline-block">CPU</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.cpuDes')}
                      </span>
                    </span>
                  </Checkbox>
                  <Checkbox value="disk">
                    <span>
                      <span className="w-[80px] inline-block">Disk</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.diskDes')}
                      </span>
                    </span>
                  </Checkbox>
                  <Checkbox value="diskio">
                    <span>
                      <span className="w-[80px] inline-block">Disk IO</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.diskIoDes')}
                      </span>
                    </span>
                  </Checkbox>
                  <Checkbox value="mem">
                    <span>
                      <span className="w-[80px] inline-block">Memory</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.memoryDes')}
                      </span>
                    </span>
                  </Checkbox>
                  <Checkbox value="net">
                    <span>
                      <span className="w-[80px] inline-block">Net</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.netDes')}
                      </span>
                    </span>
                  </Checkbox>
                  <Checkbox value="processes">
                    <span>
                      <span className="w-[80px] inline-block">Processes</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.processesDes')}
                      </span>
                    </span>
                  </Checkbox>
                  <Checkbox value="system">
                    <span>
                      <span className="w-[80px] inline-block">System</span>
                      <span className="text-[var(--color-text-3)] text-[12px]">
                        {t('monitor.intergrations.systemDes')}
                      </span>
                    </span>
                  </Checkbox>
                </Space>
              </Checkbox.Group>
            </Form.Item>
          ),
        };
      case 'trap':
        return {
          displaycolumns: [columns[0], ...columns.slice(4, 7)],
          formItems: null,
        };
      case 'web':
        return {
          displaycolumns: [columns[1], ...columns.slice(3, 7)],
          formItems: null,
        };
      case 'ping':
        return {
          displaycolumns: [columns[1], ...columns.slice(3, 7)],
          formItems: null,
        };
      case 'snmp':
        return {
          displaycolumns: [columns[0], columns[2], ...columns.slice(4, 7)],
          formItems: (
            <>
              <Form.Item required label={t('monitor.intergrations.port')}>
                <Form.Item
                  noStyle
                  name="port"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <InputNumber
                    className="w-[300px] mr-[10px]"
                    min={1}
                    precision={0}
                  />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.portDes')}
                </span>
              </Form.Item>
              <Form.Item required label={t('monitor.intergrations.version')}>
                <Form.Item
                  noStyle
                  name="version"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Select className="mr-[10px]" style={{ width: '300px' }}>
                    <Option value={2}>v2c</Option>
                    <Option value={3}>v3</Option>
                  </Select>
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.versionDes')}
                </span>
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.version !== currentValues.version
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue('version') === 2 ? (
                    <Form.Item
                      required
                      label={t('monitor.intergrations.community')}
                    >
                      <Form.Item
                        noStyle
                        name="community"
                        rules={[
                          {
                            required: true,
                            message: t('common.required'),
                          },
                        ]}
                      >
                        <Input className="w-[300px] mr-[10px]" />
                      </Form.Item>
                      <span className="text-[12px] text-[var(--color-text-3)]">
                        {t('monitor.intergrations.communityDes')}
                      </span>
                    </Form.Item>
                  ) : (
                    <>
                      <Form.Item required label={t('common.name')}>
                        <Form.Item
                          noStyle
                          name="sec_name"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input className="w-[300px] mr-[10px]" />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.nameDes')}
                        </span>
                      </Form.Item>
                      <Form.Item required label={t('monitor.events.level')}>
                        <Form.Item
                          noStyle
                          name="sec_level"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Select
                            className="mr-[10px]"
                            style={{ width: '300px' }}
                          >
                            <Option value="noAuthNoPriv">noAuthNoPriv</Option>
                            <Option value="authNoPriv">authNoPriv</Option>
                            <Option value="authPriv">authPriv</Option>
                          </Select>
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.levelDes')}
                        </span>
                      </Form.Item>
                      <Form.Item
                        required
                        label={t('monitor.intergrations.authProtocol')}
                      >
                        <Form.Item
                          noStyle
                          name="auth_protocol"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input className="w-[300px] mr-[10px]" />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.authProtocolDes')}
                        </span>
                      </Form.Item>
                      <Form.Item
                        required
                        label={t('monitor.intergrations.authPassword')}
                      >
                        <Form.Item
                          noStyle
                          name="auth_password"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input
                            ref={authPasswordRef}
                            disabled={authPasswordDisabled}
                            className="w-[300px] mr-[10px]"
                            type="password"
                            suffix={
                              <EditOutlined
                                className="text-[var(--color-text-2)]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAuthPassword();
                                }}
                              />
                            }
                          />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.authPasswordDes')}
                        </span>
                      </Form.Item>
                      <Form.Item
                        required
                        label={t('monitor.intergrations.privProtocol')}
                      >
                        <Form.Item
                          noStyle
                          name="priv_protocol"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input className="w-[300px] mr-[10px]" />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.privProtocolDes')}
                        </span>
                      </Form.Item>
                      <Form.Item
                        required
                        label={t('monitor.intergrations.privPassword')}
                      >
                        <Form.Item
                          noStyle
                          name="priv_password"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input
                            ref={privPasswordRef}
                            disabled={privPasswordDisabled}
                            className="w-[300px] mr-[10px]"
                            type="password"
                            suffix={
                              <EditOutlined
                                className="text-[var(--color-text-2)]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPrivPassword();
                                }}
                              />
                            }
                          />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.privPasswordDes')}
                        </span>
                      </Form.Item>
                    </>
                  )
                }
              </Form.Item>
              <Form.Item required label={t('monitor.intergrations.timeout')}>
                <Form.Item
                  noStyle
                  name="timeout"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <InputNumber
                    className="mr-[10px]"
                    min={1}
                    precision={0}
                    addonAfter={
                      <Select style={{ width: 116 }} defaultValue="s">
                        {TIMEOUT_UNITS.map((item: string) => (
                          <Option key={item} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    }
                  />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.timeoutDes')}
                </span>
              </Form.Item>
            </>
          ),
        };
      case 'ipmi':
        return {
          displaycolumns: [columns[0], columns[2], ...columns.slice(4, 7)],
          formItems: (
            <>
              <Form.Item label={t('monitor.intergrations.username')} required>
                <Form.Item
                  noStyle
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Input className="w-[300px] mr-[10px]" />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.usernameDes')}
                </span>
              </Form.Item>
              <Form.Item label={t('monitor.intergrations.password')} required>
                <Form.Item
                  noStyle
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Input
                    ref={passwordRef}
                    disabled={passwordDisabled}
                    className="w-[300px] mr-[10px]"
                    type="password"
                    suffix={
                      <EditOutlined
                        className="text-[var(--color-text-2)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPassword();
                        }}
                      />
                    }
                  />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.passwordDes')}
                </span>
              </Form.Item>
              <Form.Item label={t('monitor.intergrations.protocol')} required>
                <Form.Item
                  noStyle
                  name="protocol"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Input className="w-[300px] mr-[10px]" />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.protocolDes')}
                </span>
              </Form.Item>
            </>
          ),
        };
      default:
        return {
          displaycolumns: [columns[0], ...columns.slice(4, 7)],
          formItems: null,
        };
    }
  }, [
    collectType,
    columns,
    t,
    authPasswordRef,
    privPasswordRef,
    passwordRef,
    authPasswordDisabled,
    privPasswordDisabled,
    passwordDisabled,
    handleEditAuthPassword,
    handleEditPrivPassword,
    handleEditPassword,
  ]);

  return result;
};

const useFormItems = ({
  collectType,
  authPasswordRef,
  privPasswordRef,
  passwordRef,
  authPasswordDisabled,
  privPasswordDisabled,
  passwordDisabled,
  handleEditAuthPassword,
  handleEditPrivPassword,
  handleEditPassword,
}: UseColumnsAndFormItemsParams) => {
  const { t } = useTranslation();

  const result = useMemo(() => {
    switch (collectType) {
      case 'host':
        return {
          formItems: (
            <>
              <Form.Item required label="Ip">
                <Form.Item
                  noStyle
                  name="monitor_ip"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Input className="w-[300px] mr-[10px]" />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.ipDes')}
                </span>
              </Form.Item>
              <Form.Item
                label={t('monitor.intergrations.metricType')}
                name="metric_type"
                rules={[
                  {
                    required: true,
                    message: t('common.required'),
                  },
                ]}
              >
                <Checkbox.Group>
                  <Space direction="vertical">
                    <Checkbox value="cpu">
                      <span>
                        <span className="w-[80px] inline-block">CPU</span>
                        <span className="text-[var(--color-text-3)] text-[12px]">
                          {t('monitor.intergrations.cpuDes')}
                        </span>
                      </span>
                    </Checkbox>
                    <Checkbox value="disk">
                      <span>
                        <span className="w-[80px] inline-block">Disk</span>
                        <span className="text-[var(--color-text-3)] text-[12px]">
                          {t('monitor.intergrations.diskDes')}
                        </span>
                      </span>
                    </Checkbox>
                    <Checkbox value="diskio">
                      <span>
                        <span className="w-[80px] inline-block">Disk IO</span>
                        <span className="text-[var(--color-text-3)] text-[12px]">
                          {t('monitor.intergrations.diskIoDes')}
                        </span>
                      </span>
                    </Checkbox>
                    <Checkbox value="mem">
                      <span>
                        <span className="w-[80px] inline-block">Memory</span>
                        <span className="text-[var(--color-text-3)] text-[12px]">
                          {t('monitor.intergrations.memoryDes')}
                        </span>
                      </span>
                    </Checkbox>
                    <Checkbox value="net">
                      <span>
                        <span className="w-[80px] inline-block">Net</span>
                        <span className="text-[var(--color-text-3)] text-[12px]">
                          {t('monitor.intergrations.netDes')}
                        </span>
                      </span>
                    </Checkbox>
                    <Checkbox value="processes">
                      <span>
                        <span className="w-[80px] inline-block">Processes</span>
                        <span className="text-[var(--color-text-3)] text-[12px]">
                          {t('monitor.intergrations.processesDes')}
                        </span>
                      </span>
                    </Checkbox>
                    <Checkbox value="system">
                      <span>
                        <span className="w-[80px] inline-block">System</span>
                        <span className="text-[var(--color-text-3)] text-[12px]">
                          {t('monitor.intergrations.systemDes')}
                        </span>
                      </span>
                    </Checkbox>
                  </Space>
                </Checkbox.Group>
              </Form.Item>
            </>
          ),
        };
      case 'trap':
        return {
          formItems: (
            <Form.Item required label="Ip">
              <Form.Item
                noStyle
                name="monitor_ip"
                rules={[
                  {
                    required: true,
                    message: t('common.required'),
                  },
                ]}
              >
                <Input className="w-[300px] mr-[10px]" />
              </Form.Item>
              <span className="text-[12px] text-[var(--color-text-3)]">
                {t('monitor.intergrations.ipDes')}
              </span>
            </Form.Item>
          ),
        };
      case 'web':
        return {
          formItems: (
            <Form.Item required label="Url">
              <Form.Item
                noStyle
                name="monitor_url"
                rules={[
                  {
                    required: true,
                    message: t('common.required'),
                  },
                ]}
              >
                <Input className="w-[300px] mr-[10px]" />
              </Form.Item>
              <span className="text-[12px] text-[var(--color-text-3)]">
                {t('monitor.intergrations.urlDes')}
              </span>
            </Form.Item>
          ),
        };
      case 'ping':
        return {
          formItems: (
            <Form.Item required label="Url">
              <Form.Item
                noStyle
                name="monitor_url"
                rules={[
                  {
                    required: true,
                    message: t('common.required'),
                  },
                ]}
              >
                <Input className="w-[300px] mr-[10px]" />
              </Form.Item>
              <span className="text-[12px] text-[var(--color-text-3)]">
                {t('monitor.intergrations.urlDes')}
              </span>
            </Form.Item>
          ),
        };
      case 'snmp':
        return {
          formItems: (
            <>
              <Form.Item required label="Ip">
                <Form.Item
                  noStyle
                  name="monitor_ip"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Input className="w-[300px] mr-[10px]" />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.ipDes')}
                </span>
              </Form.Item>
              <Form.Item required label={t('monitor.intergrations.port')}>
                <Form.Item
                  noStyle
                  name="port"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <InputNumber
                    className="w-[300px] mr-[10px]"
                    min={1}
                    precision={0}
                  />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.portDes')}
                </span>
              </Form.Item>
              <Form.Item required label={t('monitor.intergrations.version')}>
                <Form.Item
                  noStyle
                  name="version"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Select className="mr-[10px]" style={{ width: '300px' }}>
                    <Option value={2}>v2c</Option>
                    <Option value={3}>v3</Option>
                  </Select>
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.versionDes')}
                </span>
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.version !== currentValues.version
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue('version') === 2 ? (
                    <Form.Item
                      required
                      label={t('monitor.intergrations.community')}
                    >
                      <Form.Item
                        noStyle
                        name="community"
                        rules={[
                          {
                            required: true,
                            message: t('common.required'),
                          },
                        ]}
                      >
                        <Input className="w-[300px] mr-[10px]" />
                      </Form.Item>
                      <span className="text-[12px] text-[var(--color-text-3)]">
                        {t('monitor.intergrations.communityDes')}
                      </span>
                    </Form.Item>
                  ) : (
                    <>
                      <Form.Item required label={t('common.name')}>
                        <Form.Item
                          noStyle
                          name="sec_name"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input className="w-[300px] mr-[10px]" />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.nameDes')}
                        </span>
                      </Form.Item>
                      <Form.Item required label={t('monitor.events.level')}>
                        <Form.Item
                          noStyle
                          name="sec_level"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Select
                            className="mr-[10px]"
                            style={{ width: '300px' }}
                          >
                            <Option value="noAuthNoPriv">noAuthNoPriv</Option>
                            <Option value="authNoPriv">authNoPriv</Option>
                            <Option value="authPriv">authPriv</Option>
                          </Select>
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.levelDes')}
                        </span>
                      </Form.Item>
                      <Form.Item
                        required
                        label={t('monitor.intergrations.authProtocol')}
                      >
                        <Form.Item
                          noStyle
                          name="auth_protocol"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input className="w-[300px] mr-[10px]" />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.authProtocolDes')}
                        </span>
                      </Form.Item>
                      <Form.Item
                        required
                        label={t('monitor.intergrations.authPassword')}
                      >
                        <Form.Item
                          noStyle
                          name="auth_password"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input
                            ref={authPasswordRef}
                            disabled={authPasswordDisabled}
                            className="w-[300px] mr-[10px]"
                            type="password"
                            suffix={
                              <EditOutlined
                                className="text-[var(--color-text-2)]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAuthPassword();
                                }}
                              />
                            }
                          />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.authPasswordDes')}
                        </span>
                      </Form.Item>
                      <Form.Item
                        required
                        label={t('monitor.intergrations.privProtocol')}
                      >
                        <Form.Item
                          noStyle
                          name="priv_protocol"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input className="w-[300px] mr-[10px]" />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.privProtocolDes')}
                        </span>
                      </Form.Item>
                      <Form.Item
                        required
                        label={t('monitor.intergrations.privPassword')}
                      >
                        <Form.Item
                          noStyle
                          name="priv_password"
                          rules={[
                            {
                              required: true,
                              message: t('common.required'),
                            },
                          ]}
                        >
                          <Input
                            ref={privPasswordRef}
                            disabled={privPasswordDisabled}
                            className="w-[300px] mr-[10px]"
                            type="password"
                            suffix={
                              <EditOutlined
                                className="text-[var(--color-text-2)]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPrivPassword();
                                }}
                              />
                            }
                          />
                        </Form.Item>
                        <span className="text-[12px] text-[var(--color-text-3)]">
                          {t('monitor.intergrations.privPasswordDes')}
                        </span>
                      </Form.Item>
                    </>
                  )
                }
              </Form.Item>
              <Form.Item required label={t('monitor.intergrations.timeout')}>
                <Form.Item
                  noStyle
                  name="timeout"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <InputNumber
                    className="mr-[10px]"
                    min={1}
                    precision={0}
                    addonAfter={
                      <Select style={{ width: 116 }} defaultValue="s">
                        {TIMEOUT_UNITS.map((item: string) => (
                          <Option key={item} value={item}>
                            {item}
                          </Option>
                        ))}
                      </Select>
                    }
                  />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.timeoutDes')}
                </span>
              </Form.Item>
            </>
          ),
        };
      case 'ipmi':
        return {
          formItems: (
            <>
              <Form.Item required label="Ip">
                <Form.Item
                  noStyle
                  name="monitor_ip"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Input className="w-[300px] mr-[10px]" />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.ipDes')}
                </span>
              </Form.Item>
              <Form.Item label={t('monitor.intergrations.username')} required>
                <Form.Item
                  noStyle
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Input className="w-[300px] mr-[10px]" />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.usernameDes')}
                </span>
              </Form.Item>
              <Form.Item label={t('monitor.intergrations.password')} required>
                <Form.Item
                  noStyle
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Input
                    ref={passwordRef}
                    disabled={passwordDisabled}
                    className="w-[300px] mr-[10px]"
                    type="password"
                    suffix={
                      <EditOutlined
                        className="text-[var(--color-text-2)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPassword();
                        }}
                      />
                    }
                  />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.passwordDes')}
                </span>
              </Form.Item>
              <Form.Item label={t('monitor.intergrations.protocol')} required>
                <Form.Item
                  noStyle
                  name="protocol"
                  rules={[
                    {
                      required: true,
                      message: t('common.required'),
                    },
                  ]}
                >
                  <Input className="w-[300px] mr-[10px]" />
                </Form.Item>
                <span className="text-[12px] text-[var(--color-text-3)]">
                  {t('monitor.intergrations.protocolDes')}
                </span>
              </Form.Item>
            </>
          ),
        };
      default:
        return {
          formItems: null,
        };
    }
  }, [
    collectType,
    t,
    authPasswordRef,
    privPasswordRef,
    passwordRef,
    authPasswordDisabled,
    privPasswordDisabled,
    passwordDisabled,
    handleEditAuthPassword,
    handleEditPrivPassword,
    handleEditPassword,
  ]);

  return result;
};

export { useColumnsAndFormItems, useFormItems };
