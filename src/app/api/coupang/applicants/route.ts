import { NextRequest, NextResponse } from 'next/server';
import type { CoupangFormData } from '@/app/components/coupang-form/types';
import {
  JOB_POSITION_LABELS,
  LOCATION_LABELS,
} from '@/app/components/coupang-form/constants';
import type { SeminarSlot } from '@/app/api/coupang/seminar-slots/route';

type UTMParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_creative?: string;
};

type CoupangSubmission = CoupangFormData & {
  utmParams?: UTMParams;
};

// Gmail送信用のGAS API URL
const GAS_EMAIL_API_URL = process.env.GAS_EMAIL_API_URL || '';
// セミナースロット取得用のGAS API URL
const GAS_SEMINAR_API_URL = 'https://script.google.com/macros/s/AKfycbzDNerH9-MnemIZHyWgbdeRJ2TEL6U3ThTVjUH9rm4eB_GHl8SxrwJcpDiLLb7vWeIe/exec';

/**
 * セミナースロットのリストを取得
 */
async function fetchSeminarSlots(): Promise<SeminarSlot[]> {
  try {
    const response = await fetch(GAS_SEMINAR_API_URL, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error(`Failed to fetch seminar slots: ${response.status}`);
      return [];
    }

    const rawData = await response.json();
    
    // GAS APIは配列を直接返す
    if (Array.isArray(rawData)) {
      return rawData as SeminarSlot[];
    } else if (rawData.events && Array.isArray(rawData.events)) {
      return rawData.events as SeminarSlot[];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching seminar slots:', error);
    return [];
  }
}

/**
 * 選択された日時に対応するZoom URLを取得
 */
function getZoomUrlForSlot(slots: SeminarSlot[], selectedDate: string): string {
  const slot = slots.find((s) => s.date === selectedDate);
  return slot?.url || 'https://zoom.us/j/placeholder'; // フォールバック
}

/**
 * Gmail確認メールを送信
 */
async function sendConfirmationEmail(params: {
  to: string;
  applicantName: string;
  seminarDate: string;
  zoomUrl: string;
  jobPosition: string;
  phoneNumber: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!GAS_EMAIL_API_URL) {
    console.warn('GAS_EMAIL_API_URL is not configured. Skipping email.');
    return { success: false, error: 'Email API not configured' };
  }

  try {
    const response = await fetch(GAS_EMAIL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error('Failed to send confirmation email:', result);
      return { success: false, error: result.error || 'Unknown error' };
    }

    console.log('Confirmation email sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: String(error) };
  }
}

export async function POST(request: NextRequest) {
  try {
    const submissionData = (await request.json()) as CoupangSubmission;
    const { utmParams, ...formData } = submissionData;

    // 環境判定
    const isProduction = process.env.NODE_ENV === 'production';
    const sendBaseOnly = process.env.LARK_SEND_BASE_ONLY === 'true';

    // Webhook URL取得（既存のCoupang用URL使用）
    const larkWebhookUrl = isProduction
      ? process.env.LARK_WEBHOOK_URL_COUPANG_PROD || process.env.LARK_WEBHOOK_URL_COUPANG
      : process.env.LARK_WEBHOOK_URL_COUPANG_TEST || process.env.LARK_WEBHOOK_URL_COUPANG;

    const baseWebhookUrl = isProduction
      ? process.env.LARK_BASE_WEBHOOK_URL_COUPANG_PROD || process.env.LARK_BASE_WEBHOOK_URL_COUPANG
      : process.env.LARK_BASE_WEBHOOK_URL_COUPANG_TEST || process.env.LARK_BASE_WEBHOOK_URL_COUPANG;

    // 必須URLの検証
    if (sendBaseOnly) {
      if (!baseWebhookUrl) {
        console.error('Lark Base Webhook URL is not configured for Coupang.');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      }
    } else {
      if (!larkWebhookUrl) {
        console.error('Lark Webhook URL is not configured for Coupang.');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      }
    }

    // ラベル変換
    const jobPositionLabel = formData.jobPosition ? JOB_POSITION_LABELS[formData.jobPosition] : '未選択';
    const desiredLocationLabel = formData.desiredLocation
      ? LOCATION_LABELS[formData.desiredLocation]
      : '未選択';
    const ageLabel = formData.age ? `${formData.age}歳` : '未選択';
    const birthDateLabel = formData.birthDate || '未入力';
    const seminarSlotLabel = formData.seminarSlot === 'no_schedule'
      ? '参加できる日程がありません'
      : (formData.seminarSlot || '未選択');

    // セミナースロットのリストを取得（Gmail送信用）
    let seminarSlots: SeminarSlot[] = [];
    const hasSeminarSlot = Boolean(formData.seminarSlot && formData.seminarSlot !== 'no_schedule');
    if (hasSeminarSlot && GAS_EMAIL_API_URL) {
      seminarSlots = await fetchSeminarSlots();
    }

    // 並列送信
    if (!sendBaseOnly) {
      const tasks: Promise<void>[] = [];

      // Lark 送信タスク
      if (larkWebhookUrl) {
        const utmDisplay = utmParams?.utm_source
          ? `${utmParams.utm_source}${utmParams.utm_medium ? `(${utmParams.utm_medium})` : ''}`
          : 'RIDEJOB HP';

        const messageContent = `
ロケットナウの応募がありました！
-------------------------
流入元: ${utmDisplay}
メールアドレス: ${formData.email || '未入力'}
氏名（漢字）: ${formData.fullName || '未入力'}
氏名（ふりがな）: ${formData.fullNameKana || '未入力'}
電話番号: ${formData.phoneNumber || '未入力'}
希望職種: ${jobPositionLabel}
希望勤務地: ${desiredLocationLabel}
年齢: ${ageLabel}
生年月日: ${birthDateLabel}
参加希望日時: ${seminarSlotLabel}
-------------------------
        `.trim();

        const larkPayload = {
          msg_type: 'text',
          content: { text: messageContent },
        } as const;

        tasks.push(
          (async () => {
            const resp = await fetch(larkWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(larkPayload),
            });
            if (!resp.ok) {
              const errorBody = await resp.text();
              console.error(`Failed to send notification to Lark (${resp.status}): ${errorBody}`);
            } else {
              const result = await resp.json();
              console.log('Lark notification sent successfully:', result);
            }
          })()
        );
      }

      // Base 送信タスク
      if (baseWebhookUrl) {
        const userAgent = request.headers.get('user-agent') || '';
        const clientIp = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || '';

        const basePayload = {
          media_name: 'Meta広告',
          utm_source: utmParams?.utm_source || '',
          utm_medium: utmParams?.utm_medium || '',
          utm_campaign: utmParams?.utm_campaign || '',
          utm_term: utmParams?.utm_term || '',
          utm_creative: utmParams?.utm_creative || '',
          email: formData.email || '',
          full_name: formData.fullName || '',
          full_name_kana: formData.fullNameKana || '',
          phone_number: formData.phoneNumber || '',
          job_position: jobPositionLabel,
          desired_location: desiredLocationLabel,
          age: formData.age || '',
          birth_date: formData.birthDate || '',
          seminar_slot: seminarSlotLabel,
          submitted_at: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          user_agent: userAgent,
          client_ip: clientIp,
          form_origin: 'coupang_rocketnow',
        } as Record<string, unknown>;

        tasks.push(
          (async () => {
            const resp = await fetch(baseWebhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(basePayload),
            });
            if (!resp.ok) {
              const errorBody = await resp.text();
              console.error(`Failed to send to Lark Base Webhook (${resp.status}): ${errorBody}`);
            } else {
              console.log('Lark Base webhook triggered successfully');
            }
          })()
        );
      }

      // Gmail 確認メール送信タスク（全条件クリア時のみ）
      if (hasSeminarSlot && GAS_EMAIL_API_URL && formData.email) {
        const zoomUrl = getZoomUrlForSlot(seminarSlots, formData.seminarSlot);
        
        tasks.push(
          (async () => {
            const emailResult = await sendConfirmationEmail({
              to: formData.email,
              applicantName: formData.fullName || '応募者',
              seminarDate: formData.seminarSlot,
              zoomUrl: zoomUrl,
              jobPosition: jobPositionLabel,
              phoneNumber: formData.phoneNumber || '',
            });

            if (!emailResult.success) {
              console.error('Failed to send confirmation email:', emailResult.error);
            } else {
              console.log('✓ 全条件クリア：Gmail送信完了 to:', formData.email);
            }
          })()
        );
      } else if (!hasSeminarSlot) {
        console.log('⚠ 参加希望日時が未設定のためGmail送信スキップ、Lark通知とLark Base登録のみ実行');
      }

      await Promise.allSettled(tasks);
    } else {
      // Baseのみ送信（テストモード）
      if (baseWebhookUrl) {
        const userAgent = request.headers.get('user-agent') || '';
        const clientIp = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || '';

        const basePayload = {
          media_name: 'Meta広告',
          utm_source: utmParams?.utm_source || '',
          utm_medium: utmParams?.utm_medium || '',
          utm_campaign: utmParams?.utm_campaign || '',
          utm_term: utmParams?.utm_term || '',
          utm_creative: utmParams?.utm_creative || '',
          email: formData.email || '',
          full_name: formData.fullName || '',
          full_name_kana: formData.fullNameKana || '',
          phone_number: formData.phoneNumber || '',
          job_position: jobPositionLabel,
          desired_location: desiredLocationLabel,
          age: formData.age || '',
          birth_date: formData.birthDate || '',
          seminar_slot: seminarSlotLabel,
          submitted_at: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          user_agent: userAgent,
          client_ip: clientIp,
          form_origin: 'coupang_rocketnow',
        } as Record<string, unknown>;

        const resp = await fetch(baseWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(basePayload),
        });
        if (!resp.ok) {
          const errorBody = await resp.text();
          console.error(`Failed to send to Lark Base Webhook (${resp.status}): ${errorBody}`);
        } else {
          console.log('Lark Base webhook triggered successfully');
        }
      }
    }

    return NextResponse.json({ message: 'Application submitted successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error processing Coupang application:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
