import i18next, { TFunction } from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';

interface I18nOptions {
  /** 本地化文件目录 */
  directory: string;
  /** 默认语言 */
  defaultLocale?: string;
  /** 是否在运行时写入新增 key */
  updateMissing?: boolean;
}

export class I18n {
  private t!: TFunction;
  private options: Required<I18nOptions>;

  constructor(
    { directory, defaultLocale = 'en', updateMissing = false }: I18nOptions,
    autoInit = true
  ) {
    this.options = { directory, defaultLocale, updateMissing };

    if (autoInit) {
      this.init();
    }
  }

  /**
   * 初始化并加载语言资源
   * @returns {Promise<void>} 可在外部通过 await 确保初始化完成
   */
  public async init(): Promise<void> {
    await i18next.use(Backend).init({
      lng: this.options.defaultLocale,
      fallbackLng: 'en',
      initImmediate: false,
      saveMissing: this.options.updateMissing,
      backend: {
        loadPath: path.join(this.options.directory, '{{lng}}.json')
      },
      interpolation: {
        escapeValue: false
      },
      ns: ['translation'],
      defaultNS: 'translation'
    });
    this.t = i18next.t.bind(i18next);
  }

  /** 切换当前语言 */
  async setLocale(locale: string) {
    if (locale === i18next.language) return;
    await i18next.changeLanguage(locale);
    this.t = i18next.t.bind(i18next);
  }

  public translate(...args: Parameters<TFunction>): ReturnType<TFunction> {
    return this.t(...args);
  }
}
