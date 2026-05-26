/**
 * Gmail API クライアント
 *
 * 認証方式: Service Account + Domain-Wide Delegation
 *   - GCP のサービスアカウントを Workspace 管理コンソールで
 *     スコープ `https://www.googleapis.com/auth/gmail.send` のみ許可しておく
 *   - 実行時に `GMAIL_SENDER_EMAIL` (例: yui@pmagent.jp) を impersonate して送信
 *
 * 必要な環境変数:
 *   - GOOGLE_SERVICE_ACCOUNT_KEY_BASE64  サービスアカウントJSONをbase64化したもの
 *     (または GOOGLE_SERVICE_ACCOUNT_KEY に生JSONを格納)
 *   - GMAIL_SENDER_EMAIL                 送信元 (impersonate対象) のメールアドレス
 */

import { JWT } from 'google-auth-library';

type ServiceAccountKey = {
  client_email: string;
  private_key: string;
};

let cachedKey: ServiceAccountKey | null = null;
let cachedJwtClient: JWT | null = null;
let cachedJwtSubject: string | null = null;

function loadServiceAccountKey(): ServiceAccountKey {
  if (cachedKey) return cachedKey;

  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!b64 && !raw) {
    throw new Error(
      'GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 (or GOOGLE_SERVICE_ACCOUNT_KEY) is not set.'
    );
  }

  const jsonText = b64
    ? Buffer.from(b64, 'base64').toString('utf-8')
    : (raw as string);

  let parsed: { client_email?: string; private_key?: string };
  try {
    parsed = JSON.parse(jsonText) as { client_email?: string; private_key?: string };
  } catch {
    throw new Error('Service account key is not valid JSON.');
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('Service account key JSON is missing client_email or private_key.');
  }

  cachedKey = {
    client_email: parsed.client_email,
    // PEM の改行が `\n` に化けているケースに対応
    private_key: parsed.private_key.replace(/\\n/g, '\n'),
  };
  return cachedKey;
}

function getJwtClient(impersonateEmail: string): JWT {
  if (cachedJwtClient && cachedJwtSubject === impersonateEmail) {
    return cachedJwtClient;
  }
  const key = loadServiceAccountKey();
  cachedJwtClient = new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: impersonateEmail,
  });
  cachedJwtSubject = impersonateEmail;
  return cachedJwtClient;
}

/**
 * RFC 2047 (encoded-word, B-encoding) を使って、非ASCIIを含むヘッダー値をエンコードする。
 * ASCIIのみであればそのまま返す。
 */
export function encodeMimeWord(value: string): string {
  // ASCII (printable) のみならエンコード不要
  if (/^[\x20-\x7e]*$/.test(value)) return value;
  const base64 = Buffer.from(value, 'utf-8').toString('base64');
  return `=?UTF-8?B?${base64}?=`;
}

function toBase64Url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * multipart/alternative (text + html) の MIME メッセージを組み立て、
 * Gmail API の `raw` フィールドに渡せる base64url 文字列を返す。
 *
 * BCC について:
 *   Bcc ヘッダーを raw メッセージに含めると、Gmail API は BCC 宛にも配信し、
 *   かつ To/Cc 宛の受信メッセージからは Bcc ヘッダーを削除して配信する。
 */
export function buildMimeMessage(opts: {
  from: string;
  fromName?: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  textBody: string;
  htmlBody: string;
}): string {
  const boundary = `___boundary_${Math.random().toString(36).slice(2)}_${Date.now()}___`;
  const fromHeader = opts.fromName
    ? `${encodeMimeWord(opts.fromName)} <${opts.from}>`
    : opts.from;

  const headerLines: string[] = [
    `From: ${fromHeader}`,
    `To: ${opts.to}`,
  ];

  if (opts.cc && opts.cc.length > 0) {
    headerLines.push(`Cc: ${opts.cc.join(', ')}`);
  }
  if (opts.bcc && opts.bcc.length > 0) {
    headerLines.push(`Bcc: ${opts.bcc.join(', ')}`);
  }

  headerLines.push(
    `Subject: ${encodeMimeWord(opts.subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  );

  const lines: string[] = [
    ...headerLines,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(opts.textBody, 'utf-8').toString('base64'),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(opts.htmlBody, 'utf-8').toString('base64'),
    `--${boundary}--`,
    '',
  ];

  return toBase64Url(Buffer.from(lines.join('\r\n'), 'utf-8'));
}

/**
 * Gmail API の users.messages.send を呼んでメールを送信する。
 * 失敗時は throw する(呼び出し側で握り潰す前提)。
 */
export async function sendGmailMessage(opts: {
  to: string;
  /** 送信元 (impersonate対象)。例: support_team@pmagent.jp */
  from: string;
  fromName?: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  textBody: string;
  htmlBody: string;
}): Promise<{ messageId?: string }> {
  const auth = getJwtClient(opts.from);
  const tokenResp = await auth.getAccessToken();
  const accessToken = tokenResp.token;
  if (!accessToken) {
    throw new Error('Failed to obtain Gmail API access token.');
  }

  const raw = buildMimeMessage(opts);

  const url = `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(opts.from)}/messages/send`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!resp.ok) {
    const errorBody = await resp.text();
    throw new Error(`Gmail API send failed (${resp.status}): ${errorBody}`);
  }

  const json = (await resp.json()) as { id?: string };
  return { messageId: json.id };
}
