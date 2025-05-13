import chalk from 'chalk';
import { TaskManager } from './taskManager';
import { startUI } from './uiRenderer';
import {
  getNodeModulesDirs,
  NodeModulesEntry
} from './utils/getNodeModuleDirs';
import {
  selectDeleteMode,
  selectDirs,
  selectLanguage,
  selectWorkerCount
} from './prompts';
import { initI18n } from './i18n';

async function main() {
  const dirs = getNodeModulesDirs();
  if (dirs.length === 0) {
    console.log(chalk.red('没有找到 node_modules 文件夹'));
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

  console.log('\n' + chalk.green('✅ 所有删除任务已完成'));
}

main().catch((err) => {
  console.error(chalk.red('出错了：'), err);
  process.exit(1);
});
