import type { MechanicQualification } from '../types';

const qualificationLabels: Record<MechanicQualification, string> = {
  none: '無資格',
  level3: '自動車整備士3級',
  level2: '自動車整備士2級',
  level1: '自動車整備士1級',
  inspector: '自動車検査員',
  body_paint: '板金塗装技能士',
};

export function mapMechanicQualifications(qualifications: MechanicQualification[]): string {
  if (qualifications.length === 0) {
    return '未選択';
  }
  return qualifications.map((q) => qualificationLabels[q]).join('、');
}
