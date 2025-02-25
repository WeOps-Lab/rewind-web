import React from 'react';
import ReactAce from 'react-ace';
import { Button, Tooltip, message } from 'antd';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
import { CopyOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';

interface CodeEditorProps {
  value?: string; // 编辑器的内容
  className?: string;
  showCopy?: boolean; // 是否显示复制按钮
  [key: string]: any; // 其余 ReactAce 的属性
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value = '',
  showCopy = false,
  className = '',
  ...restProps
}) => {
  const { t } = useTranslation();
  // 复制内容的方法
  const handleCopy = async () => {
    try {
      navigator.clipboard?.writeText(value);
      message.success(t('common.successfulCopied'));
    } catch (error: any) {
      message.error(error + '');
    }
  };

  return (
    <div className={className}>
      {showCopy && (
        <div className="bg-[#272822] flex justify-end pr-[4px]">
          <Tooltip title={t('common.copy')}>
            <Button
              size="small"
              type="link"
              icon={<CopyOutlined />}
              onClick={handleCopy}
            ></Button>
          </Tooltip>
        </div>
      )}
      <ReactAce
        style={{
          marginTop: 0,
        }}
        value={value}
        setOptions={{
          showPrintMargin: false, // 禁用打印边界
        }}
        {...restProps}
      />
    </div>
  );
};

export default CodeEditor;
