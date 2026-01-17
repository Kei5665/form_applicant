import type { MechanicQualification } from '../types';

const qualificationLabels: Record<MechanicQualification, string> = {
  none: '資格なし',
  level3: '自動車整備士3級',
  level2: '自動車整備士2級',
  level1: '自動車整備士1級',
  inspector: '自動車検査員',
};

export function mapMechanicQualifications(qualification: MechanicQualification | ''): string {
  if (!qualification) {
    return '未選択';
  }
  return qualificationLabels[qualification] ?? '未選択';
}
