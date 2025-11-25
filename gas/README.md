# Google Apps Script セットアップガイド

## 📋 概要

このGASスクリプトは、Coupangフォームの**メール送信専用**APIです。

**機能**:
- **確認メール送信API（POST）** - 応募者に確認メールを送信

**注意**:
- セミナー枠の取得は**既存のGAS API**を使用します（このスクリプトとは別）
- このGASは新しいプロジェクトとして作成してください

---

## 🚀 セットアップ手順

### ステップ1: Google Apps Scriptプロジェクトの作成

1. [Google Apps Script](https://script.google.com/)にアクセス
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を「Coupang Seminar API」などに変更

### ステップ2: コードの貼り付け

1. デフォルトの`Code.gs`ファイルを開く
2. 既存のコードを削除
3. `gas/Code.gs`の内容を全てコピー＆ペースト

### ステップ3: 設定の確認

#### 送信元メールアドレスの確認

23-24行目を確認（必要に応じて変更）：

```javascript
const FROM_EMAIL = 'yui@pmagent.jp';
const FROM_NAME = 'LIFT JOB 運営事務局';
```

**設定内容**:
- `FROM_EMAIL`: メールの送信元アドレス
- `FROM_NAME`: メールの差出人名

**注意**: セミナー枠データはこのGASで管理しません。既存のGAS APIから取得します。

### ステップ4: Gmailの設定

**`yui@pmagent.jp`を送信元として追加**:

1. Gmailを開く（GASを実行するGoogleアカウント）
2. 設定（⚙️）→「すべての設定を表示」
3. 「アカウントとインポート」タブ
4. 「名前」セクションの「他のメールアドレスを追加」をクリック
5. 以下を入力:
   - 名前: `LIFT JOB 運営事務局`
   - メールアドレス: `yui@pmagent.jp`
   - 「エイリアスとして扱います」にチェック
6. SMTP設定を入力（`yui@pmagent.jp`のメールサーバー情報）
7. 確認メールが`yui@pmagent.jp`に送信される
8. 確認リンクをクリックして認証完了

**Google Workspaceを使用している場合**:
- `yui@pmagent.jp`がGoogle Workspaceのメールアドレスなら、そのアカウントでGASを実行すればOK

### ステップ5: テスト実行

#### 5.1 メール送信テスト

1. GASエディタで`testSendEmail`関数を開く
2. 24行目の`'your-test-email@gmail.com'`を自分のメールアドレスに変更:

```javascript
function testSendEmail() {
  const result = sendConfirmationEmail({
    to: 'あなたのメールアドレス@gmail.com',  // ← ここを変更
    applicantName: '山田　太郎',
    seminarDate: '12月25日（水）10:00〜',
    zoomUrl: 'https://zoom.us/j/test123456',
    jobPosition: 'フィールドセールス（東京都）',
    phoneNumber: '090-1234-5678'
  });

  Logger.log('Test result: ' + JSON.stringify(result));
}
```

3. 関数選択ドロップダウンから`testSendEmail`を選択
4. 「実行」ボタンをクリック
5. 初回実行時は権限の承認が必要:
   - 「権限を確認」をクリック
   - Googleアカウントを選択
   - 「詳細」→「安全でないページに移動」
   - 「許可」をクリック
6. メールが届くか確認

### ステップ6: ウェブアプリとしてデプロイ

1. 「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」→「ウェブアプリ」を選択
3. 設定:
   - **説明**: 「Coupang Seminar API v1.0」（任意）
   - **次のユーザーとして実行**: **自分**
   - **アクセスできるユーザー**: **全員**
4. 「デプロイ」をクリック
5. **ウェブアプリのURL**をコピー

**URLの形式**:
```
https://script.google.com/macros/s/AKfycby.../exec
```

### ステップ7: 環境変数の設定

コピーしたURLをNext.jsの環境変数に設定：

**`.env.local`**:
```bash
# メール送信用GAS API（新規）⭐ このURLを設定してください
GAS_EMAIL_API_URL=https://script.google.com/macros/s/YOUR_NEW_DEPLOYMENT_ID/exec
```

**重要**:
- `GAS_EMAIL_API_URL`が設定されている場合のみメール送信が有効化されます
- 未設定の場合はメール送信がスキップされます（エラーにはなりません）
- セミナー枠取得は既存のGAS APIを使用します（`/api/coupang/seminar-slots`内でハードコード済み）

---

## 🧪 テスト方法

### curlでPOSTリクエストをテスト

```bash
curl -X POST "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec" \
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

### GETリクエストでステータス確認

ブラウザでデプロイURLにアクセスすると、APIのステータスページが表示されます：

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

このページでは以下の情報が確認できます：
- ✅ APIの動作状況
- 📋 API仕様とパラメータ一覧
- 🧪 テスト用curlコマンド

**注意**: セミナー枠の取得は既存のGAS APIを使用してください：
```bash
curl "https://script.google.com/macros/s/EXISTING_DEPLOYMENT_ID/exec"
```

---

## 🔧 カスタマイズ

### メールテンプレートの変更

HTMLメール: `createEmailHtml()`関数
プレーンテキスト: `createEmailText()`関数

メール本文を変更する場合は、これらの関数を編集してください。

---

## 🐛 トラブルシューティング

### メールが届かない

**確認項目**:
1. ✅ Gmail設定で`yui@pmagent.jp`が追加されているか
2. ✅ 確認メールの承認が完了しているか
3. ✅ `testSendEmail()`でテスト送信が成功するか
4. ✅ 迷惑メールフォルダに入っていないか
5. ✅ GASの実行ログにエラーがないか（「表示」→「ログ」）

### 送信元が`yui@pmagent.jp`にならない

**原因**: Gmailの設定が正しくない

**対策**:
1. Gmail設定を再確認
2. 別のGoogleアカウントでGASを実行していないか確認
3. `FROM_EMAIL`の設定を確認

### 権限エラーが出る

**エラー**: `Exception: You do not have permission to call GmailApp.sendEmail`

**対策**:
1. GASの実行で権限を承認
2. 「詳細」→「安全でないページに移動」をクリック
3. 必要な権限を全て許可

### セミナー枠について

このGASはセミナー枠を取得しません。

セミナー枠は**既存のGAS API**から取得してください。

### デプロイURLが動作しない

**確認項目**:
1. ✅ 「アクセスできるユーザー」が「全員」になっているか
2. ✅ 最新バージョンがデプロイされているか
3. ✅ URLが正しくコピーされているか（末尾の`/exec`を含む）

---

## 📊 ログの確認方法

### GASエディタでログを確認

1. 「表示」→「ログ」をクリック
2. または「実行」→「実行ログ」

### ログの内容

**POST（メール送信）正常時**:
```
doPost called
Request data: {"to":"test@example.com",...}
Validation passed. Sending email to: test@example.com
Gmail sent successfully to: test@example.com
Email sent successfully
```

**エラー時**:
```
Error in doPost: [エラーメッセージ]
```

---

## 🔄 デプロイの更新

コードを変更した後、新しいバージョンをデプロイ：

1. 「デプロイ」→「デプロイを管理」
2. 既存のデプロイの「編集（鉛筆アイコン）」をクリック
3. 「バージョン」を「新バージョン」に変更
4. 「デプロイ」をクリック

**注意**: URLは変わらないので、Next.jsの環境変数は変更不要

---

## 📝 制限事項

### Gmail送信制限

| アカウント種類 | 制限 |
|--------------|------|
| 個人Gmail | 100通/日 |
| Google Workspace | 2,000通/日 |

### GASの実行制限

| 項目 | 制限 |
|-----|------|
| 実行時間 | 6分/回 |
| トリガー実行時間 | 90分/日 |
| URL Fetch呼び出し | 20,000回/日 |

---

## 🔐 セキュリティ

### ベストプラクティス

1. ✅ GASのプロジェクトは適切な権限管理
2. ✅ 機密情報はGASのプロパティストアに保存
3. ✅ ログに個人情報を出力しない
4. ✅ デプロイURLは環境変数で管理

### 本番運用時の注意

1. テスト環境と本番環境でGASプロジェクトを分ける
2. 定期的にログを確認
3. 送信数を監視（制限に達していないか）

---

## 📞 サポート

### 関連ドキュメント

- [Google Apps Script - GmailApp](https://developers.google.com/apps-script/reference/gmail/gmail-app)
- [Google Apps Script - Web Apps](https://developers.google.com/apps-script/guides/web)
- [Gmail - 他のメールアドレスを追加](https://support.google.com/mail/answer/22370)

### テスト関数一覧

| 関数名 | 説明 |
|-------|------|
| `testSendEmail()` | メール送信のテスト |
| `testEmailValidation()` | メールアドレスバリデーションのテスト |

---

## ✅ セットアップチェックリスト

- [ ] Google Apps Scriptプロジェクト作成（新規）
- [ ] `Code.gs`のコードを貼り付け
- [ ] `FROM_EMAIL`を確認
- [ ] Gmail設定で`yui@pmagent.jp`を追加
- [ ] 確認メールを承認
- [ ] `testSendEmail()`でテスト実行
- [ ] メール受信確認
- [ ] ウェブアプリとしてデプロイ
- [ ] デプロイURLをコピー
- [ ] Next.jsの`.env.local`に`GAS_EMAIL_API_URL`を追加
- [ ] curlでPOSTテスト

---

これで、GASのセットアップは完了です！🎉
