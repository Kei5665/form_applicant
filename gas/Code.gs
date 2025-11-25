/**
 * ========================================
 * Coupang メール送信 API（メール送信専用）
 * ========================================
 *
 * 機能:
 * POST: 確認メールの送信
 *
 * 注意:
 * - このGASは既存のGAS API（セミナー枠取得）とは別のプロジェクトです
 * - セミナー枠の取得は既存のGAS APIを使用してください
 *
 * デプロイ: ウェブアプリとして公開
 * アクセス: 全員
 */

// ========================================
// 設定
// ========================================

// 送信元メールアドレス
// ※事前にGmailの設定で yui@pmagent.jp を追加しておく必要があります
const FROM_EMAIL = 'yui@pmagent.jp';
const FROM_NAME = 'LIFT JOB 運営事務局';

// ========================================
// メインハンドラー
// ========================================

/**
 * GETリクエストハンドラー（ステータス表示）
 */
function doGet(e) {
  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Coupang メール送信 API</title>
      <style>
        body {
          font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #ff6b35;
          border-bottom: 3px solid #ff6b35;
          padding-bottom: 10px;
        }
        .status {
          background: #e8f5e9;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .status-icon {
          font-size: 24px;
          margin-right: 10px;
        }
        code {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Monaco', 'Courier New', monospace;
        }
        pre {
          background: #263238;
          color: #aed581;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
        }
        .info-box {
          background: #fff3e0;
          padding: 15px;
          border-left: 4px solid #ff9800;
          margin: 20px 0;
        }
        .endpoint {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 4px;
          margin: 10px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #ff6b35;
          color: white;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Coupang メール送信 API</h1>
        
        <div class="status">
          <span class="status-icon">✅</span>
          <strong>ステータス:</strong> API は正常に動作しています
        </div>

        <h2>📋 API 仕様</h2>
        
        <div class="endpoint">
          <strong>エンドポイント:</strong><br>
          <code>POST ${ScriptApp.getService().getUrl()}</code>
        </div>

        <h3>リクエストパラメータ</h3>
        <table>
          <tr>
            <th>パラメータ</th>
            <th>型</th>
            <th>必須</th>
            <th>説明</th>
          </tr>
          <tr>
            <td><code>to</code></td>
            <td>string</td>
            <td>✅</td>
            <td>送信先メールアドレス</td>
          </tr>
          <tr>
            <td><code>applicantName</code></td>
            <td>string</td>
            <td>✅</td>
            <td>応募者氏名</td>
          </tr>
          <tr>
            <td><code>seminarDate</code></td>
            <td>string</td>
            <td>✅</td>
            <td>セミナー日時</td>
          </tr>
          <tr>
            <td><code>zoomUrl</code></td>
            <td>string</td>
            <td>✅</td>
            <td>Zoom URL</td>
          </tr>
          <tr>
            <td><code>jobPosition</code></td>
            <td>string</td>
            <td>✅</td>
            <td>応募職種</td>
          </tr>
          <tr>
            <td><code>phoneNumber</code></td>
            <td>string</td>
            <td>❌</td>
            <td>電話番号（オプション）</td>
          </tr>
        </table>

        <h3>リクエスト例</h3>
        <pre>
{
  "to": "test@example.com",
  "applicantName": "山田 太郎",
  "seminarDate": "12月25日（水）10:00〜",
  "zoomUrl": "https://zoom.us/j/123456789",
  "jobPosition": "フィールドセールス（東京都）",
  "phoneNumber": "090-1234-5678"
}</pre>

        <h3>レスポンス例（成功時）</h3>
        <pre>
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "xxx-xxx-xxx",
  "to": "test@example.com"
}</pre>

        <h3>レスポンス例（エラー時）</h3>
        <pre>
{
  "success": false,
  "error": "Missing required parameter: to"
}</pre>

        <div class="info-box">
          <strong>⚠️ 注意事項</strong>
          <ul>
            <li>このAPIはPOSTリクエストのみを受け付けます</li>
            <li>Content-Type: application/json を指定してください</li>
            <li>送信元メールアドレス（${FROM_EMAIL}）がGmailで設定されている必要があります</li>
          </ul>
        </div>

        <h2>🧪 テスト方法</h2>
        <p>curl コマンドを使用してテストできます：</p>
        <pre>
curl -X POST "${ScriptApp.getService().getUrl()}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "your-email@example.com",
    "applicantName": "山田 太郎",
    "seminarDate": "12月25日（水）10:00〜",
    "zoomUrl": "https://zoom.us/j/123456789",
    "jobPosition": "フィールドセールス（東京都）"
  }'</pre>

        <hr style="margin: 30px 0;">
        <p style="text-align: center; color: #666; font-size: 14px;">
          © 2025 LIFT JOB 運営事務局 | 株式会社PMAgent
        </p>
      </div>
    </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html);
}

