export interface ChannelTemplate {
  key: string | number;
  id: string | number;
  name: string;
  app: string;
  title: string;
  context: string;
  channelObj: number;
}

export type ChannelType = 'email' | 'enterprise_wechat';

export interface Channel {
  id: string;
  name: string;
  description: string;
  channel_type: ChannelType;
  tag: string[];
  icon: string;
}

export interface ChannelTypeMap {
  email: {
    title: string;
    desc: string;
    icon: string
  };
  enterprise_wechat: {
    title: string;
    desc: string;
    icon: string
  };
}

export interface ChannelTemplate {
  key: string | number,
  id: string | number,
  name: string,
  app: string,
  title: string,
  context: string,
  channelObj: number,
}
