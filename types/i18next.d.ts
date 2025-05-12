import 'i18next';
import zh from '../src/locales/zh.json';
import en from '../src/locales/en.json';

type TranslationKeys = typeof en & typeof zh;

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';

    resources: {
      translation: TranslationKeys;
    };
  }
}
