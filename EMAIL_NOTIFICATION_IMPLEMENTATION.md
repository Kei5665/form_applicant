# メール送信機能 実装仕様書

## 📋 概要

Coupangフォーム応募者に対して、GAS + Gmailを使用してセミナー確認メールを自動送信する機能を実装します。

---

## 🎯 目的

- フォーム送信完了時に応募者へ確認メールを送信
- セミナー日時とZoom URLを通知
- 参加準備事項を案内

---

## 📐 システム構成

```
ユーザーがフォーム送信
  ↓
Next.js API (/api/coupang/applicants)
  ↓
並列処理:
  ├─ Lark Webhook送信（既存）
  ├─ Lark Base記録（既存）
  └─ GAS API呼び出し（POST）⭐NEW
       ↓
     GAS側でGmail送信
       - 送信元: yui@pmagent.jp
       - 送信先: 応募者のメールアドレス
       - 内容: セミナー詳細 + Zoom URL
```

---

## 📊 データフロー

### Next.js → GAS へのリクエスト

**エンドポイント**: `POST https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec`

**リクエストボディ**:
```json
{
  "to": "applicant@example.com",
  "applicantName": "山田　太郎",
  "seminarDate": "12月25日（水）10:00〜",
  "zoomUrl": "https://zoom.us/j/xxxxx",
  "jobPosition": "フィールドセールス（東京都）",
  "phoneNumber": "090-1234-5678"
}
```

### GAS → Next.js へのレスポンス

**成功時**:
```json
{
  "success": true,
  "messageId": "xxx-xxx-xxx",
  "to": "applicant@example.com"
}
```

**エラー時**:
```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

---

## 🔧 技術スタック

| 項目 | 技術 |
|-----|------|
| メール送信 | Google Apps Script + GmailApp |
| 送信元アドレス | yui@pmagent.jp |
| メール形式 | HTML + プレーンテキスト |
| 送信制限 | 個人Gmail: 100通/日、Google Workspace: 2,000通/日 |

---

## 📝 実装内容

### 1. GAS側の実装

#### 1.1 新規関数

| 関数名 | 説明 |
|-------|------|
| `doPost()` | POSTリクエストを受け取り、メール送信を実行 |
| `sendConfirmationEmail()` | Gmail送信処理 |
| `createEmailHtml()` | HTMLメール本文生成 |
| `createEmailText()` | プレーンテキスト本文生成 |
| `isValidEmail()` | メールアドレスバリデーション |
| `createSuccessResponse()` | 成功レスポンス生成 |
| `createErrorResponse()` | エラーレスポンス生成 |

#### 1.2 既存関数

| 関数名 | 説明 | 変更 |
|-------|------|------|
| `doGet()` | セミナー枠取得 | 変更なし |
| `getCalendarEvents()` | カレンダーからイベント取得 | 変更なし |

---

### 2. Gmail設定

#### 2.1 送信元アドレス設定

**手順**:
1. Gmailの設定を開く
2. 「アカウントとインポート」タブ
3. 「他のメールアドレスを追加」をクリック
4. `yui@pmagent.jp`を追加
5. 確認メールを承認

**または**:
- Google Workspaceを使用している場合は、`yui@pmagent.jp`のアカウントでGASを実行

---

### 3. Next.js側の実装

#### 3.1 新規ファイル

**`src/lib/email/send-email-via-gas.ts`**

- GAS APIを呼び出すユーティリティ関数
- エラーハンドリング
- TypeScript型定義

#### 3.2 修正ファイル

**`src/app/api/coupang/applicants/route.ts`**

- メール送信タスクを並列処理に追加
- `seminarSlotUrl`パラメータの受け取り
- エラーハンドリング（メール送信失敗してもフォーム送信は成功扱い）

**`src/app/components/coupang-form/hooks/useCoupangForm.ts`**

- `useSeminarSlots`の統合
- `slots`を状態管理に追加
- フォーム送信時に`seminarSlotUrl`を含める

**`src/app/components/coupang-form/CoupangApplicationForm.tsx`**

- `useSeminarSlots`の呼び出しを削除
- `useCoupangForm`から`slots`と`slotsLoading`を取得

#### 3.3 環境変数

**`.env.local`**:
```bash
# GAS API URL（既存）
GAS_SEMINAR_API_URL=https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec

