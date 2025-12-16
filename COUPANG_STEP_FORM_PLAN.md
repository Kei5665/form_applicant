# Coupangページ ステップフォーム実装計画

## 概要
現在の一括入力フォームを、トップページと同様のステップ形式（カード式）に変更する。

## 現状分析

### 現在のCoupangフォーム構造
- **フォーム形式**: すべての入力項目が一度に表示される通常のフォーム
- **入力項目**: 
  1. 求職者情報（5項目）
  2. 応募情報（2項目）
  3. セミナー情報（2項目）
  4. 参加条件確認（3項目のチェックボックス）
- **状態管理**: `useCoupangForm`フック（シンプルな実装）
- **バリデーション**: 送信時に一括バリデーション

### トップページのステップフォーム構造
- **フォーム形式**: カード形式で段階的に進むステップフォーム
- **コンポーネント**: 
  - `FormCard`: ベースカードコンポーネント
  - `BirthDateCard`, `NameCard`, `PhoneNumberCard`など: 各ステップ専用カード
- **状態管理**: `useApplicationFormState`フック（複雑な実装）
  - `currentCardIndex`: 現在のステップ管理
  - `cardStates`: 各カードのアクティブ状態
  - ステップごとのバリデーション
  - フォーム離脱防止
- **UX機能**:
  - ローディング画面
  - 前のステップへ戻る機能
  - リアルタイムバリデーション
  - スムーズなトランジション

## 実装方針

### アプローチ
既存の`ApplicationForm`のアーキテクチャを参考にしつつ、Coupang専用のステップフォームを構築する。

### ステップ構成（4ステップ）

#### ステップ1: 応募情報
- **入力項目**:
  - 希望職種（jobPosition）
  - 志望理由（applicationReason）
- **バリデーション**:
  - 必須選択チェック

#### ステップ2: セミナー情報
- **入力項目**:
  - 参加希望日時（seminarSlot）
  - 過去の参加／勤務経験（pastExperience）
- **バリデーション**:
  - 必須選択チェック

#### ステップ3: 参加条件確認
- **入力項目**:
  - 条件1: 18歳〜40歳までの方（condition1）
  - 条件2: 心身ともに健康な方（condition2）
  - 条件3: 日本国籍、または就労制限ないビザ（condition3）
- **バリデーション**:
  - すべてのチェックボックスがONであることを確認

#### ステップ4: 求職者基本情報と送信
- **入力項目**:
  - メールアドレス（email）
  - 氏名（漢字）（fullName）
  - 氏名（ふりがな）（fullNameKana）
  - 英名（englishName）
  - 電話番号（phoneNumber）
- **バリデーション**:
  - メール形式チェック
  - 氏名：全角文字のみ
  - ふりがな：ひらがなのみ
  - 英名：アルファベットのみ、名→姓の順
  - 電話番号：11桁の数字（ハイフンなし）
- **送信ボタン配置**

## 実装タスク

### Phase 1: カードコンポーネント作成
- [ ] `CoupangApplicationInfoCard.tsx` - ステップ1: 応募情報カード
- [ ] `CoupangSeminarInfoCard.tsx` - ステップ2: セミナー情報カード
- [ ] `CoupangConditionCard.tsx` - ステップ3: 参加条件確認カード
- [ ] `CoupangPersonalInfoCard.tsx` - ステップ4: 求職者基本情報カード

### Phase 2: Hooks作成
- [ ] `useCoupangFormState.ts` - ステップフォーム用の状態管理フック
  - currentCardIndex管理
  - cardStates管理
  - ステップごとのバリデーション関数
  - handleNextStep / handlePreviousStep
  - フォーム離脱防止機能
  - 送信処理

### Phase 3: バリデーション作成
- [ ] `coupangValidators.ts` - ステップごとのバリデーション関数
  - validateStep1 (応募情報)
  - validateStep2 (セミナー情報)
  - validateStep3 (参加条件確認)
  - validateStep4 (求職者基本情報)

### Phase 4: メインコンポーネント更新
- [ ] `CoupangStepForm.tsx` - 新しいステップフォームコンポーネント作成
- [ ] `CoupangApplicationForm.tsx` - 既存フォームのバックアップ（`CoupangApplicationForm.legacy.tsx`）
- [ ] ページファイル更新（`src/app/coupang/page.tsx`）

### Phase 5: スタイリングとUX
- [ ] ステップインジケーター追加（現在のステップ表示: 1/4, 2/4...）
- [ ] トランジションアニメーション調整
- [ ] レスポンシブ対応確認
- [ ] ローディング画面（オプション）

### Phase 6: テストと調整
- [ ] 各ステップのバリデーション動作確認
- [ ] 前のステップへ戻る動作確認
- [ ] API送信テスト
- [ ] フォーム離脱防止の動作確認
- [ ] モバイル表示確認

## 技術的な詳細

### ディレクトリ構造
```
src/app/components/coupang-form/
├── components/
│   ├── CoupangApplicationInfoCard.tsx  (NEW) - ステップ1
│   ├── CoupangSeminarInfoCard.tsx      (NEW) - ステップ2
│   ├── CoupangConditionCard.tsx        (NEW) - ステップ3
│   ├── CoupangPersonalInfoCard.tsx     (NEW) - ステップ4
│   └── [既存のコンポーネント]
├── hooks/
│   ├── useCoupangFormState.ts          (NEW)
│   ├── useCoupangForm.ts               (既存 - バックアップ)
│   └── useSeminarSlots.ts              (既存 - そのまま利用)
├── utils/
│   └── coupangValidators.ts            (NEW)
├── CoupangStepForm.tsx                 (NEW)
├── CoupangApplicationForm.tsx          (既存 - リプレース)
├── CoupangApplicationForm.legacy.tsx   (NEW - バックアップ)
├── types.ts                             (既存 - そのまま)
├── constants.ts                         (既存 - そのまま)
└── validation.ts                        (既存 - 参考用)
```

