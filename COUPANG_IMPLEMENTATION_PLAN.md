# Coupangページ専用フォーム実装計画

## 概要
現在のCoupangページは共通フォーム（ApplicationForm）を使用していますが、ロケットナウ社の採用フォーム専用の要件に合わせて、完全に独立した1ステップフォームを実装します。

---

## 現状分析

### 現在の構成
- **ページ**: `src/app/coupang/page.tsx`
- **使用コンポーネント**: `ApplicationForm` (共通フォーム)
- **フォームフロー**: 3ステップ
  - STEP1: 生年月日
  - STEP2: 住所
  - STEP3: 名前・連絡先
- **API**: `/api/applicants` (既存の応募者API)

### 課題
1. 共通フォームのため、ロケットナウ専用フィールドに対応していない
2. 3ステップ構成で、1ステップ要件と異なる
3. 参加希望日時のAPI取得機能がない
4. 必須項目の参加条件確認が実装されていない

---

## 新要件

### フォーム項目（1ステップで全項目表示）

#### カテゴリ1: 求職者情報
- メールアドレス（必須、@gmail.com推奨表示）
- 氏名（漢字）（必須、姓名間に全角スペース）
- 氏名（ふりがな）（必須、ひらがな、姓名間に全角スペース）
- 英名（必須、名→姓の順、間に全角スペース）
- 電話番号（必須、ハイフン必須、例: 090-1234-5678）

#### カテゴリ2: 応募情報
- 希望職種（必須、選択式）
  - フィールドセールス（東京都）
  - フィールドセールス（大阪府）
  - アカウントマネージャー（東京都）
  - アカウントマネージャー（大阪府）
- 志望理由（必須、選択式）
  - ロケットナウに魅力を感じたため
  - フードデリバリー業界に興味があるため
  - 募集職種に興味があるため
  - 給与や待遇に魅力を感じたため

#### カテゴリ3: セミナー情報
- 参加希望日時（必須、選択式、APIから取得）
- 過去の参加／勤務経験（必須、選択式）
  - はい、セミナーに参加したことがあります
  - はい、ロケットナウで勤務したことがあります
  - いいえ、どちらもありません

#### カテゴリ4: 参加条件確認
- すべて必須チェックボックス
  1. 一都三県もしくは大阪府で勤務可能な方
  2. 18歳〜43歳までの方（長期キャリア形成のため）
  3. 前科・犯罪歴の無い方
  4. 心身ともに健康な方
  5. 日本国籍を保有している

---

## 実装計画

### フェーズ1: データ型・バリデーション定義

#### 1.1 型定義の作成
**ファイル**: `src/app/components/coupang-form/types.ts`

```typescript
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
  id: string;
  datetime: string;
  displayText: string;
  available: boolean;
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
  seminarSlotId: string;      // 参加希望日時ID
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
```

#### 1.2 バリデーション関数の作成
**ファイル**: `src/app/components/coupang-form/validation.ts`

- メールアドレス形式チェック
- 氏名（漢字）: 全角、姓名間に全角スペース1つ
- 氏名（ふりがな）: ひらがな、姓名間に全角スペース1つ
- 英名: アルファベット、名→姓の順、間に全角スペース
- 電話番号: ハイフン付き形式（XXX-XXXX-XXXX）
- 参加条件: 5つすべてtrue

---

### フェーズ2: API実装

#### 2.1 参加希望日時取得API
**ファイル**: `src/app/api/coupang/seminar-slots/route.ts`

```typescript
GET /api/coupang/seminar-slots

レスポンス:
{
  slots: [
    {
      id: "slot_001",
      datetime: "2025-12-01T10:00:00+09:00",
      displayText: "12月1日（日）10:00〜",
      available: true
    },
    ...
  ]
}
```

**実装内容**:
- 静的データまたは外部API連携（要確認）
- キャッシュ戦略（5分間）
- エラーハンドリング

#### 2.2 Coupang専用応募API
**ファイル**: `src/app/api/coupang/applicants/route.ts`

```typescript
POST /api/coupang/applicants

リクエストボディ: CoupangFormData + UTMパラメータ

処理内容:
1. データバリデーション
2. Lark Webhook送信（専用フォーマット）
3. Lark Base記録
4. GTMイベント送信用データ返却
```

