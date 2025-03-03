export interface ChannelTemplate {
  key: string | number;
  id: string | number;
  name: string;
  app: string;
  title: string;
  context: string;
  channelObj: number;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  channel_type: 'email' | 'weCom';
  tag: string[];
  icon: string;
}
