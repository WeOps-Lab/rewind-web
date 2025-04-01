'use client';

import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Button, Form, Select, message } from 'antd';
import OperateDrawer from '@/app/node-manager/components/operate-drawer';
import { ModalRef, TableDataItem } from '@/app/node-manager/types';
import { useTranslation } from '@/utils/i18n';
import CodeEditor from '@/app/node-manager/components/codeEditor';
import { DownloadOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/auth';
import axios from 'axios';
const { Option } = Select;

interface ModalProps {
  sidecarVersionList: TableDataItem[];
  excutorVersionList: TableDataItem[];
}

const InstallGuidance = forwardRef<ModalRef, ModalProps>(
  ({ sidecarVersionList, excutorVersionList }, ref) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const authContext = useAuth();
    const token = authContext?.token || null;
    const tokenRef = useRef(token);
    const [groupVisible, setGroupVisible] = useState<boolean>(false);
    const [sidecarExportLoading, setSidecarExportLoading] =
      useState<boolean>(false);
    const [excutorrExportLoading, setExcutorExportLoading] =
      useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [formData, setFormData] = useState<TableDataItem>({});
    const [sidecar, setSidecar] = useState<string>('');
    const [excutor, setExcutor] = useState<string>('');
    const [script, setScript] = useState<string>('--');
    const [installType, setInstallType] = useState<string>('');

    useImperativeHandle(ref, () => ({
      showModal: ({ title, form, type }) => {
        console.log(formData);
        setGroupVisible(true);
        setInstallType(type);
        setTitle(title || '');
        setFormData(form || {});
        setScript(`import React from 'react';
import { cyan, generate, green, presetPalettes, red } from '@ant-design/colors';
import { Col, ColorPicker, Divider, Row, Space, theme } from 'antd';
import type { ColorPickerProps } from 'antd';`);
      },
    }));

    const handleCancel = () => {
      setGroupVisible(false);
      setFormData({});
      form.resetFields();
    };

    const download = async (field: string) => {
      if (field) return;
      try {
        if (field === 'sidecar') {
          setSidecarExportLoading(true);
        } else {
          setExcutorExportLoading(true);
        }
        const response = await axios({
          url: `/api/proxy/monitor/api/monitor_plugin/export/${field}/`, // 替换为你的导出数据的API端点
          method: 'GET',
          responseType: 'blob', // 确保响应类型为blob
          headers: {
            Authorization: `Bearer ${tokenRef.current}`,
          },
        });
        const text = await response.data.text();
        const json = JSON.parse(text);
        // 将data对象转换为JSON字符串并创建Blob对象
        const blob = new Blob([JSON.stringify(json.data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${field}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        message.success(t('common.successfulDownloaded'));
      } catch (error) {
        message.error(error as string);
      } finally {
        if (field === 'sidecar') {
          setSidecarExportLoading(false);
        } else {
          setExcutorExportLoading(false);
        }
      }
    };

    return (
      <div>
        <OperateDrawer
          width={700}
          title={title}
          visible={groupVisible}
          onClose={handleCancel}
          footer={
            <div>
              <Button onClick={handleCancel}>{t('common.cancel')}</Button>
            </div>
          }
        >
          {installType === 'manualInstall' ? (
            <div>
              <div className="mb-[16px]">
                {t('node-manager.cloudregion.node.downloadTips')}
              </div>
              <Form
                form={form}
                name="basic"
                layout="vertical"
                className="pl-[20px]"
              >
                <Form.Item
                  required
                  label={t('node-manager.cloudregion.node.sidecarVersion')}
                >
                  <Form.Item name="sidecar" noStyle>
                    <Select
                      style={{
                        width: 400,
                      }}
                      showSearch
                      allowClear
                      placeholder={t('common.pleaseSelect')}
                      value={sidecar}
                      onChange={(value: string) => {
                        setSidecar(value);
                      }}
                    >
                      {sidecarVersionList.map((item) => (
                        <Option value={item.id} key={item.id}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                    <Button
                      type="link"
                      icon={<DownloadOutlined />}
                      disabled={!sidecar}
                      loading={sidecarExportLoading}
                      onClick={() => download('sidecar')}
                    >
                      {t('common.download')}
                    </Button>
                  </Form.Item>
                </Form.Item>
                <Form.Item
                  required
                  label={t('node-manager.cloudregion.node.executorVersion')}
                >
                  <Form.Item name="excutor" noStyle>
                    <Select
                      style={{
                        width: 400,
                      }}
                      showSearch
                      allowClear
                      placeholder={t('common.pleaseSelect')}
                      value={excutor}
                      onChange={(value: string) => {
                        setExcutor(value);
                      }}
                    >
                      {excutorVersionList.map((item) => (
                        <Option value={item.id} key={item.id}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                    <Button
                      type="link"
                      disabled={!excutor}
                      icon={<DownloadOutlined />}
                      loading={excutorrExportLoading}
                      onClick={() => download('excutor')}
                    >
                      {t('common.download')}
                    </Button>
                  </Form.Item>
                </Form.Item>
              </Form>
              <div className="mb-[16px]">
                {t('node-manager.cloudregion.node.scriptTips')}
              </div>
              <CodeEditor
                readOnly
                showCopy
                value={script}
                className="ml-[20px]"
                width="100%"
                height="calc(100vh - 430px)"
                mode="python"
                theme="monokai"
                name="editor"
              />
            </div>
          ) : (
            <CodeEditor
              readOnly
              showCopy
              value={script}
              width="100%"
              height="calc(100vh - 180px)"
              mode="python"
              theme="monokai"
              name="editor"
            />
          )}
        </OperateDrawer>
      </div>
    );
  }
);
InstallGuidance.displayName = 'InstallGuidance';
export default InstallGuidance;
