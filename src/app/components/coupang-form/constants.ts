import type { JobPosition, ApplicationReason, PastExperience } from './types';

export const JOB_POSITION_LABELS: Record<JobPosition, string> = {
  field_sales_tokyo: 'フィールドセールス（東京都）',
  field_sales_osaka: 'フィールドセールス（大阪府）',
  account_manager_tokyo: 'アカウントマネージャー（東京都）',
  account_manager_osaka: 'アカウントマネージャー（大阪府）',
};

export const APPLICATION_REASON_LABELS: Record<ApplicationReason, string> = {
  company_attraction: 'ロケットナウに魅力を感じたため',
  industry_interest: 'フードデリバリー業界に興味があるため',
  position_interest: '募集職種に興味があるため',
  compensation_benefits: '給与や待遇に魅力を感じたため',
};

export const PAST_EXPERIENCE_LABELS: Record<PastExperience, string> = {
  seminar_attended: 'はい、セミナーに参加したことがあります',
  work_experience: 'はい、ロケットナウで勤務したことがあります',
  none: 'いいえ、どちらもありません',
};

export const CONDITION_LABELS = [
  '18歳〜40歳までの方（長期キャリア形成のため）',
  '心身ともに健康な方',
  '日本国籍、または就労制限ないビザをお持ちである',
] as const;
