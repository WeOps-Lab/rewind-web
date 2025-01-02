'use client';
import React, { useState, useEffect } from 'react';
import ThreeStep from './threeStep';
import { Spin, Form, Input, Select, Button, message } from 'antd';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { MetricItem, CollectionTargetField } from '@/app/monitor/types/monitor';
import { useSearchParams } from 'next/navigation';
import configureStyle from './index.module.scss';
import threeStepStyle from './threeStep.module.scss';
const { Option } = Select;

const Configure: React.FC = () => {
  const { post, isLoading } = useApiClient();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || '';
  const objId = searchParams.get('id') || '';
  const [form] = Form.useForm();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [step3Content, setStep3Content] = useState<JSX.Element | string>('');
  const [metrics, setMetrics] = useState<MetricItem[]>([]);
  const [originMetrics, setoriginMetrics] = useState<MetricItem[]>([
    {
      id: 0,
      metric_group: 0,
      metric_object: 0,
      name: 'All',
      type: 'none',
      dimensions: [],
    },
  ]);
  const [intervalUnit, setIntervalUnit] = useState<string>('s');

  useEffect(() => {
    if (isLoading) return;
    getMetrics();
  }, [isLoading]);

  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      interval: 10,
    });
  }, [name]);

  const getMetrics = () => {
    setPageLoading(false);
    console.log(setoriginMetrics);
  };

  const createContent = () => {
    form?.validateFields().then((values) => {
      if (intervalUnit === 'm') {
        values.interval = values.interval * 60;
      } else {
        values.interval = +values.interval;
      }
      getStep3Content(values);
    });
  };

  const getStep3Content = async (
    params = { interval: '', monitor_url: '' }
  ) => {
    try {
      setLoading(true);
      const instnaceId = await post(
        `/monitor/api/monitor_instance/${objId}/generate_instance_id/`,
        params
      );
      let content: string | JSX.Element = '';
      switch (name) {
        case 'Website':
          content = (
            <div>
              <ul>
                <li>{'scrape_configs:'}</li>
                <li className="ml-[10px]">{"- job_name: 'blackbox'"}</li>
                <li className="ml-[20px]">{'metrics_path: /probe'}</li>
                <li className="ml-[20px]">{'params:'}</li>
                <li className="ml-[30px]">{'module: [http_2xx]'}</li>
                <li className="ml-[20px]">{'static_configs:'}</li>
                <li className="ml-[30px]">{'- targets:'}</li>
                <li className="ml-[40px]">{`- ${params.monitor_url}`}</li>
                <li className="ml-[20px]">{'relabel_configs:'}</li>
                <li className="ml-[30px]">
                  {'- source_labels: [__address__]'}
                </li>
                <li className="ml-[40px]">{'target_label: __param_target'}</li>
                <li className="ml-[30px]">
                  {'- source_labels: [__param_target]'}
                </li>
                <li className="ml-[40px]">{'target_label: instance'}</li>
                <li className="ml-[30px]">{'- target_label: __address__'}</li>
                <li className="ml-[40px]">{'replacement: 127.0.0.1:9115'}</li>
              </ul>
            </div>
          );
          break;
        case 'Cluster':
          content = (
            <div>
              <ul>
                <li>
                  {'VERSION=v0.49.1 # use the latest release version from'}
                </li>
                <li>{'https://github.com/google/cadvisor/releases'}</li>
                <li>{`sudo docker run \\`}</li>
                <li className="ml-[10px]">{`--volume=/:/rootfs:ro \\`}</li>
                <li className="ml-[10px]">{`--volume=/var/run:/var/run:ro \\`}</li>
                <li className="ml-[10px]">{`--volume=/sys:/sys:ro \\`}</li>
                <li className="ml-[10px]">{`--volume=/var/lib/docker/:/var/lib/docker:ro \\`}</li>
                <li className="ml-[10px]">{`--volume=/dev/disk/:/dev/disk:ro \\`}</li>
                <li className="ml-[10px]">{`--publish=8080:8080 \\`}</li>
                <li className="ml-[10px]">{`--detach=true \\`}</li>
                <li className="ml-[10px]">{`--name=cadvisor \\`}</li>
                <li className="ml-[10px]">{`--privileged \\`}</li>
                <li className="ml-[10px]">{`--device=/dev/kmsg \\`}</li>
                <li className="ml-[10px]">{`gcr.io/cadvisor/cadvisor:$VERSION`}</li>
              </ul>
            </div>
          );
          break;
        default:
          content = (
            <div className={threeStepStyle.hostContent}>
              <ul>
                <li>{'[global_tags]'}</li>
                <li>{'agent_id="${node.name}"'}</li>
              </ul>
              <ul>
                <li>{'[agent]'}</li>
                <li>{`interval = "${params.interval}s"`}</li>
                <li>{'round_interval = true'}</li>
                <li>{'metric_batch_size = 1000'}</li>
                <li>{'metric_buffer_limit = 10000'}</li>
                <li>{'collection_jitter = "0s"'}</li>
                <li>{'flush_jitter = "30s"'}</li>
                <li>{'precision = "0s"'}</li>
                <li>{'hostname = "${node.name}"'}</li>
                <li>{'omit_hostname = false'}</li>
              </ul>
              <ul>
                <li>{'[[outputs.kafka]]'}</li>
                <li>{'brokers = ["${KAFKA_ADDR}:${KAFKA_PORT}"]'}</li>
                <li>{'topic = "telegraf"'}</li>
                <li>{'sasl_username = "${KAFKA_USERNAME}"'}</li>
                <li>{'sasl_password = "${KAFKA_PASSWORD}"'}</li>
                <li>{'sasl_mechanism = "PLAIN"'}</li>
                <li>{'max_message_bytes = 10000000'}</li>
                <li>{'compression_codec=1'}</li>
              </ul>
              <ul>
                <li>{'[[inputs.internal]]'}</li>
                <li>{`tags = { "instance_id"="${instnaceId}"}`}</li>
              </ul>
              <ul>
                <li>{'[[inputs.prometheus]]'}</li>
                <li>{'urls = ["http://127.0.0.1:41000/metrics"]'}</li>
                <li>{`tags = { "instance_id"="${instnaceId}"}`}</li>
              </ul>
              <ul>
                <li>{'[[inputs.prometheus]]'}</li>
                <li>
                  {
                    'urls = ["http://127.0.0.1:41001/probe?target=https://wedoc.canway.net/&module=http_2xx"]'
                  }
                </li>
                <li>{`tags = { "instance_id"="${instnaceId}"}`}</li>
              </ul>
            </div>
          );
      }
      message.success(t('common.successfullyAdded'));
      setStep3Content(content);
    } finally {
      setLoading(false);
    }
  };

  const changeStep3Content = () => {
    setStep3Content(<></>);
  };

  const handleStep2Change = (selected: number[]) => {
    const metricsIds = originMetrics.filter((item) =>
      selected.includes(item.id)
    );
    setMetrics(metricsIds);
    console.log(metrics);
  };

  const handleValuesChange = (changedValues: any) => {
    if (changedValues) return;
    changeStep3Content();
  };

  const handleIntervalChange = (value: string) => {
    setIntervalUnit(value);
  };

  return (
    <div className={configureStyle.configure}>
      <Spin spinning={pageLoading}>
        <p className="mb-[20px]">
          {t('monitor.intergrations.configureStepIntro')}
        </p>
        <ThreeStep
          metricsDisabled={true}
          step2Options={originMetrics}
          step3Content={step3Content}
          step3Config={
            <Button type="primary" loading={loading} onClick={createContent}>
              {t('monitor.intergrations.generateConfiguration')}
            </Button>
          }
          onStep2Change={handleStep2Change}
        >
          <Form form={form} name="basic" onValuesChange={handleValuesChange}>
            <Form.Item<CollectionTargetField>
              label={
                <span className="w-[100px]">
                  {t('monitor.intergrations.instanceName')}
                </span>
              }
              name="monitor_instance_name"
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input className="w-[300px]" />
            </Form.Item>
            {name === 'Website' && (
              <Form.Item<CollectionTargetField>
                label={
                  <span className="w-[100px]">
                    {t('monitor.intergrations.url')}
                  </span>
                }
                name="monitor_url"
                rules={[{ required: true, message: t('common.required') }]}
              >
                <Input className="w-[300px]" />
              </Form.Item>
            )}
            <Form.Item<CollectionTargetField>
              label={
                <span className="w-[100px]">
                  {t('monitor.intergrations.interval')}
                </span>
              }
              className={configureStyle.interval}
            >
              <Form.Item
                name="interval"
                noStyle
                rules={[{ required: true, message: t('common.required') }]}
              >
                <Input className="w-[300px]" />
              </Form.Item>
              <Select
                className="ml-[10px]"
                style={{ width: '100px' }}
                onChange={handleIntervalChange}
                value={intervalUnit}
              >
                <Option value="s">s</Option>
                <Option value="m">min</Option>
              </Select>
            </Form.Item>
          </Form>
        </ThreeStep>
      </Spin>
    </div>
  );
};

export default Configure;
