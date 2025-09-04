## 応募API（/api/applicants）テスト手順

### 概要
`/api/applicants` のローカルテスト方法をまとめたドキュメントです。ローカルWebhook受信サーバで送信内容を確認しつつ、複数ケースを一括送信できます。

### 前提条件
- Node.js 20+
- 依存関係インストール済み
```bash
npm install
```

### 使うスクリプト
- **ローカルWebhook受信**: `npm run webhook:local`（`scripts/local-webhook.mjs`）
- **応募APIテスト送信**: `npm run test:applicants`（`scripts/test-applicants.mjs`）

### 環境変数（推奨）
ローカルWebhookへ送る場合、以下を設定して起動します（本番起動でも `*_TEST` がフォールバックとして参照される実装です）。

```bash
LARK_WEBHOOK_URL_TEST=http://localhost:3333/lark \
LARK_BASE_WEBHOOK_URL_TEST=http://localhost:3333/base \
LARK_SEND_BASE_ONLY=false
```

### 手順
1) ローカルWebhookを起動
```bash
npm run webhook:local
# => http://localhost:3333 で待受（POSTを受信し標準出力に内容を表示）
```

2) アプリを本番モードで起動（推奨）
```bash
npm run build
LARK_WEBHOOK_URL_TEST=http://localhost:3333/lark \
LARK_BASE_WEBHOOK_URL_TEST=http://localhost:3333/base \
LARK_SEND_BASE_ONLY=false \
npm start
# => http://localhost:3000
```

3) 応募APIのテスト送信を実行
```bash
npm run test:applicants
```

### 期待される結果
- テストケース（5件）が順に送信され、すべて `200 OK` が返ること
- ターミナルのアプリ側ログに、受信UTMやメディア名の判定ログが出力されること
- ローカルWebhook側に `/lark`, `/base` へのPOST内容が表示されること

### よくあるハマりどころ
- **開発サーバ（`npm run dev`）で404になる**
  - Turbopack環境でAPIが404になるケースがあるため、テスト時は `npm run build && npm start` を推奨。
  - どうしてもdevで確認したい場合は、Turbopackをオフにするか、起動ポート（ログに表示）へ送ること。

### 異常系の確認例
- **Lark送信を抑止し、Baseのみ送る**
```bash
LARK_SEND_BASE_ONLY=true \
LARK_BASE_WEBHOOK_URL_TEST=http://localhost:3333/base \
npm start
```
  - Base用URL未設定時は `500`（実装で早期エラー）。

- **送信先ダウン時の挙動**
  - Lark/Baseいずれかが失敗しても、API応答は `200`（並列送信の結果はログ確認）。

### 参考
- 実装: `src/app/api/applicants/route.ts`
- テスト送信: `scripts/test-applicants.mjs`
- 受信確認: `scripts/local-webhook.mjs`


