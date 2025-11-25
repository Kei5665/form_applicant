export type JobPosition =
  | 'field_sales_tokyo'
  | 'field_sales_osaka'
  | 'account_manager_tokyo'
  | 'account_manager_osaka';

export type ApplicationReason =
  | 'company_attraction'
  | 'industry_interest'
  | 'position_interest'
  | 'compensation_benefits';

export type PastExperience =
  | 'seminar_attended'
  | 'work_experience'
  | 'none';

export type SeminarSlot = {
  date: string;
  url: string;
};

export type CoupangFormData = {
  // 求職者情報
  email: string;
  fullName: string;           // 氏名（漢字）
  fullNameKana: string;       // 氏名（ふりがな）
  englishName: string;        // 英名
  phoneNumber: string;        // 電話番号

  // 応募情報
  jobPosition: JobPosition | '';
  applicationReason: ApplicationReason | '';

  // セミナー情報
  seminarSlot: string;        // 参加希望日時
  pastExperience: PastExperience | '';

  // 参加条件確認（5つすべて必須）
  condition1: boolean;  // 一都三県もしくは大阪府で勤務可能
  condition2: boolean;  // 18歳〜43歳
  condition3: boolean;  // 前科・犯罪歴なし
  condition4: boolean;  // 心身ともに健康
  condition5: boolean;  // 日本国籍保有
};

export type CoupangFormErrors = {
  [K in keyof CoupangFormData]?: string;
};
