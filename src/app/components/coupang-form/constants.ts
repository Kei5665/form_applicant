import type { JobPosition, ApplicationReason, PastExperience, JobListing } from './types';

export const JOB_POSITION_LABELS: Record<JobPosition, string> = {
  field_sales_tokyo: 'フィールドセールス（東京都）',
  field_sales_osaka: 'フィールドセールス（大阪府）',
  account_manager_tokyo: 'アカウントマネージャー（東京都）',
  account_manager_osaka: 'アカウントマネージャー（大阪府）',
};

export const JOB_LISTINGS: JobListing[] = [
  {
    id: 'account_manager_tokyo',
    title: '営業サポート事務/月給32万～/未経験OK/安定',
    company: 'CP One Japan 合同会社',
    location: '東京都港区',
    salary: '月給 320,000円〜',
    salaryDetail: [
      '基本給：月給320,000円',
      '昇給：勤務実績に基づき支給',
      '通勤手当：実費支給（上限30,000円／月）',
    ],
    highlights: [
      '未経験でも外資系企業オフィス事務デビューできる',
      '月給32万円スタートの安定収入',
      '自らの成果に応じた評価・報酬が得られる環境',
      'スタートアップならではのスピード感ある成長フェーズに参画可能',
      '飲食店・デリバリーサービスを日常的に利用している方は経験を活かせます',
      '成長企業で新しいサービスを一緒に広げていけるポジション',
      '直近2〜3ヶ月のアプリダウンロード数No.1で利用者増加中',
    ],
    jobType: 'アカウントマネージャー',
    workStyle: '変形労働時間制',
    url: 'https://ridejob.jp/job/uyl1oq5g4_7',
    updatedAt: '2025/11/18',
  },
  {
    id: 'field_sales_tokyo',
    title: '法人営業/初月64万/未経験OK/20代・30代中心',
    company: 'CP One Japan 合同会社',
    location: '東京都港区',
    salary: '月給 320,000円 ~ 640,000円',
    salaryDetail: [
      '基本給：月給320,000円（固定残業代含む）',
      '初月限定特別インセンティブ：320,000円支給（条件あり）',
      '月初のみ基本給＋インセンティブで64万',
      'インセンティブ：パフォーマンスに応じて別途支給',
    ],
    highlights: [
      '基本給32万円＋インセンティブ制度あり',
      '初月限定！特別インセンティブ32万円支給',
      '初月は基本給と合わせ月収64万円も可能',
      '努力と成果が収入に直結！20代・30代で年収600万円以上も目指せます',
      '営業未経験でも、成果をしっかり評価！モチベーション高く働ける環境',
      '業界成長率トップクラス！市場拡大中のため未経験でもチャンス大',
      '活気あるチームで、お互いにサポートし合う雰囲気が自慢',
      '直近2〜3ヶ月のアプリダウンロード数国内No.1で、提案のしやすさ抜群',
    ],
    jobType: 'フィールドセールス',
    workStyle: '変形労働時間制',
    url: 'https://ridejob.jp/job/llrcvhvh3cy4',
    updatedAt: '2025/11/18',
  },
  {
    id: 'field_sales_osaka',
    title: '営業クルー/初月64万/未経験OK/直行直帰OK',
    company: 'CP One Japan 合同会社',
    location: '大阪府大阪市北区',
    salary: '月給 320,000円 ~ 640,000円',
    salaryDetail: [
      '基本給：月給320,000円（固定残業代含む）',
      '初月限定特別インセンティブ：320,000円支給（条件あり）',
      '月初のみ基本給＋インセンティブで64万',
      'インセンティブ：パフォーマンスに応じて別途支給',
    ],
    highlights: [
      '基本給32万円＋インセンティブ制度あり',
      '初月限定！特別インセンティブ32万円支給',
      '初月は基本給と合わせ月収64万円も可能',
      '努力と成果が収入に直結！20代・30代で年収600万円以上も目指せます',
      '営業未経験でも、成果をしっかり評価！モチベーション高く働ける環境',
      '業界成長率トップクラス！市場拡大中のため未経験でもチャンス大',
      '活気あるチームで、お互いにサポートし合う雰囲気が自慢',
      '直近2〜3ヶ月のアプリダウンロード数国内No.1で、提案のしやすさ抜群',
    ],
    jobType: 'フィールドセールス',
    workStyle: '変形労働時間制',
    url: 'https://ridejob.jp/job/ivp4hsarcy1',
    updatedAt: '2025/11/18',
  },
  {
    id: 'account_manager_osaka',
    title: '営業サポート事務/月給32万～/未経験OK/安定',
    company: 'CP One Japan 合同会社',
    location: '大阪府大阪市北区',
    salary: '月給 320,000円〜',
    salaryDetail: [
      '基本給：月給320,000円',
      '昇給：勤務実績に基づき支給',
      '通勤手当：実費支給（上限30,000円／月）',
    ],
    highlights: [
      '未経験でも外資系企業オフィス事務デビューできる',
      '月給32万円スタートの安定収入',
      '自らの成果に応じた評価・報酬が得られる環境',
      'スタートアップならではのスピード感ある成長フェーズに参画可能',
      '飲食店・デリバリーサービスを日常的に利用している方は経験を活かせます',
      '成長企業で新しいサービスを一緒に広げていけるポジション',
      '直近2〜3ヶ月のアプリダウンロード数No.1で利用者増加中',
    ],
    jobType: 'アカウントマネージャー',
    workStyle: '変形労働時間制',
    url: 'https://ridejob.jp/job/crzf-xlcz',
    updatedAt: '2025/11/27',
  },
];

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
