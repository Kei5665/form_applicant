import type { FormData } from '../types';

const LABEL_MAP: Record<Exclude<FormData['jobTiming'], ''>, string> = {
  asap: '決まれば早く転職したい',
  no_plan: 'すぐに転職する気はない',
};

export function mapJobTimingLabel(jobTiming: FormData['jobTiming']) {
  if (!jobTiming) return '';
  return LABEL_MAP[jobTiming] ?? '';
}


