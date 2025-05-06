import { MultiBar, Presets, SingleBar } from 'cli-progress';
import kleur from 'kleur';
import { TaskManager, TaskState } from './taskManager';

/**
 * 使用 cli-progress 的 MultiBar 渲染多任务进度与总进度
 */
export function startUI(taskManager: TaskManager) {
  console.log(kleur.yellow('📦 开始删除所有 node_modules 文件夹...'));

  // 初始化 MultiBar
  const multiBar = new MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      // barsize: 200,
      // barCompleteChar: kleur.green('█'),
      // barIncompleteChar: kleur.grey('░'),
      format: '{label} |{bar}| {percentage}%'
    },
    Presets.shades_classic
  );

  const bars = new Map<number, SingleBar>();
  let totalBar: SingleBar;

  taskManager.onUpdate((state: TaskState) => {
    // 首次创建总进度条
    if (!totalBar) {
      totalBar = multiBar.create(state.total, state.completed, {
        label: kleur.green('总进度')
      });
    }

    const activeIds = new Set<number>();

    // 创建或更新每个活跃任务的单独进度条
    for (const [id, task] of state.activeTasks) {
      activeIds.add(id);
      if (!bars.has(id)) {
        const label = kleur.cyan(task.sourceName);
        const bar = multiBar.create(100, task.progress, { label });
        bars.set(id, bar);
      } else {
        bars.get(id)!.update(task.progress);
      }
    }

    // 停止并移除已完成的任务进度条
    for (const [id, bar] of Array.from(bars.entries())) {
      if (!activeIds.has(id)) {
        bar.update(100);
        bar.stop();
        bars.delete(id);
      }
    }

    // 更新总进度条
    totalBar.update(state.completed);

    // 全部完成后，停止所有进度条
    if (state.completed === state.total) {
      totalBar.stop();
      multiBar.stop();
    }
  });
}
