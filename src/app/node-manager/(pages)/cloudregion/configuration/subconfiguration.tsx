import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import { Input, Button } from 'antd';
import CustomTable from '@/components/custom-table';
import type { TableColumnsType } from 'antd';
import { TableDataItem } from '@/app/node-manager/types/index';
import { useEffect, useState } from 'react';
import type { ConfigDate } from '@/app/node-manager/types/cloudregion';
const { Search } = Input;
import type { GetProps } from 'antd';
type SearchProps = GetProps<typeof Input.Search>;


const SubConfiguration = ({ cancel, edit, nodeData }: { cancel: any, edit: any, nodeData: ConfigDate }) => {
  const { t } = useTranslation();
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState<string>('');

  const columns: TableColumnsType<TableDataItem> = [
    {
      title: t('common.name'),
      dataIndex: 'name',
      fixed: 'left',
      className: 'text-center',
      align: 'center',
      width: 300,
      render: (_: any, record: any) => {
        return (
          <span>{record.name || '--'}</span>
        )
      }
    },
    {
      title: t('common.actions'),
      dataIndex: 'key',
      fixed: 'right',
      align: 'center',
      width: 180,
      render: (key: any, item: any) => (
        <div className="flex justify-center">
          <Button
            color="primary"
            variant="link"
            onClick={() => {
              edit(key, item);
            }}
          >
            {t('common.edit')}
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setTableLoading(true);
    console.log(nodeData);
    const data = [
      {
        key: '1',
        name: '123',
        collector: 'linux_test',
        operatingsystem: 'linux',
        sidecar: 'Telegraf',
        nodecount: 2,
        configinfo: '',
        nodes: '1.1.1.1',
      },
      {
        key: '2',
        name: '456',
        collector: 'linux_test',
        operatingsystem: 'linux',
        sidecar: 'Telegraf',
        nodecount: 2,
        configinfo: '',
        nodes: '1.1.1.1',
      }
    ];
    setTableData(data);
    setTableLoading(false);
  }, [])

  const goBack = () => {
    cancel();
  };

  const onSearch: SearchProps['onSearch'] = (value) => {
    console.log(searchText);
    setSearchText(value);
  }

  return (
    <>
      <div className='flex justify-between'>
        <div className='flex items-center'>
          <ArrowLeftOutlined
            className="text-[var(--color-primary)] text-[20px] cursor-pointer mr-[10px]"
            onClick={goBack}
          />
          <span>{t('node-manager.cloudregion.Configuration.configurationList')}</span>
        </div>
        <Search
          className='w-[240px]'
          placeholder={t('common.search')}
          enterButton
          onSearch={onSearch} />
      </div>
      <div className='flex-1 relative'>
        <CustomTable
          className='mt-3 absolute w-[100%]'
          columns={columns}
          dataSource={tableData}
          loading={tableLoading}
          scroll={{ y: 'calc(100vh - 400px)', x: 'calc(100vw - 432px)' }}
        />
      </div>
    </>
  )
};

export default SubConfiguration;