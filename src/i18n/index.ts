import { I18n } from './i18n';
import path from 'path';

export async function initI18n(lang: string): Promise<I18n> {
  const i18n = new I18n(
    {
      directory: path.resolve(__dirname, '../locales'),
      defaultLocale: lang,
      updateMissing: true
    },
    false
  );
  await i18n.init();
  return i18n;
}
