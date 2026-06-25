// Lark Bitable(Base)へレコードを作成する軽量クライアント。
// tenant_access_token を取得 →（プロセス内キャッシュ）→ 指定テーブルへ records 作成。
// 認証は MECHANIC アプリ（APP_ID_MECHANIC / APP_SECRET_MECHANIC / APP_TOKEN_MECHANIC）。
// Webhook 方式と異なり、フィールドを直接指定して書けるのが利点。

interface LarkBaseConfig {
  domain: string;
  appId: string;
  appSecret: string;
  appToken: string;
}

// Bitable のフィールド値。Text/Select=string、MultiSelect=string[]、Number/DateTime=number、Checkbox=boolean。
export type LarkFieldValue = string | number | boolean | string[];

interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}

let tokenCache: TokenCache | null = null;

function readConfig(): LarkBaseConfig | null {
  const domain = (process.env.LARK_DOMAIN_MECHANIC || "https://open.larksuite.com").replace(/\/+$/, "");
  const appId = process.env.APP_ID_MECHANIC;
  const appSecret = process.env.APP_SECRET_MECHANIC;
  const appToken = process.env.APP_TOKEN_MECHANIC;
  if (!appId || !appSecret || !appToken) return null;
  return { domain, appId, appSecret, appToken };
}

// 認証情報が揃っているか。未設定なら呼び出し側で Base 登録をスキップできる
// （本番に env がまだ無い状態でデプロイされてもフォームを止めないため）。
export function isLarkBaseConfigured(): boolean {
  return readConfig() !== null;
}

async function fetchTenantAccessToken(cfg: LarkBaseConfig): Promise<string> {
  const now = Date.now();
  // 期限の30秒前までは使い回す。
  if (tokenCache && tokenCache.expiresAt > now + 30_000) return tokenCache.token;

  const res = await fetch(`${cfg.domain}/open-apis/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ app_id: cfg.appId, app_secret: cfg.appSecret }),
    signal: AbortSignal.timeout(5000),
  });
  const data = (await res.json().catch(() => ({}))) as {
    code?: number;
    tenant_access_token?: string;
    expire?: number; // 秒
    msg?: string;
  };
  if (!res.ok || data.code !== 0 || !data.tenant_access_token) {
    throw new Error(`tenant_access_token 取得失敗: code=${data.code} msg=${data.msg}`);
  }
  tokenCache = {
    token: data.tenant_access_token,
    expiresAt: now + (data.expire ?? 7200) * 1000,
  };
  return tokenCache.token;
}

async function postRecord(
  cfg: LarkBaseConfig,
  token: string,
  tableId: string,
  fields: Record<string, LarkFieldValue>
): Promise<{ code?: number; msg?: string; ok: boolean }> {
  const url = `${cfg.domain}/open-apis/bitable/v1/apps/${cfg.appToken}/tables/${tableId}/records`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ fields }),
    signal: AbortSignal.timeout(5000),
  });
  const data = (await res.json().catch(() => ({}))) as { code?: number; msg?: string };
  return { code: data.code, msg: data.msg, ok: res.ok };
}

// 指定テーブルにレコードを1件作成する。失敗時は throw。
// undefined / 空文字のフィールドは送信しない。
export async function createBaseRecord(
  tableId: string,
  fields: Record<string, LarkFieldValue | undefined>
): Promise<void> {
  const cfg = readConfig();
  if (!cfg) throw new Error("Lark Base 認証情報（APP_ID_MECHANIC / APP_SECRET_MECHANIC / APP_TOKEN_MECHANIC）が未設定です。");

  const cleaned: Record<string, LarkFieldValue> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== "") cleaned[k] = v;
  }

  let token = await fetchTenantAccessToken(cfg);
  let result = await postRecord(cfg, token, tableId, cleaned);

  // トークン失効（99991661/99991663 など）時はキャッシュを捨てて1度だけ再試行。
  if (!result.ok || (typeof result.code !== "undefined" && result.code !== 0)) {
    if (result.code === 99991661 || result.code === 99991663) {
      tokenCache = null;
      token = await fetchTenantAccessToken(cfg);
      result = await postRecord(cfg, token, tableId, cleaned);
    }
  }

  if (!result.ok || (typeof result.code !== "undefined" && result.code !== 0)) {
    throw new Error(`Base レコード作成失敗: code=${result.code} msg=${result.msg}`);
  }
}
