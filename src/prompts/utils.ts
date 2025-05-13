import chalk from 'chalk';
import prompts, { PromptObject } from 'prompts';

function cleanupAndExit(code = 1): never {
  process.exit(code);
}

export async function safePrompt<T>(
  question: PromptObject | PromptObject[]
): Promise<T> {
  return prompts(question, {
    onCancel: () => cleanupAndExit(130)
  }) as Promise<T>;
}

const COLOR_FUNCS = [
  // 经典高对比主色
  chalk.red, // 红
  chalk.green, // 绿
  chalk.yellow, // 黄
  chalk.blue, // 蓝
  chalk.magenta, // 品红
  chalk.cyan, // 青

  // Material Design 中性＋亮色（HEX）
  chalk.hex('#0288D1'), // Light Blue 600
  chalk.hex('#00796B'), // Teal 700
  chalk.hex('#F57C00'), // Orange 600
  chalk.hex('#C2185B'), // Pink 700
  chalk.hex('#455A64'), // Blue Grey 700
  chalk.hex('#6A1B9A'), // Purple 700
  chalk.hex('#795548'), // Brown 600
  chalk.hex('#546E7A'), // Blue Grey 600
  chalk.hex('#E64A19') // Deep Orange 600
];

export function randomColor() {
  const idx = Math.floor(Math.random() * COLOR_FUNCS.length);
  return COLOR_FUNCS[idx];
}

export function withRandomColor(text: string) {
  return randomColor()(text);
}
