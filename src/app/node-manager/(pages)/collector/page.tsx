"use client";
import React, { useEffect, useState, useRef } from "react";
import collectorstyle from "./index.module.scss";
import { Segmented, Menu } from "antd";
import useApiClient from '@/utils/request';
import useApiCollector from "@/app/node-manager/api/collector/index";
import EntityList from "@/components/entity-list/index";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/utils/i18n";
import type { CardItem } from "@/app/node-manager/types/collector";
import CollectorModal from "./collectorModal";
import { ModalRef } from "@/app/node-manager/types";
import { Option } from "@/types";
import { Button } from "antd/lib";

const Collector = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { isLoading } = useApiClient();
  const { getCollectorlist, getControllerList } = useApiCollector();
  const modalRef = useRef<ModalRef>(null);
  const [value, setValue] = useState<string | number>('controller');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [controllerCount, setControllerCount] = useState<number>(0);
  const [collectorCount, setCollectorCount] = useState<number>(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
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
    },
    {
      key: 'delete',
      title: 'delete',
      config: {
        title: 'deleteCollector', type: 'delete'
      }
    }
  ];
  const titleItem = [
    {
      label: `${t('node-manager.collector.controller')}(${controllerCount})`,
      value: 'controller',
    },
    {
      label: `${t('node-manager.collector.collector')}(${collectorCount})`,
      value: 'collector',
    }
  ];

  useEffect(() => {
    if (!isLoading) {
      fetchCollectorlist();
    }
  }, [isLoading])

  useEffect(() => {
    fetchCollectorlist();
  }, [value])

  const navigateToCollectorDetail = (item: CardItem) => {
    router.push(`/node-manager/collector/detail?id=${item.id}`);
  };

  const handleResult = (res: any, selected?: string[]) => {
    const _options: Option[] = [];
    let tempdata = res.map((item: any) => {
      const system = item.node_operating_system || item.os;
      if (system && !_options.find((option) => option.value === system)) {
        _options.push({ value: system, label: system });
      }

      return ({
        id: item.id,
        name: item.name,
        service_type: item.service_type,
        executable_path: item.executable_path,
        execute_parameters: item.execute_parameters,
        description: item.introduction || '--',
        icon: 'caijiqizongshu',
        tagList: [item.node_operating_system || item.os]
      })
    });
    if (selected?.length) {
      tempdata = tempdata.filter((item: any) => {
        return item.tagList.every((tag: string) => selected?.includes(tag));
      });
    }
    setCards(tempdata);
    setOptions(_options);
  }

  const fetchCollectorlist = (search?: string, selected?: string[]) => {
    const params = {
      name: search
    }
    try {
      setLoading(true);
      if (value === 'controller') {
        getControllerList(params).then((res) => {
          setControllerCount(res.length);
          handleResult(res, selected);
          setLoading(false);
        })
      } else if (value === 'collector') {
        getCollectorlist(params).then((res) => {
          setCollectorCount(res.length);
          handleResult(res, selected);
          setLoading(false);
        });
      }
    } catch (error) {
      console.log(error)
    }
  };

  const openModal = (config: any) => {
    modalRef.current?.showModal({
      title: config?.title,
      type: config?.type,
      form: config?.form
    })
  };

  const handleSubmit = () => {
    fetchCollectorlist();
  };

  const menuActions = (data: any) => {
    return (<Menu
      onClick={(e) => e.domEvent.preventDefault()}
    >
      {menuItem.map((item) => {
        if (value === 'controller' && item.key === 'delete') return;
        return (
          <Menu.Item
            key={item.title}
            onClick={() => openModal({ ...item.config, form: data })}>{t(`node-manager.collector.${item.title}`)}
          </Menu.Item>
        )
      }
      )}
    </Menu>)
  };

  const changeFilter = (selected: string[]) => {
    fetchCollectorlist('', selected);
    setSelected(selected);
  };

  const ifOpenAddModal = () => {
    if (value === 'collector') {
      return {
        openModal: () => openModal({ title: 'addCollector', type: 'add', form: {} })
      }
    }
    return {}
  };

  const handleAddCollector = () => {
    openModal({ title: 'addCollector', type: 'add', form: {} })
  }


  return (
    <div className={`${collectorstyle.collection}`}>
      {/* 顶部的提示信息 */}
      <Segmented
        className="custom-tabs"
        options={titleItem}
        defaultValue='controller'
        // value={value}
        onChange={(value) => setValue(value)}
      />
      <Button onClick={handleAddCollector}>添加采集器</Button>
      {/* 卡片的渲染 */}
      <EntityList
        data={cards}
        loading={loading}
        menuActions={(value) => menuActions(value)}
        filter filterOptions={options} changeFilter={changeFilter}
        {...ifOpenAddModal()}
        onSearch={(search: string) => { fetchCollectorlist(search, selected) }}
        onCardClick={(item: CardItem) => navigateToCollectorDetail(item)}></EntityList>
      <CollectorModal ref={modalRef} onSuccess={handleSubmit} />
    </div>
  );
}

export default Collector;
