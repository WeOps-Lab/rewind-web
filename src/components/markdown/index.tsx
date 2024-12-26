'use client';

import React, { useEffect, useState } from 'react';
import { Spin, message } from 'antd';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';
import 'github-markdown-css/github-markdown.css';
import styles from './index.module.scss';

interface MarkdownRendererProps {
  filePath: string;
  fileName: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ filePath, fileName }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [content, setContent] = useState<string>('');

  const locale = typeof window !== 'undefined' && localStorage.getItem('locale');

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const response = await fetch(`/api/markdown?filePath=${filePath}${filePath.endsWith('/') ? '' : '/'}${locale === 'en' ? 'en' : 'zh'}/${fileName}.md`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const processedContent = await remark().use(gfm).use(html).process(data.content);
        setContent(processedContent.toString());
      } catch (error) {
        message.error('Failed to load markdown content.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkdown();
  }, [filePath]);

  return (
    <Spin spinning={loading}>
      <div className={`markdown-body ${styles.markdown}`} dangerouslySetInnerHTML={{ __html: content }} />
    </Spin>
  );
};

export default MarkdownRenderer;