/**
 * POSTリクエストハンドラー（メール送信）
 * 新規機能
 */
function doPost(e) {
  try {
    Logger.log('doPost called');
    Logger.log('Request data: ' + e.postData.contents);

    // リクエストボディをパース
    const data = JSON.parse(e.postData.contents);

    // 必須パラメータの検証
    const {
      to,
      applicantName,
      seminarDate,
      zoomUrl,
      jobPosition,
      phoneNumber
    } = data;

    // バリデーション
    if (!to) {
      return createErrorResponse('Missing required parameter: to');
    }
    if (!applicantName) {
      return createErrorResponse('Missing required parameter: applicantName');
    }
    if (!seminarDate) {
      return createErrorResponse('Missing required parameter: seminarDate');
    }
    if (!zoomUrl) {
      return createErrorResponse('Missing required parameter: zoomUrl');
    }
    if (!jobPosition) {
      return createErrorResponse('Missing required parameter: jobPosition');
    }

    // メールアドレスのバリデーション
    if (!isValidEmail(to)) {
      return createErrorResponse('Invalid email address: ' + to);
    }

    Logger.log('Validation passed. Sending email to: ' + to);

    // メール送信
    const result = sendConfirmationEmail({
      to,
      applicantName,
      seminarDate,
      zoomUrl,
      jobPosition,
      phoneNumber
    });

    Logger.log('Email sent successfully');

    return createSuccessResponse({
      message: 'Email sent successfully',
      messageId: result.messageId,
      to: to
    });

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createErrorResponse('Failed to send email: ' + error.toString());
  }
}

// ========================================
// メール送信
// ========================================

/**
 * 確認メール送信
 */
function sendConfirmationEmail(params) {
  const {
    to,
    applicantName,
    seminarDate,
    zoomUrl,
    jobPosition,
    phoneNumber
  } = params;

  // メール件名
  const subject = '【ロケットナウ】セミナーお申込み完了のご案内';

  // メール本文（HTML）
  const htmlBody = createEmailHtml({
    applicantName,
    seminarDate,
    zoomUrl,
    jobPosition
  });

  // メール本文（プレーンテキスト）
  const plainBody = createEmailText({
    applicantName,
    seminarDate,
    zoomUrl,
    jobPosition
  });

  // Gmail送信
  try {
    GmailApp.sendEmail(to, subject, plainBody, {
      htmlBody: htmlBody,
      from: FROM_EMAIL,
      name: FROM_NAME,
      noReply: false
    });

    Logger.log('Gmail sent successfully to: ' + to);

    return {
      success: true,
      messageId: Utilities.getUuid(), // ダミーのメッセージID
      to: to
    };
  } catch (error) {
    Logger.log('Gmail send error: ' + error.toString());
    throw new Error('Failed to send Gmail: ' + error.toString());
  }
}

// ========================================
// メールテンプレート
// ========================================

/**
 * HTMLメール本文作成
 */