# メール送信機能の有効化フラグ（新規）
ENABLE_EMAIL_NOTIFICATION=true
```

---

## 📧 メール仕様

### メール内容

| 項目 | 内容 |
|-----|------|
| **送信元** | yui@pmagent.jp（LIFT JOB 運営事務局） |
| **送信先** | フォーム入力されたメールアドレス |
| **件名** | 【ロケットナウ】セミナーお申込み完了のご案内 |
| **形式** | HTML + プレーンテキスト |

### メール構成

#### セクション1: ヘッダー
- オレンジ背景（#ff6b35）
- タイトル: 「✨ セミナーお申込み完了 ✨」

#### セクション2: 挨拶
- 応募者名
- お礼メッセージ

#### セクション3: セミナー日程
- セミナー日時（強調表示）
- 応募職種

#### セクション4: 参加方法
- Zoom URLボタン
- Zoom URL（テキスト）

#### セクション5: 参加前の準備
- 5分前入室のお願い
- 電話番号下4桁の準備
- 自己紹介の準備
- 志望理由の準備
- 服装（スーツ推奨）

#### セクション6: セミナー内容
- 会社および職務説明（20〜30分）
- 面接（5分）

#### セクション7: フッター
- 株式会社PMAgent
- LIFT JOB 運営事務局
- Email: yui@pmagent.jp
- Web: https://pmagent.jp/

### デザイン仕様

| 要素 | スタイル |
|-----|---------|
| **カラー** | |
| アクセントカラー | #ff6b35 |
| テキスト | #333 |
| 背景（ボックス） | #f9f9f9 |
| **フォント** | |
| フォントファミリー | Hiragino Sans, Yu Gothic, Meiryo |
| 行間 | 1.8 |
| **レイアウト** | |
| 最大幅 | 600px |
| パディング | 20px〜30px |
| ボーダー | 左4px solid #ff6b35 |

---

## 🔄 処理フロー

### 1. フォーム送信

```
ユーザーがフォーム送信
  ↓
バリデーション
  ↓
GTMイベント送信（form_submit）
  ↓
POST /api/coupang/applicants
```

### 2. API処理（並列）

```
Promise.allSettled([
  Lark Webhook送信,
  Lark Base記録,
  GAS API呼び出し（メール送信）
])
```

### 3. GAS処理

```
doPost()
  ↓
パラメータ検証
  ↓
メールアドレスバリデーション
  ↓
sendConfirmationEmail()
  ↓
createEmailHtml() / createEmailText()
  ↓
GmailApp.sendEmail()
  ↓
