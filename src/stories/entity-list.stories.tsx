import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { Menu } from 'antd';
import EntityList from '@/components/entity-list';

// 类型声明
interface ExampleItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  avatar?: string;
  tag?: string[];
}

// 创建模板函数
const Template: StoryFn<any> = (args) => <EntityList {...args} />;

export default {
  title: 'Components/EntityList',
  component: EntityList,
} as Meta;

// 示例数据
const exampleData: ExampleItem[] = [
  {
    id: '1',
    name: 'Entity One',
    description: 'Description of entity one.',
    icon: 'icon1',
    tag: ['tag1', 'tag2'],
  },
  {
    id: '2',
    name: 'Entity Two',
    description: 'Description of entity two.',
    icon: 'icon2',
    tag: ['tag3'],
  },
  {
    id: '3',
    name: 'Entity Three',
    description: 'Description of entity three.',
    icon: 'icon3',
    tag: ['tag4', 'tag5'],
  },
];

// 默认情境
export const Default = Template.bind({});
Default.args = {
  data: exampleData,
  loading: false,
  fetchItems: () => action('fetchItems')(),
};

// 带有菜单操作的情境
export const WithMenuActions = Template.bind({});
WithMenuActions.args = {
  data: exampleData,
  loading: false,
  fetchItems: () => action('fetchItems')(),
  menuActions: (item: ExampleItem) => (
    <Menu>
      <Menu.Item key="edit" onClick={() => action('edit')(item)}>Edit</Menu.Item>
      <Menu.Item key="delete" onClick={() => action('delete')(item)}>Delete</Menu.Item>
    </Menu>
  ),
  onCardClick: (item: ExampleItem) => action('cardClick')(item),
};

// 带有单个按钮操作的情境
export const WithSingleAction = Template.bind({});
WithSingleAction.args = {
  data: exampleData,
  loading: false,
  fetchItems: () => action('fetchItems')(),
  singleAction: (item: ExampleItem) => ({
    text: 'Action Button',
    onClick: () => action('buttonClick')(item),
  }),
  onCardClick: (item: ExampleItem) => action('cardClick')(item),
};

// 同时带有菜单操作和单个按钮操作的情境
export const WithBothActions = Template.bind({});
WithBothActions.args = {
  data: exampleData,
  loading: false,
  fetchItems: () => action('fetchItems')(),
  menuActions: (item: ExampleItem) => (
    <Menu>
      <Menu.Item key="edit" onClick={() => action('edit')(item)}>Edit</Menu.Item>
      <Menu.Item key="delete" onClick={() => action('delete')(item)}>Delete</Menu.Item>
    </Menu>
  ),
  singleAction: (item: ExampleItem) => ({
    text: 'Action Button',
    onClick: () => action('buttonClick')(item),
  }),
  onCardClick: (item: ExampleItem) => action('cardClick')(item),
};

// 没有数据的情境
export const Empty = Template.bind({});
Empty.args = {
  data: [],
  loading: false,
  fetchItems: () => action('fetchItems')(),
};
