import type { DesiredIncomeOption } from '../types';

const LABEL_MAP: Record<DesiredIncomeOption, string> = {
  '300': '300万円',
  '400': '400万円',
  '500': '500万円',
  '600': '600万円',
};

export function mapDesiredIncomeLabel(value: DesiredIncomeOption | ''): string {
  if (!value) return '未選択';
  return LABEL_MAP[value] ?? '未選択';
}
