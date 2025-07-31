# RIDE JOB 応募フォーム

タクシー運転手の転職支援サービス「ライドジョブ」の応募フォームアプリケーションです。

## 概要

未経験者向けタクシー運転手転職支援サービスの3ステップ応募フォームです。モバイルファーストのレスポンシブデザインで、直感的な操作でスムーズな応募が可能です。

## 主な機能

### 3ステップ応募フォーム
- **STEP1**: 生まれ年（西暦4桁）の入力
- **STEP2**: 氏名（漢字・ひらがな）の入力
- **STEP3**: 郵便番号・携帯番号の入力

### バリデーション機能
- リアルタイム入力検証
- 携帯番号の詳細チェック
  - 070/080/090から始まる11桁の検証
  - 連続する同じ数字（5桁以上）の検出
  - 順序数字パターンの検出
  - 既知の無効番号パターンの検出

### 外部連携
- Lark Webhookへの自動通知
- Google Tag Manager統合（GTM-5CQGTMXF）

### UI/UX
- ローディング画面
- カードベースのステップナビゲーション
- レスポンシブデザイン
- エラーメッセージの表示

## 技術スタック

- **フレームワーク**: Next.js 15.3.1
- **言語**: TypeScript
- **UI**: React 19
- **スタイリング**: Tailwind CSS v4
- **開発環境**: Turbopack
- **コード品質**: ESLint

## セットアップ

### 必要な環境
- Node.js 20以上
- npm

### インストール
```bash
npm install
```

### 環境変数設定
`.env.local`ファイルを作成し、以下を設定：
```
LARK_WEBHOOK_URL=your_lark_webhook_url_here
```

### 開発サーバー起動
```bash
npm run dev
```
http://localhost:3000 でアクセス可能

### ビルド
```bash
npm run build
```

### 本番環境起動
```bash
npm start
```

## ファイル構成

```
src/
├── app/
│   ├── api/
│   │   └── applicants/
│   │       └── route.ts          # フォーム送信API
│   ├── applicants/
│   │   └── new/
│   │       └── page.tsx          # 申込完了画面
│   ├── favicon.ico
│   ├── globals.css               # グローバルスタイル
│   ├── layout.tsx                # ルートレイアウト（GTM設定含む）
│   └── page.tsx                  # メインフォーム画面
```

## API エンドポイント

### POST /api/applicants
申込フォームデータをLark Webhookに送信

**リクエストボディ:**
```json
{
  "birthYear": "1990",
  "lastName": "田中",
  "firstName": "太郎",
  "lastNameKana": "たなか",
  "firstNameKana": "たろう",
  "postalCode": "1234567",
  "phoneNumber": "09012345678"
}
```

**レスポンス:**
```json
{
  "message": "Application submitted successfully!"
}
```

## 開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Linting
npm run lint
```

## セキュリティ機能

- 入力値の厳密なバリデーション
- 不正な携帯番号パターンの検出・通知
- XSS対策（Next.jsの標準機能）
- CSRF対策（Next.jsの標準機能）

## パフォーマンス

- Next.js App Routerによる最適化
- Turbopackによる高速開発環境
- 画像最適化（Next.js Image）
- Code Splitting自動適用

## ブラウザサポート

- Chrome（最新版）
- Firefox（最新版）
- Safari（最新版）
- Edge（最新版）

## ライセンス

© 2025 株式会社PMAgent

## 連絡先

- 運営会社: [株式会社PMAgent](https://pmagent.jp/)
- プライバシーポリシー: [Privacy Policy](https://saiyocommon.com/pmagent/privacy-policy)