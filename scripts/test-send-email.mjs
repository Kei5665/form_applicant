// Gmail API 経由でテスト送信するスクリプト
//
// 使い方:
//   node --experimental-strip-types --experimental-transform-types \
//        --env-file=.env.local \
//        scripts/test-send-email.mjs <宛先メアド> [form-origin]
//
// 例:
//   node --experimental-strip-types --experimental-transform-types \
//        --env-file=.env.local \
//        scripts/test-send-email.mjs kiichi@pmagent.jp default
//
// form-origin の値: default | bus | mechanic | mechanic_newgrad
//   - default / bus              → RIDEJOB版のメールが届く
//   - mechanic / mechanic_newgrad → メカニック版のメールが届く

import { sendApplicationConfirmationEmail } from '../src/lib/email/send-application-confirmation.ts';

const recipient = process.argv[2];
const formOrigin = process.argv[3] || 'default';

if (!recipient) {
  console.error('❌ 宛先メアドが指定されていません');
  console.error('');
  console.error('Usage:');
  console.error('  node --experimental-strip-types --experimental-transform-types \\');
  console.error('       --env-file=.env.local \\');
  console.error('       scripts/test-send-email.mjs <宛先> [form-origin]');
  process.exit(1);
}

const validOrigins = ['default', 'bus', 'mechanic', 'mechanic_newgrad'];
if (!validOrigins.includes(formOrigin)) {
  console.error(`❌ 不正な form-origin: ${formOrigin}`);
  console.error(`   有効な値: ${validOrigins.join(' | ')}`);
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Gmail API テスト送信');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  宛先 (To)        :', recipient);
console.log('  フォーム種別     :', formOrigin);
console.log('  送信元 (From)    :', process.env.GMAIL_SENDER_EMAIL || '(未設定)');
console.log('  Service Account  :', process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 ? '✓ 設定あり' : '✗ 未設定');
console.log('  CC               :', process.env.GMAIL_CC || '(なし)');
console.log('  BCC              :', process.env.GMAIL_BCC || '(なし)');
console.log('  DRY_RUN          :', process.env.EMAIL_DRY_RUN === 'true' ? '⚠️ ON (実送信されません)' : 'OFF (実送信します)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('送信中...');
console.log('');

const startedAt = Date.now();
const result = await sendApplicationConfirmationEmail({
  to: recipient,
  applicantName: 'テスト 太郎',
  applicantNameKana: 'てすと たろう',
  phoneNumber: '090-0000-0000',
  email: recipient,
  formOrigin,
});
const elapsedMs = Date.now() - startedAt;

console.log(`  所要時間: ${elapsedMs}ms`);
console.log('');

if (result.sent) {
  console.log('✅ 送信成功');
  console.log('  Gmail messageId:', result.messageId);
  console.log('');
  console.log('  → ' + recipient + ' の受信箱を確認してください');
  console.log('  → 迷惑メールフォルダもチェック');
} else if (result.reason === 'error') {
  console.log('❌ 送信失敗');
  console.log('');
  console.log('  エラー:', result.error);
  console.log('');
  console.log('  よくある原因:');
  console.log('    - DWD 設定が未反映 (5〜10分待ってから再試行)');
  console.log('    - スコープが gmail.send 以外 (Workspace側を再確認)');
  console.log('    - 送信元アドレス (' + process.env.GMAIL_SENDER_EMAIL + ') がWorkspaceに実在しない');
  console.log('    - クライアントIDの登録ミス');
  process.exit(2);
} else {
  console.log('⚠️ スキップ');
  console.log('  reason:', result.reason);
}
