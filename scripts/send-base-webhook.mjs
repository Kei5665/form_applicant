// 実行例:
//   node scripts/send-base-webhook.mjs --url "https://<your-base-webhook>"
//   node scripts/send-base-webhook.mjs --url "..." --body-file payload.json
//   LARK_BASE_WEBHOOK_URL="..." node scripts/send-base-webhook.mjs

import fs from 'node:fs/promises';

const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : undefined;
};

const webhookUrl = getArg('url') || process.env.LARK_BASE_WEBHOOK_URL;
const bodyFile = getArg('body-file');

if (!webhookUrl) {
  console.error('Error: Webhook URL が未指定です。--url か環境変数 LARK_BASE_WEBHOOK_URL を指定してください。');
  process.exit(1);
}

let payload;
if (bodyFile) {
  try {
    const json = await fs.readFile(bodyFile, 'utf-8');
    payload = JSON.parse(json);
  } catch (e) {
    console.error(`Error: --body-file の読み込みに失敗しました: ${e.message}`);
    process.exit(1);
  }
} else {
  payload = {
    media_name: 'テスト媒体',
    utm_source: 'test',
    utm_medium: 'test',
    utm_campaign: 'test-campaign',
    utm_term: '',
    birth_date: '1990-01-01',
    last_name: '田中',
    first_name: '太郎',
    last_name_kana: 'たなか',
    first_name_kana: 'たろう',
    postal_code: '1234567',
    phone_number: '09012345678',
    experiment_name: 'people_image',
    experiment_variant: 'A',
    submitted_at: new Date().toISOString(),
    environment: 'development',
    user_agent: 'base-webhook-test-script',
    client_ip: '127.0.0.1'
  };
}

console.log('POST URL:', webhookUrl);
console.log('Payload:', payload);

try {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  console.log('Status:', res.status, res.statusText);
  console.log('Response:', text);
  if (!res.ok) process.exit(2);
} catch (e) {
  console.error('Request Error:', e);
  process.exit(3);
}



