'use client';

import NextImage, { type ImageProps } from 'next/image';

import { assetPath } from '@/lib/basePath';

/**
 * next/image のラッパー。
 *
 * basePath 配下（NEXT_PUBLIC_BASE_PATH=/entry）では /public 画像が `${BASE_PATH}/...` で配信されるが、
 * next/image は src（最適化URLの url パラメータ、SVG等の生src）に basePath を自動補完しない。
 * そのため文字列の絶対パス src（/images/... 等）に BASE_PATH を前置する。
 * リモートURL（http...）や StaticImport（importした画像オブジェクト）はそのまま渡す。
 *
 * BASE_PATH 未設定（pmagent.jp）では assetPath が素通しになるため挙動は不変。
 */
export default function Image(props: ImageProps) {
  const { src } = props;
  if (typeof src === 'string' && src.startsWith('/')) {
    return <NextImage {...props} src={assetPath(src)} />;
  }
  return <NextImage {...props} />;
}
