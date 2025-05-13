import chalk from 'chalk';
import logUpdate from 'log-update';
import { TaskManager, TaskState } from './taskManager';

/**
 * 基于 log-update 的 UI 渲染：
 * - 保留总进度文本在底部
 * - 仅展示并发数的活跃任务进度条
 */
export function startUI(taskManager: TaskManager) {
  console.log(chalk.yellow('📦 开始删除所有 node_modules 文件夹...\n'));

  taskManager.onUpdate((state: TaskState) => {
    const lines: string[] = [];

    const barSize = 30;

    for (const [, task] of state.activeTasks) {
      const filled = Math.round((barSize * task.progress) / 100);
      const empty = barSize - filled;
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      lines.push(
        `${chalk.cyan(task.sourceName)} ${bar} ${task.progress.toFixed(0)}%`
      );
    }

    lines.push('');
    // 底部总进度文本
    lines.push(chalk.green(`总进度: ${state.completed}/${state.total} 已完成`));

    logUpdate(lines.join('\n'));
  });
}
