import React from 'react';
import { Checkbox, TableProps } from 'antd';
import CustomTable from '@/components/custom-table';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

// Translate Function
type TranslateFunction = (key: string) => string;

interface Permission {
  key: string;
  menu: string;
  operations?: string[];
  children?: Permission[];
}

interface PermissionTableProps {
  permissionsData: Permission[];
  loading: boolean;
  permissionsCheckedKeys: Record<string, string[]>;
  setPermissionsCheckedKeys: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  t: TranslateFunction;
}

const PermissionTable: React.FC<PermissionTableProps> = ({
  permissionsData,
  loading,
  permissionsCheckedKeys,
  setPermissionsCheckedKeys,
  t
}) => {

  const getAllOperationKeys = (record: Permission): string[] => {
    let keys: string[] = [];
    if (record.operations) {
      keys = keys.concat(record.operations);
    }
    if (record.children) {
      record.children.forEach((child) => {
        keys = keys.concat(getAllOperationKeys(child));
      });
    }
    return keys;
  };

  const updateCheckedKeys = (record: Permission, checked: boolean, prevState: Record<string, string[]>): Record<string, string[]> => {
    const newCheckedKeys = { ...prevState };

    const handleOperations = (key: string, operations?: string[], isChecked?: boolean) => {
      if (!operations) return;
      if (isChecked) {
        newCheckedKeys[key] = [...new Set([...(newCheckedKeys[key] || []), ...operations])];
      } else {
        newCheckedKeys[key] = [];
      }
    };

    const handleChildren = (nodes: Permission[], isChecked: boolean) => {
      nodes.forEach((node) => {
        handleOperations(node.key, node.operations, isChecked);
        if (node.children) {
          handleChildren(node.children, isChecked);
        }
      });
    };
    handleChildren([record], checked);

    return newCheckedKeys;
  };

  const handleMenuCheckboxChange = (record: Permission, checked: boolean) => {
    setPermissionsCheckedKeys((prevState) => {
      const newCheckedKeys = updateCheckedKeys(record, checked, prevState);
      return newCheckedKeys;
    });
  };

  const handleOperationCheckboxChange = (menuKey: string, operation: string, checked: boolean) => {
    setPermissionsCheckedKeys((prevState) => {
      let newCheckedKeys = { ...prevState };

      if (checked) {
        newCheckedKeys = {
          ...newCheckedKeys,
          [menuKey]: [...(newCheckedKeys[menuKey] || []), operation],
        };

        if (operation !== 'View' && !newCheckedKeys[menuKey].includes('View')) {
          newCheckedKeys[menuKey].push('View');
        }
      } else {
        newCheckedKeys[menuKey] = (newCheckedKeys[menuKey] || []).filter(op => op !== operation);

        if (operation === 'View') {
          newCheckedKeys[menuKey] = [];
        }
      }

      return newCheckedKeys;
    });
  };

  const isIndeterminate = (record: Permission): boolean => {
    const allKeys = getAllOperationKeys(record);
    const selectedKeys: string[] = [];
    if (permissionsCheckedKeys[record.key]) {
      selectedKeys.push(...permissionsCheckedKeys[record.key]);
    }
    record.children?.forEach(child => {
      if (permissionsCheckedKeys[child.key]) {
        selectedKeys.push(...permissionsCheckedKeys[child.key]);
      }
    });
    return selectedKeys.length > 0 && selectedKeys.length < allKeys.length;
  };

  const isChecked = (record: Permission): boolean => {
    const allKeys = getAllOperationKeys(record);
    const selectedKeys: string[] = [];
    if (permissionsCheckedKeys[record.key]) {
      selectedKeys.push(...permissionsCheckedKeys[record.key]);
    }
    record.children?.forEach((child) => {
      if (permissionsCheckedKeys[child.key]) {
        selectedKeys.push(...permissionsCheckedKeys[child.key]);
      }
    });
    return selectedKeys.length === allKeys.length;
  };

  const columns: TableProps<Permission>['columns'] = [
    {
      title: t('system.role.permission.menu'),
      dataIndex: 'menu',
      key: 'menu',
      render: (text: string, record: Permission) => (
        <Checkbox
          indeterminate={isIndeterminate(record)}
          onChange={(e: CheckboxChangeEvent) => handleMenuCheckboxChange(record, e.target.checked)}
          checked={isChecked(record)}
        >
          {text}
        </Checkbox>
      ),
    },
    {
      title: t('system.role.permission.operation'),
      dataIndex: 'operations',
      key: 'operations',
      render: (operations: string[], record: Permission) => (
        <div className="flex space-x-2">
          {(operations||[]).map((operation: string) => (
            <Checkbox
              key={operation}
              onChange={(e: CheckboxChangeEvent) => handleOperationCheckboxChange(record.key, operation, e.target.checked)}
              checked={permissionsCheckedKeys[record.key]?.includes(operation) || false}
            >
              {operation}
            </Checkbox>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <CustomTable
        loading={loading}
        columns={columns}
        dataSource={permissionsData}
        expandable={{ childrenColumnName: 'children' }}
        pagination={false}
      />
    </div>
  );
};

export default PermissionTable;
