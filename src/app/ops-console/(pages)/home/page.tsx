"use client";
import React, { useState, useEffect } from 'react';
import { Button, Popover, Skeleton, Form, message, Input } from 'antd';
import dayjs from 'dayjs';
import Icon from '@/components/icon';
import useApiClient from '@/utils/request';
import { useTranslation } from '@/utils/i18n';
import { useClientData } from '@/context/client';
import { useUserInfoContext } from '@/context/userInfo';
import OperateModal from '@/components/operate-modal'

interface CardData {
  name: string;
  description: string;
  url: string;
  client_id: string;
}

const ControlPage = () => {
  const { t } = useTranslation();
  const { post } = useApiClient();
  const { clientData, loading } = useClientData();
  const { loading: userLoading, isFirstLogin, userId } = useUserInfoContext();
  const [isPopoverVisible, setIsPopoverVisible] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const isDemoEnv = process.env.NEXT_PUBLIC_IS_DEMO_ENV === 'true';

  useEffect(() => {
    const consoleContainer = document.querySelector(".console-container");
    if (consoleContainer?.parentElement) {
      consoleContainer.parentElement.style.padding = "0";
    }
  }, []);

  const handleApplyDemoClick = () => {
    window.location.href = "https://www.canway.net/apply.html";
  };

  const handleContactUsClick = () => {
    setIsPopoverVisible(!isPopoverVisible);
  };

  const popoverContent = (
    <>
      <div className="border-b border-[var(--color-border-1)]">
        <div className="flex items-center mb-2">
          <Icon type="dadianhua" className="mr-1 text-[var(--color-primary)]" />
          <span>{t('opsConsole.serviceHotline')}:</span>
        </div>
        <p className="text-blue-600 mb-4">020-38847288</p>
      </div>
      <div className="pt-4">
        <div className="flex items-center mb-2">
          <Icon type="qq" className="mr-1 text-[var(--color-primary)]" />
          <span>{t('opsConsole.qqConsultation')}:</span>
        </div>
        <p className="text-blue-600">3593213400</p>
      </div>
    </>
  );

  const handleCardClick = (url: string) => {
    window.open(url, "_blank");
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const values = await form.validateFields();
      await post('/console_mgmt/init_user_set/', {
        group_name: values.group_name,
        user_id: userId,
      });
      message.success(t('common.saveSuccess'));
      window.location.reload();
    } catch {
      message.error(t('common.saveFailed'));
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      <div
        className="relative w-full h-full flex flex-col p-12 console-container"
        style={{
          backgroundImage: `url('/app/console_bg.jpg')`,
          backgroundSize: "contain",
          backgroundPosition: "top",
          minHeight: "calc(100vh - 58px)",
        }}
      >
        <div className="mt-6 mb-10">
          <div className="w-full flex justify-between items-center">
            <div className="w-full">
              <h1 className="text-3xl font-bold mb-4">{t('opsConsole.console')}</h1>
              <p className="text-[var(--color-text-2)] mb-4 w-1/2 break-words">
                {t('opsConsole.description')}
              </p>
            </div>
            {isDemoEnv && (
              <div className="absolute right-4 top-4 flex flex-col text-sm">
                <div
                  onClick={handleApplyDemoClick}
                  className="bg-gradient-to-b from-blue-500 tracking-[3px] to-indigo-600 text-white rounded-3xl py-1 shadow-md w-[32px] flex items-center justify-center mb-2 cursor-pointer"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "upright",
                  }}
                >
                  {t('opsConsole.freeApply')}
                </div>
                <Popover
                  content={popoverContent}
                  visible={isPopoverVisible}
                  trigger="click"
                  placement="left"
                  onVisibleChange={setIsPopoverVisible}
                >
                  <div
                    onClick={handleContactUsClick}
                    className="bg-white text-[var(--color-primary)] tracking-[3px]  rounded-3xl shadow-md w-[32px] py-1 flex items-center justify-center cursor-pointer"
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "upright",
                    }}
                  >
                    <Icon type="lianxiwomen1" className="mb-1" />
                    {t('opsConsole.contactUs')}
                  </div>
                </Popover>
              </div>
            )}
          </div>
          <div className="flex items-center mb-6 border border-[var(--color-border-1)] rounded-3xl w-[180px] text-sm">
            <span className="bg-[var(--color-text-2)] text-white px-4 py-1 rounded-2xl mr-2">{t('opsConsole.date')}</span>
            <span className="text-[var(--color-text-3)]">{dayjs().format("YYYY/MM/DD")}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {(loading || userLoading || isFirstLogin) ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="bg-[var(--color-bg)] p-4 rounded shadow-md flex flex-col justify-between relative h-[230px]">
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            ))
          ) : (
            clientData.filter(cardData => cardData.client_id !== "ops-console").map((cardData: CardData, index: number) => (
              <div
                key={index}
                className="bg-[var(--color-bg)] p-4 rounded shadow-md flex flex-col justify-between relative h-[230px]"
                onClick={() => handleCardClick(cardData.url)}
              >
                <div className="absolute top-6 right-4">
                  <Button
                    type="primary"
                    size="small"
                    className="flex items-center text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(cardData.url);
                    }}
                  >
                    {t('opsConsole.clickToEnter')}
                  </Button>
                </div>
                <div className="flex flex-col items-start">
                  <Icon type={cardData.client_id} className="text-6xl mb-2" />
                  <h2 className="text-xl font-bold mb-2">{cardData.name}</h2>
                  <div className="flex items-center text-xs mb-2 bg-[var(--color-bg-active)] p-1 rounded">
                    <Icon
                      type="shezhi"
                      className="w-6 h-6 mr-1 text-[var(--color-primary)]"
                    />
                    <span className="text-[var(--color-text-3)]">50/100</span>
                  </div>
                </div>
                <p
                  className="text-[var(--color-text-3)] overflow-hidden text-ellipsis line-clamp-2 text-sm"
                  style={{ minHeight: "2.5rem" }}
                >
                  {cardData.description}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <OperateModal
        title={t('opsConsole.initUserSet')}
        visible={isFirstLogin && !userLoading}
        closable={false}
        footer={[
          <Button key="submit" type="primary" loading={confirmLoading} onClick={handleOk}>
            {t('common.confirm')}
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="group_name"
            label={t('opsConsole.group')}
            rules={[
              { required: true, message: `${t('common.inputMsg')}${('opsConsole.group')}` }
            ]}
          >
            <Input placeholder={`${t('common.inputMsg')}${('opsConsole.group')}`} />
          </Form.Item>
        </Form>
      </OperateModal>
    </>
  );
};

export default ControlPage;
