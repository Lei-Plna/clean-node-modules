import os from 'os';

/**
 * Get the recommended number of workers based on the number of CPU cores.
 * @returns  {number} The recommended number of workers.
 */
export function getRecommendedWorkerCount(): number {
  const cores = os.cpus().length;

  const recommended = Math.max(1, Math.floor(cores / 2));
  return recommended;
}
