import { globSync } from 'glob';
import { resolve as pathResolve, dirname, basename } from 'path';

export interface NodeModulesEntry {
  /**
   * 绝对路径，指向 node_modules 目录
   */
  directory: string;
  /**
   * 上层文件夹名称，即 node_modules 所在的包/项目文件夹名称
   */
  parentName: string;
}

/**
 * 扫描当前工作目录下所有 node_modules 目录，
 * 同时排除嵌套的 node_modules，
 * 并返回其绝对路径及所在父文件夹名称
 */
export function getNodeModulesDirs(): NodeModulesEntry[] {
  const rootDir = process.cwd();
  const pattern = '**/node_modules';
  const ignoredPattern = '**/node_modules/**/node_modules';

  const dirs = globSync(pattern, {
    cwd: rootDir,
    ignore: ignoredPattern,
    nodir: false
  });

  return dirs.map((relativePath) => {
    const absDir = pathResolve(rootDir, relativePath);
    // 父目录名称
    const parentDir = dirname(absDir);
    const parentName = basename(parentDir);
    return {
      directory: absDir,
      parentName
    };
  });
}
