import { NextRequest, NextResponse } from 'next/server';
import type { CoupangFormData } from '@/app/components/coupang-form/types';
import {
  JOB_POSITION_LABELS,
  LOCATION_LABELS,
} from '@/app/components/coupang-form/constants';
import { getCoupangStep1Options } from '../step1-options/options';

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

    const step1Options = await getCoupangStep1Options();
    const fallbackJobPositionMap = JOB_POSITION_LABELS as Record<string, string>;
    const fallbackLocationMap = LOCATION_LABELS as Record<string, string>;

    // ラベル変換（シート定義の日本語値を優先し、旧固定値もフォールバック）
    const jobPositionLabel = formData.jobPosition
      ? (
          step1Options.jobPositions.find((v) => v === formData.jobPosition)
          || fallbackJobPositionMap[formData.jobPosition]
          || formData.jobPosition
        )
      : '未選択';
    const desiredLocationLabel = formData.desiredLocation
      ? (
          step1Options.desiredLocations.find((v) => v === formData.desiredLocation)
          || fallbackLocationMap[formData.desiredLocation]
          || formData.desiredLocation
        )
      : '未選択';
    const ageLabel = formData.age ? `${formData.age}歳` : '未選択';
    const birthDateLabel = formData.birthDate || '未入力';

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
