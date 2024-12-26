import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/icon';
import { Select, Button, DatePicker } from 'antd';
import { CalendarOutlined, ReloadOutlined } from '@ant-design/icons';
import type { SelectProps, TimeRangePickerProps } from 'antd';
import { useFrequencyList, useTimeRangeList } from '@/constants/shared';
import timeSelectorStyle from './index.module.scss';
import dayjs, { Dayjs } from 'dayjs';
import { ListItem, TimeSelectorDefaultValue } from '@/types';
type LabelRender = SelectProps['labelRender'];
const { RangePicker } = DatePicker;

interface TimeSelectorProps {
  showTime?: boolean; //rangePicker组件属性，是否显示时分秒
  format?: string; //rangePicker组件属性，格式化
  onlyRefresh?: boolean; // 仅显示刷新按钮
  onlyTimeSelect?: boolean; // 仅显示时间组合组件
  customFrequencyList?: ListItem[];
  customTimeRangeList?: ListItem[];
  clearable?: boolean; // 组件的值是否能为空
  defaultValue?: TimeSelectorDefaultValue; // defaultValue为时间组合组件的默认值
  onFrequenceChange?: (frequence: number) => void;
  onRefresh?: () => void;
  onChange?: (range: number[]) => void;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  showTime = true,
  format = 'YYYY-MM-DD HH:mm:ss',
  onlyRefresh = false,
  onlyTimeSelect = false,
  clearable = false,
  defaultValue = {
    selectValue: 15, // 显示select组件时，selectValue填customFrequencyList列表项中对应的value，selectValue为select组件的值。
    rangePickerVaule: null, // 如果想显示为rangePicker组件，selectValue设置为0，rangePickerVaule为rangePicker组件的值。
  },
  customFrequencyList,
  customTimeRangeList,
  onFrequenceChange,
  onRefresh,
  onChange,
}) => {
  const TIME_RANGE_LIST = useTimeRangeList();
  const FREQUENCY_LIST = useFrequencyList();
  const [frequency, setFrequency] = useState<number>(0);
  const [rangePickerOpen, setRangePickerOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [selectValue, setSelectValue] = useState<number | null>(
    clearable ? null : 15
  );
  const [rangePickerVaule, setRangePickerVaule] = useState<
    [Dayjs, Dayjs] | null
  >(defaultValue.rangePickerVaule);

  useEffect(() => {
    if (
      JSON.stringify(defaultValue.rangePickerVaule) !==
      JSON.stringify(rangePickerVaule)
    ) {
      setRangePickerVaule(defaultValue.rangePickerVaule);
    }
    if (defaultValue.selectValue !== selectValue) {
      setSelectValue(defaultValue.selectValue);
    }
  }, [defaultValue.rangePickerVaule, defaultValue.selectValue]);

  const labelRender: LabelRender = (props) => {
    const { label } = props;
    return (
      <div className="flex items-center">
        <Icon type="zidongshuaxin" className="mr-[4px] text-[16px]" />
        {label}
      </div>
    );
  };

  const handleFrequencyChange = (val: number) => {
    setFrequency(val);
    onFrequenceChange && onFrequenceChange(val);
  };

  const handleRangePickerOpenChange = (open: boolean) => {
    setRangePickerOpen(open);
  };

  const handleDropdownVisibleChange = (open: boolean) => {
    setDropdownOpen(open);
  };

  const handleIconClick = () => {
    if (selectRef.current) {
      const selectDom = selectRef.current.querySelector('.ant-select-selector');
      if (selectDom) {
        (selectDom as HTMLElement).click();
        const flag =
          !!document.querySelector('.ant-select-dropdown-hidden') ||
          !document.querySelector('.ant-select-dropdown');
        setDropdownOpen(flag);
      }
    }
  };

  const handleRangePickerChange: TimeRangePickerProps['onChange'] = (value) => {
    if (value) {
      setSelectValue(0);
      const rangeTime = value.map((item) => dayjs(item).valueOf());
      onChange && onChange(rangeTime);
      setRangePickerVaule(value as [Dayjs, Dayjs]);
      return;
    }
    const rangeTime = [
      dayjs()
        .subtract(defaultValue.selectValue || 15, 'minute')
        .valueOf(),
      dayjs().valueOf(),
    ];
    setSelectValue(clearable ? null : defaultValue.selectValue || 15);
    setRangePickerVaule(null);
    onChange && onChange(clearable ? [] : rangeTime);
  };

  const handleRangePickerOk: TimeRangePickerProps['onOk'] = (value) => {
    if (value && value.every((item) => !!item)) {
      setSelectValue(0);
    }
  };

  const handleTimeRangeChange = (value: number) => {
    if (value === 0) {
      setRangePickerOpen(true);
      return;
    }
    setRangePickerVaule(null);
    setSelectValue(value);
    const rangeTime = value
      ? [dayjs().subtract(value, 'minute').valueOf(), dayjs().valueOf()]
      : [];
    onChange && onChange(rangeTime);
  };

  return (
    <div className={timeSelectorStyle.timeSelector}>
      {!onlyRefresh && (
        <div className={timeSelectorStyle.customSlect} ref={selectRef}>
          <Select
            allowClear={clearable}
            className={`w-[350px] ${timeSelectorStyle.frequence}`}
            value={selectValue}
            options={customTimeRangeList || TIME_RANGE_LIST}
            open={dropdownOpen}
            onChange={handleTimeRangeChange}
            onDropdownVisibleChange={handleDropdownVisibleChange}
          />
          <RangePicker
            style={{
              zIndex: rangePickerOpen || selectValue == 0 ? 1 : -1,
            }}
            className={`w-[350px] ${timeSelectorStyle.rangePicker}`}
            open={rangePickerOpen}
            showTime={showTime}
            format={format}
            value={rangePickerVaule}
            onOpenChange={handleRangePickerOpenChange}
            onChange={handleRangePickerChange}
            onOk={handleRangePickerOk}
          />
          <CalendarOutlined
            className={timeSelectorStyle.calenIcon}
            onClick={handleIconClick}
          />
        </div>
      )}
      {!onlyTimeSelect && (
        <div className={`${timeSelectorStyle.refreshBox} flex ml-[8px]`}>
          <Button
            className={timeSelectorStyle.refreshBtn}
            icon={<ReloadOutlined />}
            onClick={onRefresh}
          />
          <Select
            className={`w-[100px] ${timeSelectorStyle.frequence}`}
            value={frequency}
            options={customFrequencyList || FREQUENCY_LIST}
            labelRender={labelRender}
            onChange={handleFrequencyChange}
          />
        </div>
      )}
    </div>
  );
};

export default TimeSelector;