成功レスポンス返却
```

---

## 🔒 セキュリティ

### バリデーション

1. **Next.js側**
   - フォームバリデーション（既存）
   - メールアドレス形式チェック

2. **GAS側**
   - パラメータ存在チェック
   - メールアドレス再検証
   - 不正なリクエストの拒否

### エラーハンドリング

1. **メール送信失敗時**
   - エラーログ出力
   - フォーム送信は成功扱い（ユーザー体験を損なわない）

2. **GAS API接続失敗時**
   - エラーログ出力
   - フォーム送信は成功扱い

### レート制限

| アカウント種類 | 制限 |
|--------------|------|
| 個人Gmail | 100通/日 |
| Google Workspace | 2,000通/日 |

**対策**:
- 制限超過時のエラーハンドリング
- 将来的な送信数増加時は別サービス（Brevo等）への移行を検討

---

## 📂 ファイル構成

### GAS側

```
Code.gs
├── doGet()                    # セミナー枠取得（既存）
├── doPost()                   # メール送信（新規）⭐
├── sendConfirmationEmail()    # 新規 ⭐
├── createEmailHtml()          # 新規 ⭐
├── createEmailText()          # 新規 ⭐
├── isValidEmail()             # 新規 ⭐
├── createSuccessResponse()    # 新規 ⭐
├── createErrorResponse()      # 新規 ⭐
└── getCalendarEvents()        # 既存
```

### Next.js側

```
src/
├── lib/
│   └── email/
│       └── send-email-via-gas.ts       # 新規 ⭐
├── app/
│   ├── api/
│   │   └── coupang/
│   │       ├── applicants/
│   │       │   └── route.ts            # 修正 ⭐
│   │       └── seminar-slots/
│   │           └── route.ts            # 既存
│   └── components/
│       └── coupang-form/
│           ├── CoupangApplicationForm.tsx  # 修正 ⭐
│           ├── hooks/
│           │   ├── useCoupangForm.ts   # 修正 ⭐
│           │   └── useSeminarSlots.ts  # 既存
│           ├── types.ts                # 既存
│           ├── validation.ts           # 既存
│           └── constants.ts            # 既存
└── .env.local                          # 修正 ⭐
```

---

## ✅ 実装チェックリスト

### Phase 1: GAS実装

- [ ] GASスクリプトに`doPost()`関数を追加
- [ ] メールテンプレート関数を追加
- [ ] バリデーション関数を追加
- [ ] エラーハンドリング関数を追加
- [ ] GASエディタでテスト実行
- [ ] ウェブアプリとしてデプロイ
- [ ] デプロイURLを取得

### Phase 2: Gmail設定

- [ ] Gmailで`yui@pmagent.jp`を送信元として追加
- [ ] 確認メールの承認
- [ ] テスト送信で送信元確認

### Phase 3: Next.js実装

- [ ] `src/lib/email/send-email-via-gas.ts`を作成
- [ ] `src/app/api/coupang/applicants/route.ts`を修正
- [ ] `src/app/components/coupang-form/hooks/useCoupangForm.ts`を修正
- [ ] `src/app/components/coupang-form/CoupangApplicationForm.tsx`を修正
- [ ] `.env.local`に環境変数を追加

### Phase 4: テスト

#### GAS単体テスト
- [ ] `testSendEmail()`関数でテスト実行
- [ ] メール受信確認
- [ ] HTML表示確認

#### GAS APIテスト
- [ ] curlでPOSTリクエストテスト
- [ ] レスポンス確認

#### Next.js開発環境テスト
- [ ] フォーム送信テスト
- [ ] メール受信確認
- [ ] HTML/テキスト表示確認
- [ ] Zoomリンク動作確認
- [ ] エラーハンドリング確認

#### 統合テスト
- [ ] Lark Webhook送信との並列動作確認
- [ ] Lark Base記録との並列動作確認
- [ ] メール送信失敗時の動作確認

### Phase 5: 本番デプロイ

- [ ] Vercelに環境変数を設定
- [ ] ビルドテスト
- [ ] 本番環境にデプロイ
- [ ] 本番環境でフォーム送信テスト
- [ ] メール受信確認

---

## 🧪 テスト仕様

### 1. GAS単体テスト

**テスト関数**:
```javascript
function testSendEmail() {
  const result = sendConfirmationEmail({
    to: 'test@example.com',
    applicantName: '山田　太郎',
    seminarDate: '12月25日（水）10:00〜',
    zoomUrl: 'https://zoom.us/j/test123456',
    jobPosition: 'フィールドセールス（東京都）',
    phoneNumber: '090-1234-5678'
  });

  Logger.log(result);
}
```

**確認項目**:
- [ ] メールが送信される
- [ ] 送信元が`yui@pmagent.jp`
- [ ] HTMLメールが正しく表示される
- [ ] Zoomリンクが動作する

### 2. GAS APIテスト

**curlコマンド**:
```bash
curl -X POST "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "applicantName": "山田　太郎",
    "seminarDate": "12月25日（水）10:00〜",
    "zoomUrl": "https://zoom.us/j/test123456",
    "jobPosition": "フィールドセールス（東京都）",
    "phoneNumber": "090-1234-5678"
  }'
```

**期待されるレスポンス**:
```json
{
  "success": true,
  "messageId": "xxx-xxx-xxx",
  "to": "test@example.com"
}
```

### 3. エラーケーステスト

| テストケース | 期待される動作 |
|------------|--------------|
| メールアドレスなし | エラーレスポンス（400） |
| 無効なメールアドレス | エラーレスポンス（400） |
| 応募者名なし | エラーレスポンス（400） |
| セミナー日時なし | エラーレスポンス（400） |
| Zoom URLなし | エラーレスポンス（400） |
| GAS API接続失敗 | エラーログ出力、フォーム送信は成功 |
| Gmail送信失敗 | エラーログ出力、フォーム送信は成功 |

---

## 📊 監視とログ

### ログ出力

#### Next.js側

```typescript
// 成功ログ
console.log('Confirmation email sent successfully to:', formData.email);

// エラーログ
console.error('Failed to send confirmation email:', error);
```

#### GAS側

```javascript
// 成功ログ
Logger.log('Email sent successfully to: ' + to);

