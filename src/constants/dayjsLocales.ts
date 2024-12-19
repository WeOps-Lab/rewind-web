import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';

export const dayjsLocales = {
  'en': 'en',
  'zh-Hans': 'zh-cn',
};

export type LocaleKey = keyof typeof dayjsLocales;
