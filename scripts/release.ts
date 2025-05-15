#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import chalk from 'chalk';

function run(cmd: string): string {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim();
}

function main() {
  const [, , description] = process.argv;
  if (!description) {
    console.error(chalk.red('Usage: npm run release -- <description>'));
    process.exit(1);
  }

  try {
    // 1. npm version patch，拿到新版本 tag（例如 "v1.2.3"）
    const newTag = run('npm version patch');
    console.log(chalk.green(`✔ bumped version: ${newTag}`));

    // 2. 基于 description 生成复合 tag
    const compositeTag = `${newTag}-${description}`;
    execSync(`git tag -a ${compositeTag} -m "${compositeTag}"`, {
      stdio: 'inherit'
    });
    console.log(chalk.green(`✔ created git tag: ${compositeTag}`));

    // 3. 推送这个 tag 到 origin
    execSync(`git push origin ${compositeTag}`, { stdio: 'inherit' });
    console.log(chalk.green(`✔ pushed tag: ${compositeTag}`));
  } catch (err: any) {
    console.error(chalk.red(`✖ ${err.message}`));
    process.exit(1);
  }
}

main();