// エラーログ
Logger.log('Error in doPost: ' + error.toString());
Logger.log('Gmail send error: ' + error.toString());
```

### 監視項目

1. **メール送信成功率**
   - GASの実行ログを確認
   - 失敗回数を監視

2. **レスポンスタイム**
   - GAS API呼び出しの応答時間
   - 5秒以上かかる場合は調査

3. **エラー率**
   - 1日の送信数に対するエラー率
   - 10%超える場合は調査

---

## 🚀 デプロイ手順

### 1. GASデプロイ

1. Google Apps Scriptエディタを開く
2. コードを貼り付け
3. 「デプロイ」→「新しいデプロイ」
4. 設定:
   - 種類: ウェブアプリ
   - 実行ユーザー: 自分
   - アクセス: 全員
5. 「デプロイ」をクリック
6. ウェブアプリのURLをコピー

### 2. Gmail設定

1. Gmailの設定を開く
2. 「アカウントとインポート」タブ
3. 「他のメールアドレスを追加」
4. `yui@pmagent.jp`を追加
5. 確認メールを承認

### 3. Next.jsデプロイ

1. ローカルで実装とテスト
2. `.env.local`に環境変数を設定
3. ビルドテスト: `npm run build`
4. Gitにコミット・プッシュ
5. Vercelで環境変数を設定
6. 自動デプロイ
7. 本番環境でテスト

---

## 🐛 トラブルシューティング

### メールが届かない

**確認項目**:
1. GASのデプロイが正しく完了しているか
2. Gmail設定で`yui@pmagent.jp`が追加されているか
3. 送信制限（100通/日）に達していないか
4. GASの実行ログにエラーがないか
5. 迷惑メールフォルダに入っていないか

### 送信元が`yui@pmagent.jp`にならない

**原因**:
- Gmailで送信元アドレスが正しく設定されていない

**対策**:
1. Gmail設定を再確認
2. 確認メールの承認を確認
3. GASを実行しているGoogleアカウントを確認

### GAS APIがエラーを返す

**確認項目**:
1. リクエストボディの形式が正しいか
2. 必須パラメータが全て含まれているか
3. メールアドレスの形式が正しいか
4. GASの実行権限が正しいか

### メール送信が遅い

**原因**:
- GAS APIの応答が遅い
- Gmail送信処理が遅い

**対策**:
1. タイムアウト設定を調整
2. 非同期処理を確認（Promise.allSettled）
3. ログで処理時間を計測

---

## 📈 今後の拡張

### 短期的な改善

1. **メールテンプレートの管理画面化**
   - GASのプロパティストアでテンプレート管理
   - 変更が容易になる

2. **送信履歴の記録**
   - Google Sheetsに送信ログを記録
   - 監視と分析が容易になる

3. **リトライ機能**
   - 送信失敗時の自動リトライ
   - 信頼性向上

### 長期的な改善

1. **別サービスへの移行検討**
   - 送信数が増加した場合
   - Brevo、Resend等への移行

2. **HTMLメールテンプレートエンジン導入**
   - React Emailの使用
   - メンテナンス性向上

3. **A/Bテスト機能**
   - メール内容の最適化
   - 開封率・クリック率の計測

---

## 📞 サポート情報

### 関連ドキュメント

- [Google Apps Script - GmailApp](https://developers.google.com/apps-script/reference/gmail/gmail-app)
- [Google Apps Script - Web Apps](https://developers.google.com/apps-script/guides/web)
- [Gmail - 他のメールアドレスを追加](https://support.google.com/mail/answer/22370)

### 問い合わせ先

- **技術的な問題**: 開発チーム
- **Gmail設定**: Google Workspace管理者
- **ビジネス要件**: プロダクトオーナー

---

## 📝 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|-----|----------|---------|-------|
| 2025-11-25 | 1.0.0 | 初版作成 | - |

---

## ✨ まとめ

この実装により、Coupangフォーム応募者に対して自動的にセミナー確認メールが送信されます。

**主要な機能**:
- ✅ GAS + Gmailによる無料メール送信
- ✅ 独自ドメイン（yui@pmagent.jp）からの送信
- ✅ HTML + プレーンテキストのマルチパートメール
- ✅ Lark通知との並列処理
- ✅ エラーハンドリング（メール送信失敗時もフォーム送信は成功）

**次のステップ**:
1. GASスクリプトの実装とデプロイ
2. Gmail設定で送信元アドレス追加
3. Next.js側のコード実装
4. テストとデバッグ
5. 本番環境デプロイ
