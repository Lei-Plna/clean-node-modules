import { parentPort } from 'worker_threads';
import { rimraf } from 'rimraf';
import { NodeModulesEntry } from './utils/getNodeModuleDirs';

/**
 * 使用 ease-out 曲线模拟进度，最高模拟到 maxFake
 * @param maxFake 最大模拟进度百分比 (如 95)
 * @param duration 模拟耗时 (ms)
 * @param callback 回调当前进度 0-100
 */
function simulateProgress(
  maxFake: number,
  duration: number,
  callback: (progress: number) => void
) {
  const start = Date.now();
  const timer = setInterval(() => {
    const t = Math.min((Date.now() - start) / duration, 1);
    // ease-out: 1 - (1 - t)^2
    const eased = 1 - Math.pow(1 - t, 2);
    const prog = Math.floor(eased * maxFake);
    callback(prog);
    if (t >= 1) clearInterval(timer);
  }, 100);
}

parentPort?.on('message', ({ directory }: NodeModulesEntry) => {
  try {
    const maxFakeProgress = 99;
    const fakeDuration = 15000; // 15s 模拟假进度

    // 1. 并行启动模拟进度
    simulateProgress(maxFakeProgress, fakeDuration, (progress) => {
      parentPort?.postMessage({ status: 'progress', progress });
    });

    // 2. 立即调用 rimraf 删除
    rimraf(directory)
      .then(() => {
        parentPort?.postMessage({ status: 'done' });
      })
      .catch((err) => {
        parentPort?.postMessage({ status: 'error', error: err.toString() });
      });
  } catch (err: any) {
    parentPort?.postMessage({ status: 'error', error: err.toString() });
  }
});