**環境変数**:
- `LARK_WEBHOOK_URL_COUPANG_PROD`
- `LARK_WEBHOOK_URL_COUPANG_TEST`
- `LARK_BASE_WEBHOOK_URL_COUPANG_PROD`
- `LARK_BASE_WEBHOOK_URL_COUPANG_TEST`

---

### フェーズ3: UIコンポーネント実装

#### 3.1 メインフォームコンポーネント
**ファイル**: `src/app/components/coupang-form/CoupangApplicationForm.tsx`

**構成**:
```tsx
<form>
  {/* バナー画像 */}
  <Image src="/images/coupang_banner.webp" />

  {/* カテゴリ1: 求職者情報 */}
  <section>
    <h2>求職者情報</h2>
    <EmailInput />
    <FullNameInput />
    <FullNameKanaInput />
    <EnglishNameInput />
    <PhoneNumberInput />
  </section>

  {/* カテゴリ2: 応募情報 */}
  <section>
    <h2>応募情報</h2>
    <JobPositionSelect />
    <ApplicationReasonSelect />
  </section>

  {/* カテゴリ3: セミナー情報 */}
  <section>
    <h2>セミナー情報</h2>
    <SeminarSlotSelect />
    <PastExperienceSelect />
  </section>

  {/* カテゴリ4: 参加条件確認 */}
  <section>
    <h2>参加条件確認</h2>
    <ConditionCheckboxes />
  </section>

  <SubmitButton />
</form>
```

#### 3.2 個別入力コンポーネント
**ディレクトリ**: `src/app/components/coupang-form/components/`

各フィールド用のコンポーネント:
- `EmailInput.tsx` - メールアドレス入力（@gmail.com推奨表示）
- `FullNameInput.tsx` - 氏名（漢字）入力
- `FullNameKanaInput.tsx` - 氏名（ふりがな）入力
- `EnglishNameInput.tsx` - 英名入力
- `PhoneNumberInput.tsx` - 電話番号入力（ハイフン自動挿入）
- `JobPositionSelect.tsx` - 希望職種選択
- `ApplicationReasonSelect.tsx` - 志望理由選択
- `SeminarSlotSelect.tsx` - 参加希望日時選択（API連携）
- `PastExperienceSelect.tsx` - 過去の参加／勤務経験選択
- `ConditionCheckboxes.tsx` - 参加条件確認チェックボックス

#### 3.3 カスタムフック
**ファイル**: `src/app/components/coupang-form/hooks/useCoupangForm.ts`

```typescript
export function useCoupangForm() {
  const [formData, setFormData] = useState<CoupangFormData>(initialState);
  const [errors, setErrors] = useState<CoupangFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // セミナー枠取得
  const { slots, isLoading: slotsLoading } = useSeminarSlots();

  // バリデーション
  const validate = () => { ... };

  // 送信処理
  const handleSubmit = async (e: FormEvent) => { ... };

  return {
    formData,
    errors,
    isSubmitting,
    slots,
    slotsLoading,
    handleChange,
    handleSubmit,
  };
}
```

**ファイル**: `src/app/components/coupang-form/hooks/useSeminarSlots.ts`

```typescript
export function useSeminarSlots() {
  const [slots, setSlots] = useState<SeminarSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // GET /api/coupang/seminar-slots
  }, []);

  return { slots, isLoading, error };
}
```

---

### フェーズ4: ページ統合

#### 4.1 Coupangページの更新
**ファイル**: `src/app/coupang/page.tsx`

```tsx
import CoupangApplicationForm from '@/app/components/coupang-form/CoupangApplicationForm';

export default function CoupangPage() {
  return (
    <div className="relative min-h-screen">
      <Image
        src="/images/coupang_bg.webp"
        alt="Background"
        fill
        className="object-cover"
        quality={85}
        priority
      />
      <div className="relative z-10">
        <CoupangApplicationForm />
      </div>
    </div>
  );
}
```

#### 4.2 サンクスページの更新
**ファイル**: `src/app/coupang/applicants/new/page.tsx`

- GTMイベント送信（既存）
- 新フォームに合わせたメッセージ調整（必要に応じて）

---

### フェーズ5: スタイリング

#### 5.1 デザイン要件
- 既存のCoupangページのカラースキーム継承
  - アクセントカラー: `#ff6b35`
  - 背景: `#f1f9fa`
- レスポンシブデザイン（モバイルファースト）
- 1ステップフォームのため、スクロール可能な長いフォーム
- セクションごとに視覚的な区切り