function createEmailHtml(data) {
  const { applicantName, seminarDate, zoomUrl, jobPosition } = data;

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif;
      line-height: 1.8;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #ff6b35;
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 0;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: bold;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .info-box {
      background-color: #f9f9f9;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #ff6b35;
      border-radius: 4px;
    }
    .info-box h2 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #ff6b35;
      font-size: 18px;
    }
    .info-box p {
      margin: 10px 0;
    }
    .highlight {
      font-size: 18px;
      font-weight: bold;
      color: #333;
      margin: 15px 0;
    }
    .button-container {
      text-align: center;
      margin: 25px 0;
    }
    .button {
      display: inline-block;
      background-color: #ff6b35;
      color: white !important;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      font-size: 16px;
    }
    .button:hover {
      background-color: #e55a2b;
    }
    .zoom-url {
      font-size: 12px;
      color: #999;
      word-break: break-all;
      margin-top: 15px;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    .important {
      color: #ff6b35;
      font-weight: bold;
    }
    .note {
      font-size: 12px;
      color: #666;
      text-align: center;
      margin-top: 10px;
    }
    ul {
      padding-left: 20px;
      margin: 10px 0;
    }
    li {
      margin-bottom: 10px;
    }
    .footer {
      background-color: #f5f5f5;
      text-align: center;
      color: #666;
      font-size: 12px;
      padding: 20px;
      border-top: 1px solid #ddd;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: #ff6b35;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ セミナーお申込み完了 ✨</h1>
    </div>

    <div class="content">
      <div class="greeting">
        <p><strong>${applicantName}</strong> 様</p>
        <p>この度は、ロケットナウ採用セミナーにお申込みいただき、誠にありがとうございます。</p>
      </div>

      <div class="info-box">
        <h2>📅 セミナー日程</h2>
        <p class="highlight">${seminarDate}</p>
        <p style="color: #666; font-size: 14px;">応募職種: ${jobPosition}</p>
      </div>

      <div class="info-box">
        <h2>💻 参加方法</h2>
        <p>セミナー当日は、以下のZoomリンクよりご参加ください。</p>
        <div class="button-container">
          <a href="${zoomUrl}" class="button">Zoomセミナーに参加する</a>
        </div>
        <p class="note">※リンクをクリックすると、Zoomが起動します</p>
        <div class="zoom-url">
          Zoom URL: ${zoomUrl}
        </div>
      </div>

      <div class="info-box">
        <h2>⚠️ 参加前の準備</h2>
        <ul>
          <li><span class="important">セミナー開始5分前</span>には入室をお願いいたします</li>
          <li><span class="important">電話番号の下4桁</span>をご準備ください</li>
          <li><span class="important">簡単な自己紹介</span>をご準備ください</li>
          <li><span class="important">職種の志望理由</span>をご準備ください</li>
          <li>服装は<span class="important">スーツまたはオフィスカジュアル</span>でお願いします（スーツ推奨）</li>
        </ul>
      </div>

      <div class="info-box">
        <h2>📌 セミナー内容（30〜60分）</h2>
        <ul>
          <li>
            <strong>会社および職務説明</strong>（約20〜30分）<br>
            <span style="font-size: 14px; color: #666;">
              ロケットナウの事業概要や募集職種の仕事内容についてご説明します。
            </span>
          </li>
          <li style="margin-top: 10px;">
            <strong>面接</strong>（約5分）<br>
            <span style="font-size: 14px; color: #666;">
              オンライン面接形式で実施します。
            </span>
          </li>
        </ul>
      </div>

      <div class="info-box">
        <h2>📋 求人情報</h2>
        <ul style="list-style-type: none; padding-left: 0;">
          <li style="margin-bottom: 15px;">
            <strong>フィールドセールス（大阪府）</strong><br>
            <a href="https://ridejob.jp/job/y2qx1ngsh" style="color: #ff6b35; font-size: 14px; word-break: break-all;">
              https://ridejob.jp/job/y2qx1ngsh
            </a>
          </li>
          <li style="margin-bottom: 15px;">
            <strong>フィールドセールス（東京都）</strong><br>
            <a href="https://ridejob.jp/job/9ndalsv3lmx" style="color: #ff6b35; font-size: 14px; word-break: break-all;">
              https://ridejob.jp/job/9ndalsv3lmx
            </a>
          </li>
          <li style="margin-bottom: 15px;">
            <strong>アカウントマネージャー（東京都）</strong><br>
            <a href="https://ridejob.jp/job/e38_jj8p495a" style="color: #ff6b35; font-size: 14px; word-break: break-all;">
              https://ridejob.jp/job/e38_jj8p495a
            </a>
          </li>
        </ul>
      </div>

      <p style="margin-top: 30px;">ご不明な点がございましたら、お気軽にお問い合わせください。</p>
      <p style="font-weight: bold;">当日お会いできることを楽しみにしております。</p>
    </div>

    <div class="footer">
      <p>────────────────────</p>
      <p><strong>株式会社PMAgent</strong></p>
      <p>LIFT JOB 運営事務局</p>
      <p>Email: <a href="mailto:yui@pmagent.jp">yui@pmagent.jp</a></p>
      <p>Web: <a href="https://pmagent.jp/">https://pmagent.jp/</a></p>
      <p>────────────────────</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * プレーンテキストメール本文作成
 */
function createEmailText(data) {
  const { applicantName, seminarDate, zoomUrl, jobPosition } = data;

  return `
${applicantName} 様

この度は、ロケットナウ採用セミナーにお申込みいただき、誠にありがとうございます。

━━━━━━━━━━━━━━━━━━━━━━━━
📅 セミナー日程
━━━━━━━━━━━━━━━━━━━━━━━━
${seminarDate}
応募職種: ${jobPosition}

━━━━━━━━━━━━━━━━━━━━━━━━
💻 参加方法
━━━━━━━━━━━━━━━━━━━━━━━━
セミナー当日は、以下のZoomリンクよりご参加ください。

${zoomUrl}

━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ 参加前の準備
━━━━━━━━━━━━━━━━━━━━━━━━
- セミナー開始5分前には入室をお願いいたします
- 電話番号の下4桁をご準備ください
- 簡単な自己紹介をご準備ください
- 職種の志望理由をご準備ください
- 服装はスーツまたはオフィスカジュアルでお願いします（スーツ推奨）

━━━━━━━━━━━━━━━━━━━━━━━━
📌 セミナー内容（30〜60分）
━━━━━━━━━━━━━━━━━━━━━━━━
- 会社および職務説明（約20〜30分）
  ロケットナウの事業概要や募集職種の仕事内容についてご説明します。

- 面接（約5分）
  オンライン面接形式で実施します。

━━━━━━━━━━━━━━━━━━━━━━━━
📋 求人情報
━━━━━━━━━━━━━━━━━━━━━━━━
・フィールドセールス（大阪府）
  https://ridejob.jp/job/y2qx1ngsh

・フィールドセールス（東京都）
  https://ridejob.jp/job/9ndalsv3lmx

・アカウントマネージャー（東京都）
  https://ridejob.jp/job/e38_jj8p495a

ご不明な点がございましたら、お気軽にお問い合わせください。
当日お会いできることを楽しみにしております。

────────────────────
株式会社PMAgent
LIFT JOB 運営事務局
Email: yui@pmagent.jp
Web: https://pmagent.jp/
────────────────────
  `;
}


// ========================================
// ユーティリティ関数
// ========================================

/**
 * メールアドレスのバリデーション
 */
function isValidEmail(email) {
  if (!email) return false;

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * 成功レスポンス作成
 */
function createSuccessResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      ...data
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * エラーレスポンス作成
 */
function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: message
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// テスト関数
// ========================================

/**
 * メール送信のテスト
 *
 * 使い方:
 * 1. 下記の 'your-test-email@gmail.com' を自分のメールアドレスに変更
 * 2. GASエディタで実行
 * 3. メールが届くか確認
 */
function testSendEmail() {
  const result = sendConfirmationEmail({
    to: 'your-test-email@gmail.com',  // ← 自分のメールアドレスに変更
    applicantName: '山田　太郎',
    seminarDate: '12月25日（水）10:00〜',
    zoomUrl: 'https://zoom.us/j/test123456',
    jobPosition: 'フィールドセールス（東京都）',
    phoneNumber: '090-1234-5678'
  });

  Logger.log('Test result: ' + JSON.stringify(result));
}


/**
 * メールアドレスバリデーションのテスト
 */
function testEmailValidation() {
  Logger.log('test@example.com: ' + isValidEmail('test@example.com')); // true
  Logger.log('invalid-email: ' + isValidEmail('invalid-email')); // false
  Logger.log('empty: ' + isValidEmail('')); // false
  Logger.log('null: ' + isValidEmail(null)); // false
}
