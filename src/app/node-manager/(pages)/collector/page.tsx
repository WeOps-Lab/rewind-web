"use client";
import React, { useEffect, useState, useRef } from "react";
import collectorstyle from "./index.module.scss";
import { Segmented, Menu } from "antd";
import useApiClient from '@/utils/request';
import useApiCollector from "@/app/node-manager/api/collector/index";
import EntityList from "@/components/entity-list/index";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/utils/i18n";
import type { collectorItem } from "@/app/node-manager/types/collector";
import CollectorModal from "./collectorModal";
import { ModalRef } from "@/app/node-manager/types";
import { Option } from "@/types";

const Collector = () => {

  const router = useRouter();
  const { t } = useTranslation();
  const { isLoading } = useApiClient();
  const { getCollectorlist } = useApiCollector();
  const modalRef = useRef<ModalRef>(null);
  const [value, setValue] = useState<string | number>();
  const [cards, setCards] = useState<collectorItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const menuItem = [
    {
      key: 'edit',
      title: 'edit',
      config: {
        title: 'editCollector', type: 'edit'
      }
    },
    {
      key: 'upload',
      title: 'uploadPackge',
      config: {
        title: 'uploadPackge', type: 'upload'
      }
    }
  ];
  const titleItem = [
    {
      label: `${t('node-manager.cloudregion.node.controller')}(${cards.length})`,
      value: 'controller',
    },
    {
      label: `${t('node-manager.cloudregion.node.collector')}(${cards.length})`,
      value: 'collector',
    }
  ]

  useEffect(() => {
    if (!isLoading) {
      fetchCollectorlist();
    }
  }, [isLoading])

  const navigateToCollectorDetail = (item: collectorItem) => {
    router.push(`/node-manager/collector/detail?id=${item.id}`);
  };

  const fetchCollectorlist = (value?: string, selected?: string[]) => {
    getCollectorlist({ search: value }).then((res) => {
      const _options: Option[] = []
      let tempdata = res.map((item: any) => {
        _options.push({ value: item.node_operating_system, label: item.node_operating_system });
        return ({
          id: item.id,
          name: item.name,
          description: item.introduction,
          icon: 'caijiqizongshu',
          tagList: [item.node_operating_system]
        })
      });
      if(selected?.length) {
        tempdata = tempdata.filter((item: any) => {
          return item.tagList.every((tag: string) => selected?.includes(tag));
        });
      }
      console.log(tempdata);
      setCards(tempdata);
      setValue(`${t('node-manager.cloudregion.controller')}(${tempdata.length})`);
      setOptions(_options);
    })
  };

  const openModal = (config: any) => {
    modalRef.current?.showModal({
      title: config?.title,
      type: config?.type,
      form: config?.form
    })
  };

  const handleSubmit = () => {
    console.log('success');
  }

  const menuActions = (value: any) => {
    return (<Menu>
      {menuItem.map((item) =>
        <Menu.Item
          key={item.title}
          onClick={() => openModal({ ...item.config, form: value })}>{t(`node-manager.cloudregion.Configuration.${item.title}`)}
        </Menu.Item>
      )}
    </Menu>)
  };

  const changeFilter = (selected: string[]) => {
    fetchCollectorlist('', selected);
    setSelected(selected);
  };

  const ifOpenAddModal = () => {
    if(value === 'collector') {
      return {
        openModal: () => openModal({title: 'add', type: 'add'})
      }
    }
    return {}
  }


  return (
    <div className={`${collectorstyle.collection}`}>
      {/* 顶部的提示信息 */}
      <Segmented
        className="custom-tabs"
        options={titleItem}
        value={value}
        onChange={setValue}
      />
      {/* 卡片的渲染 */}
      <EntityList
        data={cards}
        loading={false}
        menuActions={(value) => menuActions(value)}
        filter filterOptions={options} changeFilter={changeFilter}
        {...ifOpenAddModal()}
        onSearch={(value: string) => { fetchCollectorlist(value, selected) }}
        onCardClick={(item: collectorItem) => navigateToCollectorDetail(item)}></EntityList>
      <CollectorModal ref={modalRef} handleSubmit={handleSubmit}  />
    </div>
  );
}

export default Collector;
