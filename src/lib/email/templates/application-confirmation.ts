/**
 * RIDE JOB / RIDE JOBメカニック 応募者向け 自動配信メール テンプレート
 *
 * デザイン: AIDMA Academy 風 ──「MESSAGE ─── RIDE JOBより」の小見出し、
 *           ゴールド(#a18a5c)アクセント、黒の CTA ボタン、ベージュ系のトーン。
 *
 * 文面はフォーム種別ごとに差し替え可能。
 * 編集する場合は下の RIDEJOB_CONTENT / MECHANIC_CONTENT を直接書き換えてください。
 *
 *   - default / bus              → RIDEJOB_CONTENT   (タクシー転職 訴求)
 *   - mechanic / mechanic_newgrad → MECHANIC_CONTENT (整備士転職 訴求)
 *
 * 共通のレイアウト (見出し / CTAボタン / 注意書き / フッター) は本ファイル下部の
 * buildHtml / buildText 内で組み立てています。コピーだけ変えたい場合は触らなくてOK。
 */

import type { EmailFormOrigin } from '../types';

// ──────────────────────────────────────────
// 公開型
// ──────────────────────────────────────────

export type BrandConfig = {
  /** 本文中で参照するブランド名 (greetingで "${brandName}へのご登録..." に展開) */
  brandName: string;
  /** 送信者表示名 (From ヘッダー) */
  fromName: string;
  /** 件名 */
  subject: string;
  /** CTA (面談予約) のURL */
  bookingUrl: string;
};

// ──────────────────────────────────────────
// メール本文 (フォーム種別ごとに差し替え可能)
// ──────────────────────────────────────────

type MailContent = BrandConfig & {
  /**
   * 本文の段落配列。
   * 文字列内の `\n` は HTML では `<br>`、テキスト版では改行として展開される。
   * 段落と段落の間は自動で空行が入る。
   */
  bodyParagraphs: string[];
  /** CTA ブロックの太字リード */
  ctaHeading: string;
  /** CTA ブロックのサブテキスト */
  ctaSubheading: string;
  /** CTA ボタンのラベル (右矢印は自動付与) */
  ctaButtonLabel: string;
};

// ─── RIDE JOB (タクシー: default + bus) ────────────────
const RIDEJOB_CONTENT: MailContent = {
  brandName: 'RIDE JOB',
  fromName: 'RIDE JOB',
  subject: '【RIDE JOB】もう、我慢して働くのはやめませんか？',
  bookingUrl: 'https://leomeet.pmagent.jp/book/ride',
  bodyParagraphs: [
    '「毎日こんなにがんばっているのに、なぜ生活がラクにならないんだろう？」 そう思ったことはありませんか？',
    'それは、あなたが悪いのではありません。「我慢すれば報われる」という会社都合のルールに縛られているからです。',
    '世渡り上手で器用な人たちを、うらやむ必要はありません。\n人間関係のゴマすりや書類作りなんて、稼ぐ力とは関係ないからです。不器用なのは、あなたが真っ直ぐに生きている証拠です。',
    'タクシードライバーは、誰の顔色もうかがう必要がない「自由な仕事」です。\nわずらわしい人間関係から解放され、がんばった分だけ、すべてダイレクトにあなたの収入になります。\n自分の力だけで、オフィスで威張っている人たち以上に稼げる世界です。',
  ],
  ctaHeading: 'もう、誰かのために自分をすり減らすのは終わりにしませんか？',
  ctaSubheading: 'まずは履歴書なしで、フランクにお話ししましょう。',
  ctaButtonLabel: '新しい一歩を踏み出す（30分カジュアル面談）',
};

