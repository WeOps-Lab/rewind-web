"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Spin } from 'antd';
import { useAuth } from '@/context/auth';
import { useSearchParams } from 'next/navigation';
// @ts-expect-error react-file-viewer 没有对应的类型声明文件，暂时忽略类型检查
import FileViewer from 'react-file-viewer';
import * as docx from 'docx-preview';
import XLSX from 'xlsx';

const PreviewPage: React.FC = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const authContext = useAuth();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const xlsxContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/opspilot/api/docFile?id=${id}`, {
          headers: { Authorization: `Bearer ${authContext?.token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch file');

        const contentType = response.headers.get('Content-Type');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        setFileUrl(url);
        setFileType(contentType);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchFile();
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [id]);

  useEffect(() => {
    if (fileType?.includes('wordprocessingml.document') && docxContainerRef.current) {
      const renderDocx = async () => {
        const response = await fetch(fileUrl!);
        const arrayBuffer = await (await response.blob()).arrayBuffer();
        docx.renderAsync(arrayBuffer, docxContainerRef.current!);
      };
      renderDocx();
    }
  }, [fileType, fileUrl]);

  useEffect(() => {
    if (fileType?.includes('spreadsheetml.sheet') && fileUrl && xlsxContainerRef.current) {
      const renderExcel = async () => {
        try {
          const response = await fetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });

          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const htmlStr = XLSX.utils.sheet_to_html(worksheet, {
            editable: false,
            header: ''
          });

          if (xlsxContainerRef?.current) {
            xlsxContainerRef.current.innerHTML = htmlStr;
          }

          const table = xlsxContainerRef?.current?.querySelector('table');
          if (table) {
            table.style.borderCollapse = 'collapse';
            table.style.width = '100%';
            const cells = table.querySelectorAll('td, th');
            cells.forEach(cell => {
              if (cell instanceof HTMLElement) {
                cell.style.border = '1px solid #ccc';
                cell.style.padding = '4px 8px';
              }
            });
          }
        } catch (error) {
          console.error('Excel render failed:', error);
        }
      };

      renderExcel();
    }
  }, [fileType, fileUrl]);

  const getFileTypeForViewer = (contentType: string | null) => {
    if (!contentType) return null;
    const types = {
      'pdf': 'pdf',
      'text/plain': 'text',
      'image': 'image',
      'csv': 'csv'
    };
    return Object.entries(types).find(([key]) => contentType.includes(key))?.[1] || null;
  };

  if (loading) return <Spin fullscreen />;

  return (
    <div className="w-full h-full">
      {fileType?.includes('wordprocessingml.document') && (
        <div ref={docxContainerRef} className="w-full h-full" />
      )}

      {fileType?.includes('spreadsheetml.sheet') && (
        <div ref={xlsxContainerRef} className="w-full h-full overflow-auto" />
      )}

      {!fileType?.includes('wordprocessingml.document') && !fileType?.includes('spreadsheetml.sheet') && (
        <FileViewer
          fileType={getFileTypeForViewer(fileType)!}
          filePath={fileUrl!}
          onError={(e: Error) => console.error('FileViewer error:', e)}
        />
      )}
    </div>
  );
};

export default PreviewPage;
