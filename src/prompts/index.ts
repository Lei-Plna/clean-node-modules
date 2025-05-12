import prompts, { PromptObject } from 'prompts';
import { I18n } from '../i18n/i18n';
import { NodeModulesEntry } from '../utils/getNodeModuleDirs';
import os from 'os';

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

export async function selectLanguage(): Promise<string> {
  const { lang } = await safePrompt<{ lang: string }>({
    type: 'select',
    name: 'lang',
    message: '请选择语言(Select Language)',
    choices: [
      { title: '中文', value: 'zh' },
      { title: 'English', value: 'en' }
    ]
  });
  return lang;
}

export async function selectWorkerCount(i18n: I18n): Promise<number> {
  const cores = os.cpus().length;
  const recommended = Math.max(1, Math.floor(cores / 2));
  const min = 1;
  const { count } = await safePrompt<{ count: number }>({
    type: 'text',
    name: 'count',
    message: i18n.translate('enter_worker_count_prompt', {
      min,
      max: cores,
      default: recommended
    }),
    initial: String(recommended),
    validate: (value) => {
      const num = value === '' ? recommended : Number(value);
      if (isNaN(num)) return i18n.translate('invalid_number');
      if (num < min || num > cores)
        return i18n.translate('number_out_of_range', { min, max: cores });
      return true;
    },
    format: (value) => {
      const num = value === '' ? recommended : Number(value);
      return isNaN(num) ? recommended : num;
    }
  });
  return count;
}

export async function selectDeleteMode(i18n: I18n): Promise<'all' | 'part'> {
  const { mode } = await safePrompt<{ mode: 'all' | 'part' }>({
    type: 'select',
    name: 'mode',
    message: i18n.translate('select_delete_mode'),
    choices: [
      { title: i18n.translate('delete_all'), value: 'all' },
      { title: i18n.translate('delete_on_demand'), value: 'part' }
    ]
  });
  return mode;
}

export async function selectDirs(
  i18n: I18n,
  dirs: NodeModulesEntry[]
): Promise<NodeModulesEntry[]> {
  const { dirs: chosen } = await safePrompt<{ dirs: NodeModulesEntry[] }>({
    type: 'multiselect',
    name: 'dirs',
    message: i18n.translate('select_dirs_to_delete'),
    choices: dirs.map((dir) => ({
      title: dir.parentName,
      value: dir
    }))
  });
  return chosen;
}
