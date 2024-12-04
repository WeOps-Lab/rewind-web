import type { Meta, StoryObj } from '@storybook/react';
import WithSideMenuLayout from '@/components/sub-layout';
import { MenuItem } from '@/components/sub-layout/side-menu';

const meta: Meta<typeof WithSideMenuLayout> = {
  component: WithSideMenuLayout,
};

export default meta;

type Story = StoryObj<typeof WithSideMenuLayout>;

const menuItems: MenuItem[] = [
  { label: 'Home', path: '/', icon: 'home' },
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
];

export const Default: Story = {
  args: {
    menuItems,
    intro: <div>Introduction Content</div>,
    showBackButton: true,
    onBackButtonClick: () => alert('Back button clicked'),
    children: <div>Main Content</div>,
    topSection: <div>Top Section Content</div>,
    showProgress: true,
    showSideMenu: true,
  },
};

export const WithoutSideMenu: Story = {
  args: {
    menuItems,
    intro: <div>Introduction Content</div>,
    showBackButton: true,
    onBackButtonClick: () => alert('Back button clicked'),
    children: <div>Main Content</div>,
    topSection: <div>Top Section Content</div>,
    showProgress: true,
    showSideMenu: false,
  },
};