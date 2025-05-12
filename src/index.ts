import kleur from 'kleur';
import path from 'path';
import prompts from 'prompts';
import { I18n } from './i18n';
import { TaskManager } from './taskManager';
import { startUI } from './uiRenderer';
import {
  getNodeModulesDirs,
  NodeModulesEntry
} from './utils/getNodeModuleDirs';
import os from 'os';

async function selectLanguage(): Promise<string> {
  const { lang } = await prompts({
    type: 'select',
    name: 'lang',
    message: '请选择语言(Select language)',
    choices: [
      { title: '中文', value: 'zh' },
      { title: 'English', value: 'en' }
    ]
  });
  return lang;
}

async function initI18n(lang: string): Promise<I18n> {
  const i18n = new I18n(
    {
      directory: path.resolve(__dirname, './locales'),
      defaultLocale: lang,
      updateMissing: true
    },
    false
  );
  await i18n.init();
  return i18n;
}

async function selectWorkerCount(i18n: I18n): Promise<number> {
  const cores = os.cpus().length;
  const recommended = Math.max(1, Math.floor(cores / 2));
  const min = 1;
  const { count } = await prompts({
    type: 'text',
    name: 'count',
    message: i18n.translate('enter_worker_count_prompt', {
      min,
      max: cores,
      default: recommended
    }),
    initial: String(recommended),
    validate: (value) => {
      const num = value === '' ? recommended : Number(value);
      if (isNaN(num)) return i18n.translate('invalid_number');
      if (num < min || num > cores)
        return i18n.translate('number_out_of_range', { min, max: cores });
      return true;
    },
    format: (value) => {
      const num = value === '' ? recommended : Number(value);
      return isNaN(num) ? recommended : num;
    }
  });
  return count;
}

async function selectDeleteMode(i18n: I18n): Promise<'all' | 'part'> {
  const { mode } = await prompts({
    type: 'select',
    name: 'mode',
    message: i18n.translate('select_delete_mode'),
    choices: [
      { title: i18n.translate('delete_all'), value: 'all' },
      { title: i18n.translate('delete_on_demand'), value: 'part' }
    ]
  });
  return mode;
}

async function selectDirs(
  i18n: I18n,
  dirs: NodeModulesEntry[]
): Promise<NodeModulesEntry[]> {
  const { dirs: chosen } = await prompts({
    type: 'multiselect',
    name: 'dirs',
    message: i18n.translate('select_dirs_to_delete'),
    choices: dirs.map((dir) => ({
      title: dir.parentName,
      value: dir
    }))
  });
  return chosen;
}

async function main() {
  const dirs = getNodeModulesDirs();
  if (dirs.length === 0) {
    console.log(kleur.red('没有找到 node_modules 文件夹'));
    process.exit(0);
  }

  const lang = await selectLanguage();
  const i18n = await initI18n(lang);

  const count = await selectWorkerCount(i18n);
  const mode = await selectDeleteMode(i18n);

  let executedDirs: NodeModulesEntry[];
  if (mode === 'all') {
    executedDirs = dirs;
  } else {
    executedDirs = await selectDirs(i18n, dirs);
  }

  const manager = new TaskManager(executedDirs, count);
  startUI(manager);
  await manager.run();

  console.log('\n' + kleur.green('✅ 所有删除任务已完成'));
}

main().catch((err) => {
  console.error(kleur.red('出错了：'), err);
  process.exit(1);
});