### 再利用するコンポーネント/機能
- `FormCard` - application-form/componentsから再利用
- `FormExitModal` - フォーム離脱防止モーダル
- `useSeminarSlots` - セミナー日程取得フック
- `JOB_LISTINGS`, `JOB_POSITION_LABELS`などの定数

### 新規作成が必要な機能
- Coupang専用のカードコンポーネント（4つ）
- ステップ管理フック（`useCoupangFormState`）
- ステップごとのバリデーション関数

## UX改善ポイント

### 現在のフォームの課題
1. すべての項目が一度に表示されるため、入力量が多く感じる
2. エラー発生時にスクロールが必要
3. 入力進捗が分かりにくい

### ステップフォームのメリット
1. **認知負荷の軽減**: 一度に少数の項目に集中できる
2. **進捗の可視化**: ステップ表示で完了までの道のりが明確
3. **エラー対応の簡易化**: ステップごとのバリデーションで早期にエラー発見
4. **完了率の向上**: 段階的な達成感がモチベーションを維持
5. **モバイルフレンドリー**: スクロールが少なく操作しやすい
6. **信頼感の醸成**: 個人情報入力を最後にすることで、ユーザーがフォームの内容を理解してから個人情報を提供できる

## デザイン指針

### 既存のCoupangページデザインを継承
- 背景画像: `/images/coupang_bg.webp`
- バナー画像: `/images/coupang_banner.webp`
- アクセントカラー: `#ff6b35`（オレンジ）
- カードスタイル: 白背景 + 影 + 丸角

### ステップフォームのデザイン要素
- **ステップインジケーター**: 
  - 位置: カード上部
  - 表示: "ステップ 1/4", "ステップ 2/4"...
  - スタイル: シンプルなテキスト or プログレスバー
- **ナビゲーションボタン**:
  - 「次へ」ボタン: オレンジ（`#ff6b35`）
  - 「戻る」ボタン: グレー（`#6b7280`）
  - 最終ステップ: 「送信する」ボタン
- **カードトランジション**:
  - フェードイン/アウト + スライドアニメーション
  - duration: 500ms

## リスクと対策

### リスク1: 既存フォームの動作に影響
**対策**: 
- 既存の`CoupangApplicationForm.tsx`を`CoupangApplicationForm.legacy.tsx`としてバックアップ
- 新しいフォームを`CoupangStepForm.tsx`として作成
- テスト完了後に切り替え

### リスク2: API連携の互換性
**対策**:
- 送信データの形式は既存APIと完全互換を保つ
- `/api/coupang/applicants`エンドポイントはそのまま使用
- フォームデータの型（`CoupangFormData`）は変更しない

### リスク3: 離脱率の増加
**対策**:
- フォーム離脱防止機能の実装
- 各ステップのバリデーションを適切に設定（厳しすぎない）
- ステップ数を適切に保つ（4ステップ）

### リスク4: モバイル対応
**対策**:
- レスポンシブデザインの徹底
- タッチ操作に最適化されたUIコンポーネント
- モバイル実機での動作確認

## 成功指標

### 定量的指標
- フォーム完了率: 現状比で10%以上向上
- フォーム入力時間: 平均時間を測定
- エラー発生率: ステップごとのエラー発生率を測定

### 定性的指標
- ユーザビリティテスト結果
- 入力のしやすさに関するフィードバック

## スケジュール（目安）

- **Phase 1**: カードコンポーネント作成 - 2-3時間
- **Phase 2**: Hooks作成 - 2-3時間
- **Phase 3**: バリデーション作成 - 1-2時間
- **Phase 4**: メインコンポーネント更新 - 1-2時間
- **Phase 5**: スタイリングとUX - 1-2時間
- **Phase 6**: テストと調整 - 2-3時間

**合計**: 約9-15時間（実装者のスキルレベルによる）

## 補足事項

### 求人情報表示について
- 現在のCoupangページには求人情報カード（ドロップダウンで選択）が含まれている
- ステップフォームには含めず、フォームの前後に表示する形を維持
- または、応募情報ステップ（ステップ2）に統合することも検討可能

### セミナー詳細情報について
- 現在のセミナー詳細情報セクションは、フォームとは別に表示
- ステップフォームでも同様に、フォームの前に表示する形を維持

### フッターについて
- 現在のフッター（運営会社、プライバシーポリシーリンク）は維持

## 参考ファイル

- `src/app/components/ApplicationForm.tsx` - メインの参考実装
- `src/app/components/application-form/hooks/useApplicationFormState.ts` - 状態管理の参考
- `src/app/components/application-form/components/FormCard.tsx` - ベースカードコンポーネント
- `src/app/components/coupang-form/CoupangApplicationForm.tsx` - 現在の実装
- `src/app/components/coupang-form/hooks/useCoupangForm.ts` - 現在の状態管理

---

**実装開始前の確認事項**:
- [ ] この計画でステップ構成は適切か？
- [ ] 各ステップの入力項目数は適切か（多すぎ/少なすぎないか）？
- [ ] 既存のAPIとの互換性は保たれるか？
- [ ] デザインは既存のCoupangページと調和するか？

