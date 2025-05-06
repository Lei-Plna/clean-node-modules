import { Worker } from 'worker_threads';
import { resolve as PathResolve } from 'path';
import { NodeModulesEntry } from './utils/getNodeModuleDirs';

export interface Task {
  sourceName: string;
  directory: string;
  progress: number;
  status: 'running' | 'completed' | 'failed';
}

export interface TaskState {
  activeTasks: [number, Task][];
  completed: number;
  total: number;
}

export class TaskManager {
  private taskDirectoyEntries: NodeModulesEntry[];
  private maxWorkers: number;
  private activeTasks = new Map<number, Task>();
  private completed = 0;
  private total: number;
  private queueIndex = 0;
  private activeCount = 0;
  private listeners = new Set<(state: TaskState) => void>();
  private resolveRun!: () => void;

  constructor(taskDirectotryEntries: NodeModulesEntry[], concurrency = 4) {
    this.taskDirectoyEntries = taskDirectotryEntries;
    this.total = taskDirectotryEntries.length;
    this.maxWorkers = concurrency;
  }

  onUpdate(cb: (state: TaskState) => void) {
    this.listeners.add(cb);
  }

  private emitUpdate() {
    const state: TaskState = {
      activeTasks: Array.from(this.activeTasks.entries()),
      completed: this.completed,
      total: this.total
    };
    this.listeners.forEach((cb) => cb(state));
  }

  async run(): Promise<void> {
    return new Promise((resolve) => {
      this.resolveRun = resolve;
      const initial = Math.min(this.maxWorkers, this.total);
      for (let i = 0; i < initial; i++) {
        this.spawnWorker();
      }
    });
  }

  private spawnWorker() {
    if (this.queueIndex >= this.total) {
      if (this.activeCount === 0) {
        this.resolveRun();
      }
      return;
    }

    const id = this.queueIndex++;
    const dir = this.taskDirectoyEntries[id];

    this.activeTasks.set(id, {
      sourceName: dir.parentName,
      directory: dir.directory,
      progress: 0,
      status: 'running'
    });
    this.activeCount++;
    this.emitUpdate();

    const worker = new Worker(PathResolve(__dirname, './worker.js'));
    worker.postMessage(dir);

    worker.on(
      'message',
      (msg: { status: string; progress?: number; error?: string }) => {
        if (msg.status === 'progress' && typeof msg.progress === 'number') {
          const task = this.activeTasks.get(id);
          if (task) {
            task.progress = msg.progress;
            this.emitUpdate();
          }
        } else if (msg.status === 'done') {
          this.completeTask(id);
          worker.terminate();
        } else if (msg.status === 'error') {
          this.failTask(id);
          worker.terminate();
        }
      }
    );

    worker.on('error', () => {
      this.failTask(id);
    });
  }

  private completeTask(id: number) {
    const task = this.activeTasks.get(id);
    if (task) {
      task.progress = 100;
      task.status = 'completed';
      this.emitUpdate();
    }
    this.cleanupTask(id);
    this.spawnWorker();
  }

  private failTask(id: number) {
    const task = this.activeTasks.get(id);
    if (task) {
      task.status = 'failed';
      this.emitUpdate();
    }
    this.cleanupTask(id);
    this.spawnWorker();
  }

  private cleanupTask(id: number) {
    this.completed++;
    this.activeCount--;
    this.activeTasks.delete(id);
    this.emitUpdate();
  }
}
