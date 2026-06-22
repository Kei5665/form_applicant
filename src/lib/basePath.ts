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
