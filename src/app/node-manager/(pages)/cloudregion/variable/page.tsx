"use client";
import React, { useEffect, useRef, useState } from "react";
import { Button, Input, message } from "antd";
import CustomTable from '@/components/custom-table/index';
import type { TableProps } from "antd";
import { useTranslation } from "@/utils/i18n";
import VariableModal from "./variableModal";
import { ModalRef } from "@/app/node-manager/types/index";
import { useVarColumns } from "./useVarColumns";
import type { GetProps } from 'antd';
import type { TableDataItem } from "@/app/node-manager/types/index";
import Mainlayout from '../mainlayout/layout'
import { PlusOutlined } from "@ant-design/icons";
import useApiCloudRegion from "@/app/node-manager/api/cloudregion";
import useApiClient from "@/utils/request";
type SearchProps = GetProps<typeof Input.Search>;
const { Search } = Input;

const Variable = () => {
  const { getvariablelist, deletevariable } = useApiCloudRegion();
  const { isLoading } = useApiClient();
  const variableRef = useRef<ModalRef>(null);
  const { t } = useTranslation();
  const [data, setData] = useState<TableDataItem[]>([]);

  useEffect(() => {
    if (!isLoading) {
      return;
    }
    getVariablelist();
  }, [])

  //根据传入的值打开对应的用户弹窗（添加用户弹窗和编辑用户的弹窗）
  const openUerModal = (type: string, form: TableDataItem) => {
    variableRef.current?.showModal({
      type,
      form,
    });
  };
  //遍历数据，取出要回显的数据
  const getFormDataById = (key: string) => {
    const formData = data.find((item) => item.key === key);
    if (!formData) {
      throw new Error(`Form data not found for key: ${key}`);
    }
    return formData;
  };
  //删除的确定的弹窗
  const delconfirm = (key: string) => {
    deletevariable(key).then((res) => {
      message.success(res.message);
    }).catch((error) => {
      message.error(error.message);
    }).finally(() => {
      getVariablelist();
    });
  };

  const delcancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log(e);
    message.error('Click on No');
  };
  const columns = useVarColumns({
    openUerModal,
    getFormDataById,
    delconfirm,
    delcancel
  })

  //处理多选触发的事件逻辑
  const rowSelection: TableProps<TableDataItem>["rowSelection"] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: TableDataItem[]) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows
      );
    },
  };

  //添加和编辑成功后，重新获取表格数据
  const onsuccessvariablemodal = () => {
    getVariablelist();
  };

  //搜索框的事件
  const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
    const id = 1;
    getvariablelist(id, value).then((res) => {
      const tempdata = res.map((item: any) => {
        return {
          key: item.id,
          name: item.key,
          value: item.value,
          description: item.description,
        }
      })
      setData(tempdata);
    })
    console.log(value, _e, info);
  };

  //获取表格数据
  const getVariablelist = () => {
    const id = 1;
    getvariablelist(id).then((res) => {
      const tempdata = res.map((item: any) => {
        return {
          key: item.id,
          name: item.key,
          value: item.value,
          description: item.description,
        }
      })
      setData(tempdata);
    });
  }

  return (
    <Mainlayout>
      <div className="w-full h-full">
        <div className="flex justify-end mb-4">
          <Search className="w-64 mr-[8px]" placeholder="input search text" enterButton onSearch={onSearch} />
          <Button
            type="primary"
            onClick={() => {
              openUerModal("add", {
                name: "",
                key: "",
                value: "",
                description: "",
              });
            }}
          >
            <PlusOutlined />{t("common.add")}
          </Button>

        </div>
        <div className="overflow-x-auto">
          <CustomTable
            scroll={{ y: "calc(100vh - 400px)", x: "max-content" }}
            columns={columns}
            dataSource={data}
            rowSelection={rowSelection}
          />
        </div>
        <VariableModal
          ref={variableRef}
          onSuccess={onsuccessvariablemodal}
        ></VariableModal>
      </div>
    </Mainlayout>
  );
}
export default Variable;
