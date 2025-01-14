import React, { useRef, useState, useEffect } from 'react';
import { Table, TableProps, Pagination } from 'antd';
import { SettingFilled } from '@ant-design/icons';
import customTableStyle from './index.module.scss';
import FieldSettingModal from './fieldSettingModal';
import { ColumnItem } from '@/types/index';
import { TableCurrentDataSource } from 'antd/es/table/interface';

interface CustomTableProps<T>
  extends Omit<
    TableProps<T>,
    'bordered' | 'size' | 'fieldSetting' | 'onSelectFields'
  > {
  bordered?: boolean;
  fieldSetting?: {
    showSetting: boolean;
    displayFieldKeys: string[];
    choosableFields: ColumnItem[];
  };
  onSelectFields?: (fields: string[]) => void;
}

interface FieldRef {
  showModal: () => void;
}

const CustomTable = <T extends object>({
  bordered = false,
  fieldSetting = {
    showSetting: false,
    displayFieldKeys: [],
    choosableFields: [],
  },
  onSelectFields = () => [],
  loading,
  scroll,
  pagination,
  onChange,
  ...TableProps
}: CustomTableProps<T>) => {
  const fieldRef = useRef<FieldRef>(null);
  const [tableHeight, setTableHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const updateTableHeight = () => {
      if (scroll?.y) {
        setTableHeight(parseCalcY(scroll.y as string));
      }
    };
    updateTableHeight();
    window.addEventListener('resize', updateTableHeight);
    return () => {
      window.removeEventListener('resize', updateTableHeight);
    };
  }, [scroll]);

  const parseCalcY = (value: string): number => {
    console.log('parseCalcY');
    if (!pagination) return 0;
    const vh = window.innerHeight;
    let total = 0;

    // 分析表达式的正则表达式以捕获运算符、数字和单位
    const calcRegex = /([-+]?)\s*(\d*\.?\d+)(vh|px)/g;
    let match: RegExpExecArray | null;

    while ((match = calcRegex.exec(value)) !== null) {
      const sign = match[1] || '+';
      const numValue = parseFloat(match[2]);
      const unit = match[3];

      let result = 0;
      if (unit === 'vh') {
        result = (numValue / 100) * vh;
      } else if (unit === 'px') {
        result = numValue;
      }

      if (sign === '-') {
        total -= result;
      } else {
        total += result;
      }
    }

    const PAGE_HEIGHT = 50;
    const TABLE_HEADER_HEIGHT = 55;
    return total + PAGE_HEIGHT + TABLE_HEADER_HEIGHT;
  };

  const showFeildSetting = () => {
    fieldRef.current?.showModal();
  };

  const handlePageChange = (current: number, pageSize: number) => {
    if (pagination && pagination.onChange) {
      pagination.onChange(current, pageSize);
    }
    onChange &&
      onChange(
        { current, pageSize },
        {}, // filters
        [], // sorter
        {} as TableCurrentDataSource<T> // extra
      );
  };

  return (
    <div
      className={`relative ${customTableStyle.customTable}`}
      style={{ height: tableHeight ? `${tableHeight}px` : 'auto' }}>
      <Table
        bordered={bordered}
        scroll={scroll}
        loading={loading}
        pagination={false}
        {...TableProps}
      />
      {pagination && !loading && !!pagination.total && (<div className="absolute right-0 bottom-0 flex justify-end">
        <Pagination
          total={pagination?.total}
          showSizeChanger
          current={pagination?.current}
          pageSize={pagination?.pageSize}
          onChange={handlePageChange}
        />
      </div>)}
      {fieldSetting.showSetting ? (
        <SettingFilled
          className={customTableStyle.setting}
          onClick={showFeildSetting}
        />
      ) : null}
      <FieldSettingModal
        ref={fieldRef}
        choosableFields={fieldSetting.choosableFields || []}
        displayFieldKeys={fieldSetting.displayFieldKeys}
        onConfirm={onSelectFields}
      />
    </div>
  );
};

export default CustomTable;