// ─── RIDE JOBメカニック (整備士: mechanic + mechanic_newgrad) ─
// ⚠️ TODO: この文面は仮の下書きです。実コピーをご支給いただき次第差し替えてください。
const MECHANIC_CONTENT: MailContent = {
  brandName: 'RIDE JOBメカニック',
  fromName: 'RIDE JOBメカニック',
  subject: '【RIDE JOBメカニック】もう、我慢して働くのはやめませんか？',
  bookingUrl: 'https://leomeet.pmagent.jp/book/mec',
  bodyParagraphs: [
    '「毎日こんなにがんばっているのに、なぜ生活がラクにならないんだろう？」 そう思ったことはありませんか？',
    'それは、あなたが悪いのではありません。「我慢すれば報われる」という会社都合のルールに縛られているからです。',
    '世渡り上手で器用な人たちを、うらやむ必要はありません。\n人間関係のゴマすりや書類作りなんて、稼ぐ力とは関係ないからです。不器用なのは、あなたが真っ直ぐに生きている証拠です。',
    '整備士は、口先だけの人たちに左右されない「手に職」の仕事です。\nわずらわしい人間関係から解放され、磨いてきた技術がそのままあなたの市場価値になります。\n自分の腕一本で、オフィスで威張っている人たち以上に稼げる世界です。',
  ],
  ctaHeading: 'もう、誰かのために自分をすり減らすのは終わりにしませんか？',
  ctaSubheading: 'まずは履歴書なしで、フランクにお話ししましょう。',
  ctaButtonLabel: '新しい一歩を踏み出す（30分カジュアル面談）',
};

const CONTENT_BY_ORIGIN: Record<EmailFormOrigin, MailContent> = {
  default: RIDEJOB_CONTENT,
  bus: RIDEJOB_CONTENT,
  mechanic: MECHANIC_CONTENT,
  mechanic_newgrad: MECHANIC_CONTENT,
};

/**
 * 送信時に参照される基本情報 (件名・送信者表示名・URL等)。
 * MailContent から BrandConfig 部分のみを公開する。
 */
export function getBrandConfig(formOrigin: EmailFormOrigin): BrandConfig {
  const c = CONTENT_BY_ORIGIN[formOrigin];
  return {
    brandName: c.brandName,
    fromName: c.fromName,
    subject: c.subject,
    bookingUrl: c.bookingUrl,
  };
}

// ──────────────────────────────────────────
// Design tokens (HTML email-safe)
// ──────────────────────────────────────────
const COLOR_GOLD = '#a18a5c';
const COLOR_TEXT = '#1a1a1a';
const COLOR_TEXT_SUB = '#444444';
const COLOR_LABEL = '#999999';
const COLOR_BORDER = '#e8e3d6';
const COLOR_DASH = '#d4d4d4';
const COLOR_PAGE_BG = '#f7f5f0';
const COLOR_CARD_BG = '#ffffff';
const COLOR_BUTTON_BG = '#1a1a1a';

const FONT_STACK =
  "'Hiragino Kaku Gothic ProN','Hiragino Sans','Yu Gothic Medium','Yu Gothic',Meiryo,sans-serif";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 文字列内の \n を <br> に変換 (HTMLエスケープ済の前提で呼ぶこと) */
function nl2br(s: string): string {
  return s.replace(/\n/g, '<br>');
}

/** 「LABEL ──── 日本語ラベル」形式のセクション見出しを生成。 */
function sectionLabel(en: string, ja: string): string {
  return `<div style="font-size:11px;letter-spacing:0.18em;font-weight:bold;color:${COLOR_GOLD};margin:0;">${escapeHtml(en)}&nbsp;&nbsp;<span style="color:${COLOR_DASH};font-weight:normal;">────</span>&nbsp;&nbsp;<span style="color:#666666;letter-spacing:0.05em;font-weight:normal;">${escapeHtml(ja)}</span></div>`;
}

/** 段落 HTML を生成 (本文用) */
function paragraph(innerHtml: string, bottomPx: number = 20): string {
  return `<div style="font-size:14px;color:${COLOR_TEXT};line-height:2.0;padding-bottom:${bottomPx}px;">${innerHtml}</div>`;
}

// ──────────────────────────────────────────
// Public API
// ──────────────────────────────────────────

type TemplateInput = {
  applicantName: string;
  applicantNameKana?: string;
  phoneNumber?: string;
  email: string;
  formOrigin: EmailFormOrigin;
};

