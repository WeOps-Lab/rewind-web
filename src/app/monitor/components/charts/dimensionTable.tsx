import React, { useEffect, useState } from 'react';
import chartStyle from './index.module.scss';
import CustomTable from '@/components/custom-table';
import { calculateMetrics } from '@/app/monitor/utils/common';
import { ListItem } from '@/types';
import { ColumnItem, TableDataItem } from '@/app/monitor/types';

interface DimensionFilterProps {
  data: any[];
  colors: string[];
  details: any;
}

const getChartAreaKeys = (arr: any[]) => {
  const keys = new Set();
  arr.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      if (key.includes('value')) {
        keys.add(key);
      }
    });
  });
  return Array.from(keys);
};

const DimensionFilter: React.FC<DimensionFilterProps> = ({
  data,
  colors,
  details,
}) => {
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const [columns, setColumns] = useState<ColumnItem[]>([]);

  useEffect(() => {
    if (data?.length && colors?.length && details?.value1) {
      try {
        const _tableData = getTableData();
        const _columns = getTableColumns();
        setTableData(_tableData);
        setColumns(_columns);
      } catch {
        setTableData([]);
        setColumns([]);
      }
    }
  }, [data, colors, details]);

  const getTableData = () => {
    const _tableData = getChartAreaKeys(data);
    const _data = _tableData.map((item, index) => {
      const detailItem = details[item as string].reduce(
        (pre: ListItem, cur: ListItem) => {
          const obj: Record<string, any> = {};
          obj[cur.name || ''] = cur.value;
          return Object.assign(pre, obj);
        },
        {}
      );
      return {
        id: item,
        color: colors[index],
        ...calculateMetrics(data, item as string),
        ...detailItem,
      };
    });
    return _data;
  };

  const getTableColumns = () => {
    const _columns: ColumnItem[] = [
      {
        title: 'Avg',
        dataIndex: 'avgValue',
        key: 'avgValue',
        width: 80,
        render: (_, { avgValue }) => <>{(avgValue || 0).toFixed(2)}</>,
      },
      {
        title: 'Min',
        dataIndex: 'minValue',
        key: 'minValue',
        width: 80,
        render: (_, { minValue }) => <>{(minValue || 0).toFixed(2)}</>,
      },
      {
        title: 'Max',
        dataIndex: 'maxValue',
        key: 'maxValue',
        width: 80,
        render: (_, { maxValue }) => <>{(maxValue || 0).toFixed(2)}</>,
      },
      {
        title: 'Sum',
        dataIndex: 'sumValue',
        key: 'sumValue',
        width: 80,
        render: (_, { sumValue }) => <>{(sumValue || 0).toFixed(2)}</>,
      },
      {
        title: 'Last',
        dataIndex: 'latestValue',
        key: 'latestValue',
        width: 80,
        render: (_, { latestValue }) => <>{(latestValue || 0).toFixed(2)}</>,
      },
    ];
    const detailColumns = details.value1.map((item: ListItem) => ({
      title: item.label,
      dataIndex: item.name,
      key: item.name,
      width: 150,
      ellipsis: true,
      fixed: 'left',
      render: (_: any, row: TableDataItem) => (
        <>{row[item.name as string] || '--'}</>
      ),
    }));
    return [
      {
        title: '',
        dataIndex: 'color',
        key: 'color',
        width: 30,
        fixed: 'left',
        render: (_: any, row: TableDataItem) => (
          <div
            className="w-[10px] h-[4px]"
            style={{
              background: row.color,
            }}
          ></div>
        ),
      },
      ...detailColumns,
      ..._columns,
    ];
  };

  return (
    <div className={chartStyle.tableArea}>
      <CustomTable
        className="w-full"
        rowKey="id"
        size="small"
        scroll={{ x: 386, y: 'calc(100vh - 450px)' }}
        dataSource={tableData}
        columns={columns}
      />
    </div>
  );
};

export default DimensionFilter;
