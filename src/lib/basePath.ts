/**
 * マルチゾーン配信用のベースパス。
 * ridejob.jp 配下に複製デプロイする際だけ環境変数 NEXT_PUBLIC_BASE_PATH=/entry を設定する。
 * 既存の ridejob.pmagent.jp（単独ドメイン）デプロイでは未設定＝空のまま（挙動不変）。
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/**
 * 内部API等の絶対パスにベースパスを前置する。
 * Next.js の basePath は fetch の絶対パス（/api/...）を自動補完しないため、クライアントからのAPI呼び出しはこれを通す。
 */
export const apiPath = (p: string): string => `${BASE_PATH}${p}`;

/**
 * /public 配下の静的アセット（/images/... 等）の絶対パスにベースパスを前置する。
 * basePath 配下では public は `${BASE_PATH}/...` で配信されるが、next/image の url パラメータや
 * 生の img.src・CSS url() には basePath が自動補完されないため、これを通す。
 */
export const assetPath = (p: string): string => `${BASE_PATH}${p}`;