export function buildApplicationConfirmationHtml(input: TemplateInput): string {
  const content = CONTENT_BY_ORIGIN[input.formOrigin];
  const safeName = escapeHtml(input.applicantName || 'お客様');
  const safeBrand = escapeHtml(content.brandName);
  const safeSubject = escapeHtml(content.subject);
  const ctaUrl = content.bookingUrl;

  const bodyParagraphsHtml = content.bodyParagraphs
    .map((p, i) => {
      const isLast = i === content.bodyParagraphs.length - 1;
      const html = nl2br(escapeHtml(p));
      return paragraph(html, isLast ? 8 : 20);
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${safeSubject}</title>
  <style>
    /* モバイル(600px以下)では左右の余白を詰めて本文の表示幅を広げる。
       縦方向のパディングは各セルのインライン指定をそのまま維持する。 */
    @media only screen and (max-width:600px) {
      .px { padding-left:20px !important; padding-right:20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${COLOR_PAGE_BG};font-family:${FONT_STACK};color:${COLOR_TEXT};line-height:1.9;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR_PAGE_BG};">
    <tr><td align="center" style="padding:0;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:${COLOR_CARD_BG};border-radius:6px;">
        <tr><td class="px" style="padding:48px 40px 16px 40px;">

          ${sectionLabel('MESSAGE', `${content.brandName}より`)}

          <div style="height:32px;line-height:32px;font-size:0;">&nbsp;</div>

          <div style="font-size:17px;color:${COLOR_TEXT};padding-bottom:24px;">
            ${safeName} 様
          </div>

          ${paragraph(`株式会社PM Agentです。<br>${safeBrand}へのご登録ありがとうございます。`, 28)}

          ${bodyParagraphsHtml}

        </td></tr>

        <tr><td class="px" style="padding:24px 40px 0 40px;">
          <div style="border-top:1px solid ${COLOR_BORDER};height:0;line-height:0;font-size:0;">&nbsp;</div>
        </td></tr>

        <tr><td class="px" style="padding:28px 40px 8px 40px;">

          <div style="font-size:15px;color:${COLOR_TEXT};font-weight:bold;line-height:1.8;padding-bottom:8px;">
            ${escapeHtml(content.ctaHeading)}
          </div>
          <div style="font-size:14px;color:${COLOR_TEXT_SUB};line-height:1.9;padding-bottom:24px;">
            ${escapeHtml(content.ctaSubheading)}
          </div>

          <!-- CTA Button -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
            <tr><td style="background:${COLOR_BUTTON_BG};border-radius:2px;">
              <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;line-height:1;">
                ${escapeHtml(content.ctaButtonLabel)}&nbsp;→
              </a>
            </td></tr>
          </table>

          <div style="font-size:12px;color:${COLOR_LABEL};word-break:break-all;padding:14px 0 24px 0;">
            <a href="${ctaUrl}" style="color:${COLOR_LABEL};text-decoration:underline;">${ctaUrl}</a>
          </div>

          <div style="font-size:11px;color:${COLOR_LABEL};line-height:1.7;padding-bottom:8px;">
            ※すでに面談をご予約済みの方にも行き違いで配信される場合がございます。あらかじめご了承ください。
          </div>

          <div style="height:24px;line-height:24px;font-size:0;">&nbsp;</div>

        </td></tr>

        <tr><td class="px" style="padding:0 40px;">
          <div style="border-top:1px solid ${COLOR_BORDER};height:0;line-height:0;font-size:0;">&nbsp;</div>
        </td></tr>

        <tr><td class="px" style="padding:24px 40px 40px 40px;">
          <div style="font-size:12px;color:#666666;line-height:1.9;">
            株式会社PM Agent<br>
            <a href="https://pmagent.jp/" style="color:${COLOR_GOLD};text-decoration:underline;">https://pmagent.jp/</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildApplicationConfirmationText(input: TemplateInput): string {
  const content = CONTENT_BY_ORIGIN[input.formOrigin];
  const line = '────────────────────────────';

  const lines: string[] = [
    `${input.applicantName || 'お客様'} 様`,
    '',
    '株式会社PM Agentです。',
    `${content.brandName}へのご登録ありがとうございます。`,
    '',
  ];

  content.bodyParagraphs.forEach((p, i) => {
    lines.push(p);
    if (i < content.bodyParagraphs.length - 1) {
      lines.push('');
    }
  });

  lines.push(
    '',
    content.ctaHeading,
    content.ctaSubheading,
    '',
    `▼${content.ctaButtonLabel}`,
    ` ${content.bookingUrl}`,
    '',
    '※すでに面談をご予約済みの方にも行き違いで配信される場合がございます。あらかじめご了承ください。',
    '',
    line,
    '',
    '株式会社PM Agent',
    'https://pmagent.jp/'
  );

  return lines.join('\n');
}
