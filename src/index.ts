import kleur from 'kleur';
import { TaskManager } from './taskManager';
import { startUI } from './uiRenderer';
import { getNodeModulesDirs } from './utils/getNodeModuleDirs';
import { getRecommendedWorkerCount } from './utils/getWorkerCount';
import prompts from 'prompts';
import { I18n } from './i18n';
import path from 'path';

async function main() {
  const dirs = getNodeModulesDirs();
  if (dirs.length === 0) {
    console.log(kleur.red('没有找到 node_modules 文件夹'));
    process.exit(0);
  }

  const { lang } = await prompts({
    type: 'select',
    name: 'lang',
    message: '请选择语言(Select language)',
    choices: [
      { title: '中文', value: 'zh' },
      { title: 'English', value: 'en' }
    ]
  });

  console.log(kleur.yellow(`getResult: ${lang}`));

  const i18n = new I18n(
    {
      directory: path.resolve(__dirname, './locales'),
      defaultLocale: lang,
      updateMissing: true
    },
    false
  );

  await i18n.init();

  const recommended = getRecommendedWorkerCount();

  console.log(kleur.green(`推荐的线程为: ${recommended} 条..`));

  // 并发数可按需配置
  const manager = new TaskManager(dirs, recommended);

  // 先绑定 UI，再启动任务
  startUI(manager);

  await manager.run();

  // 任务全部完成后退出
  console.log('\n' + '✅ 所有删除任务已完成'.padStart(10));
}

main();
