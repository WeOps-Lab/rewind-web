import React from "react";
import { Table, TableProps } from "antd";
import customTableStyle from "./index.module.scss";

interface CustomTableProps<T> extends Omit<TableProps<T>, "bordered" | "size"> {
  bordered?: boolean;
  size?: "large" | "middle" | "small";
}

const CustomTable = <T extends object>({
  bordered = false,
  size = "large",
  ...tableProps
}: CustomTableProps<T>) => {
  return (
    <Table
      className={customTableStyle.customTable}
      bordered={bordered}
      size={size}
      {...tableProps}
    />
  );
};

export default CustomTable;