#### 5.2 UI/UXの工夫
- 必須項目の明確な表示
- エラーメッセージのインライン表示
- 送信ボタンは条件を満たすまで無効化
- ローディング状態の表示
- セミナー枠の在庫状況表示

---

### フェーズ6: テストとデプロイ

#### 6.1 テスト項目
- [ ] 各入力フィールドのバリデーション
- [ ] セミナー枠API取得
- [ ] フォーム送信（開発環境）
- [ ] Lark Webhook送信確認
- [ ] Lark Base記録確認
- [ ] GTMイベント送信確認
- [ ] レスポンシブデザイン確認
- [ ] ブラウザ互換性確認

#### 6.2 デプロイ計画
1. 開発環境でテスト
2. ステージング環境でテスト
3. 本番環境デプロイ
4. 既存フォームとの並行運用期間設定（必要に応じて）

---

## ファイル構成

```
src/
├── app/
│   ├── api/
│   │   └── coupang/
│   │       ├── applicants/
│   │       │   └── route.ts          # 新規: Coupang専用応募API
│   │       └── seminar-slots/
│   │           └── route.ts          # 新規: セミナー枠取得API
│   ├── components/
│   │   └── coupang-form/             # 新規ディレクトリ
│   │       ├── CoupangApplicationForm.tsx
│   │       ├── types.ts
│   │       ├── validation.ts
│   │       ├── constants.ts
│   │       ├── components/
│   │       │   ├── EmailInput.tsx
│   │       │   ├── FullNameInput.tsx
│   │       │   ├── FullNameKanaInput.tsx
│   │       │   ├── EnglishNameInput.tsx
│   │       │   ├── PhoneNumberInput.tsx
│   │       │   ├── JobPositionSelect.tsx
│   │       │   ├── ApplicationReasonSelect.tsx
│   │       │   ├── SeminarSlotSelect.tsx
│   │       │   ├── PastExperienceSelect.tsx
│   │       │   ├── ConditionCheckboxes.tsx
│   │       │   └── index.ts
│   │       └── hooks/
│   │           ├── useCoupangForm.ts
│   │           ├── useSeminarSlots.ts
│   │           └── index.ts
│   └── coupang/
│       ├── page.tsx                  # 更新: 新フォーム使用
│       ├── layout.tsx                # 既存のまま
│       └── applicants/
│           └── new/
│               └── page.tsx          # 更新: GTMイベント調整
└── lib/
    └── utils/
        └── formatters.ts             # 新規: 電話番号フォーマット等
```

---

## 技術的検討事項

### 1. セミナー枠データの取得方法
- **オプションA**: 静的データ（JSON）
- **オプションB**: 外部API連携（要確認）
- **推奨**: まず静的データで実装、後で外部API対応

### 2. 電話番号のハイフン自動挿入
- リアルタイムフォーマット or Blur時フォーマット
- **推奨**: Blur時にフォーマット（UX考慮）

### 3. メールアドレス推奨表示
- プレースホルダーに「example@gmail.com」
- ヘルプテキストで「@gmail.com推奨」表示

### 4. 英名入力のバリデーション
- 名→姓の順序を強制 or ガイダンス表示のみ
- **推奨**: バリデーションは形式のみ、順序はヘルプテキストで案内

---

## マイルストーン

### Week 1
- [ ] フェーズ1: 型定義・バリデーション実装
- [ ] フェーズ2: API実装（セミナー枠、応募API）

### Week 2
- [ ] フェーズ3: UIコンポーネント実装
- [ ] フェーズ4: ページ統合

### Week 3
- [ ] フェーズ5: スタイリング
- [ ] フェーズ6: テスト

### Week 4
- [ ] 修正対応
- [ ] デプロイ

---

## 今後の拡張性

### 将来的な機能追加
1. セミナー枠の在庫管理
2. リマインダーメール送信
3. 管理画面での応募者管理
4. CSVエクスポート機能

---

## 質問・確認事項

1. **セミナー枠データ**: どこから取得するか？静的データでOKか？
2. **デザイン**: モックアップまたはデザインファイルはあるか？
3. **既存フォームとの移行**: 並行運用期間は必要か？
4. **環境変数**: Lark Webhook URLは既存のものと別か？
5. **GTMイベント**: 既存と異なるイベント名が必要か？
