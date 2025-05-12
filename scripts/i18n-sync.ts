import fs from 'fs/promises';
import kleur from 'kleur';
import path from 'path';

const ROOT = process.cwd();
const SOURCE_FILE = path.join(ROOT, 'src', 'messages.json');
const LOCALES_DIR = path.join(ROOT, 'src', 'locales');

/**
 * 消息定义示例 (messages.json):
 * {
 *   "greeting": { "zh": "你好", "en": "Hello" },
 *   "farewell": { "zh": "再见", "en": "Goodbye" }
 * }
 */
interface Messages {
  [key: string]: Record<string, string>;
}

/**
 * 从 JSON 文件中读取并解析消息映射
 */
async function loadMessages(): Promise<Messages> {
  const raw = await fs.readFile(SOURCE_FILE, 'utf-8');
  return JSON.parse(raw) as Messages;
}

async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * 将 messages.json 拆分并写入 locales 目录下的各语种 JSON 文件
 */
async function syncLocales() {
  const messages = await loadMessages();
  const locales = new Set<string>();

  // 收集所有语种
  Object.values(messages).forEach((item) =>
    Object.keys(item).forEach((lang) => locales.add(lang))
  );
  await ensureDir(LOCALES_DIR);

  for (const locale of locales) {
    const localeFile = path.join(LOCALES_DIR, `${locale}.json`);
    let existing: Record<string, string> = {};
    try {
      const raw = await fs.readFile(localeFile, 'utf-8');
      existing = JSON.parse(raw);
    } catch {
      // 文件不存在或解析失败，忽略并新建
      console.warn(kleur.red(`⚠️ 读取 ${localeFile} 失败，创建新文件`));
    }

    // 合并并保持已有值
    const output: Record<string, string> = { ...existing };
    for (const [key, map] of Object.entries(messages)) {
      if (map[locale] != null) {
        output[key] = map[locale];
      }
    }

    // 按 key 排序后写入
    const sorted = Object.fromEntries(
      Object.entries(output).sort((a, b) => a[0].localeCompare(b[0]))
    );
    await fs.writeFile(
      localeFile,
      JSON.stringify(sorted, null, 2) + '\n',
      'utf-8'
    );
    console.log(kleur.green(`✅ 写入 ${localeFile}`));
  }
}

syncLocales().catch((err) => {
  console.error(err);
  process.exit(1);
});
