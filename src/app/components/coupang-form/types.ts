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

  // 参加条件確認（任意）
  condition1: boolean;  // 18歳〜40歳
  condition2: boolean;  // 心身ともに健康
  condition3: boolean;  // 日本国籍、または就労制限ないビザ
};

export type CoupangFormErrors = {
  [K in keyof CoupangFormData]?: string;
};

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  salaryDetail: string[];
  highlights: string[];
  jobType: string;
  workStyle: string;
  url: string;
  updatedAt: string;
};
