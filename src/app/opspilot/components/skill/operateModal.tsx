import React, { useEffect, useState } from 'react';
import { Spin, Tooltip, Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Icon from '@/components/icon';
import { useTranslation } from '@/utils/i18n';
import { KnowledgeBase } from '@/app/opspilot/types/skill';
import styles from './index.module.scss';
import OperateModal from '@/components/operate-modal';
import { getIconTypeByIndex } from '@/app/opspilot/utils/knowledgeBaseUtils';

interface OperateModalProps {
  visible: boolean;
  okText: string;
  cancelText: string;
  onOk: (selected: number[]) => void;
  onCancel: () => void;
  knowledgeBases: KnowledgeBase[];
  selectedKnowledgeBases: number[];
}

const SkillOperateModal: React.FC<OperateModalProps> = ({
  visible, okText, cancelText, onOk, onCancel, knowledgeBases, selectedKnowledgeBases
}) => {
  const { t } = useTranslation();
  const [tempSelectedKnowledgeBases, setTempSelectedKnowledgeBases] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (visible) {
      setTempSelectedKnowledgeBases(selectedKnowledgeBases);
    }
  }, [visible, selectedKnowledgeBases]);

  const handleKnowledgeBaseSelect = (id: number) => {
    setTempSelectedKnowledgeBases((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleOk = () => {
    onOk(tempSelectedKnowledgeBases);
  };

  const handleConfigureKnowledgeBases = () => {
    window.open('/opspilot/knowledge', '_blank');
  };

  const filteredKnowledgeBases = knowledgeBases.filter((base) =>
    base.name.toLowerCase().includes(searchTerm)
  );

  return (
    <OperateModal
      title={t('skill.selectKnowledgeBase')}
      visible={visible}
      okText={okText}
      cancelText={cancelText}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
    >
      <Spin spinning={false}>
        {knowledgeBases.length === 0 ? (
          <div className="text-center">
            <p>{t('skill.settings.noKnowledgeBase')}</p>
            <Button type="link" onClick={handleConfigureKnowledgeBases}>
              {t('skill.settings.clickHere')}
            </Button>
            {t('skill.settings.toConfigureKnowledgeBase')}
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <Input className="w-[300px]" placeholder={`${t('common.search')}...`} suffix={<SearchOutlined />} onChange={handleSearch} />
            </div>
            <div className="grid grid-cols-3 gap-4 py-4 max-h-[60vh] overflow-y-auto">
              {filteredKnowledgeBases.map((base, index) => (
                <div
                  key={base.id}
                  className={`flex items-center p-4 border rounded-md cursor-pointer ${tempSelectedKnowledgeBases.includes(base.id) ? styles.selectedKnowledge : ''}`}
                  onClick={() => handleKnowledgeBaseSelect(base.id)}
                >
                  <div className="w-8 flex-shrink-0">
                    <Icon type={getIconTypeByIndex(index)} className="text-2xl" />
                  </div>
                  <Tooltip title={base.name}>
                    <span className="ml-2 inline-block max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
                      {base.name}
                    </span>
                  </Tooltip>
                </div>
              ))}
            </div>
            <div className="pt-4">
              {t('skill.selectedCount')}: {tempSelectedKnowledgeBases.length}
            </div>
          </>
        )}
      </Spin>
    </OperateModal>
  );
};

export default SkillOperateModal;
