import { useEffect, useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from '@/utils/i18n';
import { Input, Button } from 'antd';
import { TableDataItem } from '@/app/node-manager/types/index';
import CustomTable from '@/components/custom-table';
import useApiCloudRegion from '@/app/node-manager/api/cloudregion';
import type { TableColumnsType } from 'antd';
import type { ConfigDate } from '@/app/node-manager/types/cloudregion';
import type { GetProps } from 'antd';
type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

const SubConfiguration = ({ cancel, edit, nodeData }: { cancel: any, edit: any, nodeData: ConfigDate }) => {
  const { t } = useTranslation();
  const { getchildconfig } = useApiCloudRegion();

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
      render: (_: any, record: any) => (
        <div className="flex justify-center">
          <Button
            color="primary"
            variant="link"
            onClick={() => {
              edit({
                id: record.id,
                name: record.name,
                nodes: nodeData.nodes || '--',
                collector: nodeData.collector,
                configinfo: record.content,
                collect_type: record.collect_type,
                config_type: record.config_type,
                collector_config: record.collector_config
              });
            }}
          >
            {t('common.edit')}
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    console.log(nodeData);
    setTableLoading(true);
    getChildConfigList();
  }, [])

  useEffect(() => {
    getChildConfigList();
  }, [nodeData])

  const getChildConfigList = () => {
    setTableLoading(true);
    getchildconfig(nodeData.key).then((res) => {
      const data = res.map((item: any) => {
        return {
          name: `${nodeData.nodes.length ? nodeData.nodes[0] : '--'}_${nodeData.name}_子配置`,
          ...item
        }
      });
      setTableData(data);
      setTableLoading(false);
    }).catch((e) => {
      console.log(e);
    });
  };

  const goBack = () => {
    cancel();
  };

  const onSearch: SearchProps['onSearch'] = (value) => {
    console.log(searchText);
    setSearchText(value);
  };

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