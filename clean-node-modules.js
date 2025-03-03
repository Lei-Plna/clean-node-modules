#!/usr/bin/env node

const { globSync } = require('glob');
const { rimraf } = require('rimraf');
const cliProgress = require('cli-progress');
const path = require('path');
const kleur = require('kleur');

const rootDir = process.cwd();

console.log(kleur.green(`当前目录: ${rootDir}`));

const pattern = '**/node_modules';
const ignoredPattern = '**/node_modules/**/node_modules';

console.log(
  kleur.yellow(`正在扫描 ${rootDir} 下所有的 node_modules 文件夹...`)
);

const dirs = globSync(pattern, {
  cwd: rootDir,
  ignore: ignoredPattern,
  nodir: false
}).filter(
  (dir) =>
    // 过滤掉当前目录下的 node_modules 文件夹
    path.resolve(rootDir, dir) !== path.resolve(__dirname, 'node_modules')
);

const total = dirs.length;
if (total === 0) {
  console.log(kleur.green('没有找到 node_modules 文件夹'));
  process.exit(0);
}

console.log(kleur.yellow(`找到 ${total} 个 node_modules 文件夹`));

const progressBar = new cliProgress.SingleBar(
  {
    format: '删除进度 |{bar}| {percentage}% || {value}/{total} 个'
  },
  cliProgress.Presets.shades_classic
);

progressBar.start(total, 0);

let count = 0;
dirs.forEach((dir) => {
  rimraf(path.join(rootDir, dir))
    .then(() => {
      count++;
      progressBar.update(count);
      if (count === total) {
        progressBar.stop();
        console.log('所有 node_modules 文件夹已删除完毕！');
        process.exit(0);
      }
    })
    .catch((error) =>
      console.log(
        kleur.red('删除失败'),
        typeof error.toString === 'function' ? error.toString() : error
      )
    );
});
