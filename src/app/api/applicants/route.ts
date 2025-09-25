import { NextRequest, NextResponse } from 'next/server';
import type { FormData } from '@/app/components/application-form/types';
import { mapJobTimingLabel } from '@/app/components/application-form/utils/mapJobTimingLabel';

// Types for submission payload
type ExperimentInfo = {
  name?: string;
  variant?: string;
};

type UTMParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
};

type ApplicantFormData = {
  birthDate?: string;
  fullName?: string;
  fullNameKana?: string;
  postalCode?: string;
  prefectureId?: string;
  prefectureName?: string;
  municipalityId?: string;
  municipalityName?: string;
  phoneNumber?: string;
  jobTiming?: FormData['jobTiming'];
};

type ApplicantSubmission = ApplicantFormData & {
  utmParams?: UTMParams;
  experiment?: ExperimentInfo;
  formOrigin?: 'coupang' | 'default';
};

// UTM parameters to media name mapping function
function getMediaName(utmParams: { utm_source?: string; utm_medium?: string }): string {
  const { utm_source, utm_medium } = utmParams;
  
  console.log('getMediaName input:', { utm_source, utm_medium });
  
  if (!utm_source) {
    console.log('No utm_source found, returning 直接アクセス');
    return '直接アクセス';
  }
  
  // Based on parameter.md definitions
  switch (utm_source.toLowerCase()) {
    case 'google':
      if (utm_medium === 'search') {
        return 'Googleリスティング';
      }
      return 'Google';
      
    case 'tiktok':
      console.log('Matched tiktok, utm_medium:', utm_medium);
      if (utm_medium === 'ad') {
        return 'TikTok広告';
      } else if (utm_medium === 'organic') {
        return 'TikTokオーガニック';
      }
      return 'TikTok';
      
    case 'meta':
      if (utm_medium === 'ad') {
        return 'Meta広告';
      }
      return 'Meta';
      
    case 'youtube':
      if (utm_medium === 'organic') {
        return 'YouTubeオーガニック';
      }
      return 'YouTube';
      
    case 'threads':
      if (utm_medium === 'organic') {
        return 'スレッドオーガニック';
      }
      return 'スレッド';
      
    default:
      return `${utm_source}${utm_medium ? `(${utm_medium})` : ''}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const submissionData = (await request.json()) as ApplicantSubmission;
    const { utmParams, formOrigin, ...formData } = submissionData;
    
    // Determine env and feature flags
    const isProduction = process.env.NODE_ENV === 'production';
    const sendBaseOnly = process.env.LARK_SEND_BASE_ONLY === 'true';

    // Determine if this is from coupang
    const referer = request.headers.get('referer') || '';
    const isCoupang = formOrigin === 'coupang' || /\/coupang(\?|$|\/)?.*/.test(referer);

    // Determine the appropriate Lark webhook URLs based on environment (with sensible fallbacks)
    const larkWebhookUrlCommon = isProduction
      ? process.env.LARK_WEBHOOK_URL_PROD
          || process.env.LARK_WEBHOOK_URL
          || process.env.LARK_WEBHOOK_URL_TEST
      : process.env.LARK_WEBHOOK_URL_TEST
          || process.env.LARK_WEBHOOK_URL
          || process.env.LARK_WEBHOOK_URL_PROD;
    // Optional dedicated webhook for coupang
    const larkWebhookUrlCoupang = isProduction
      ? process.env.LARK_WEBHOOK_URL_COUPANG_PROD || process.env.LARK_WEBHOOK_URL_COUPANG
      : process.env.LARK_WEBHOOK_URL_COUPANG_TEST || process.env.LARK_WEBHOOK_URL_COUPANG;

    const larkWebhookUrl = (isCoupang && larkWebhookUrlCoupang) ? larkWebhookUrlCoupang : larkWebhookUrlCommon;

    const baseWebhookUrlCommon = isProduction
      ? process.env.LARK_BASE_WEBHOOK_URL_PROD
          || process.env.LARK_BASE_WEBHOOK_URL
          || process.env.LARK_BASE_WEBHOOK_URL_TEST
      : process.env.LARK_BASE_WEBHOOK_URL_TEST
          || process.env.LARK_BASE_WEBHOOK_URL
          || process.env.LARK_BASE_WEBHOOK_URL_PROD;
    // Optional dedicated Base webhook for coupang
    const baseWebhookUrlCoupang = isProduction
      ? process.env.LARK_BASE_WEBHOOK_URL_COUPANG_PROD || process.env.LARK_BASE_WEBHOOK_URL_COUPANG
      : process.env.LARK_BASE_WEBHOOK_URL_COUPANG_TEST || process.env.LARK_BASE_WEBHOOK_URL_COUPANG;

    const baseWebhookUrl = (isCoupang && baseWebhookUrlCoupang) ? baseWebhookUrlCoupang : baseWebhookUrlCommon;

    // 必須URLの検証（Baseのみテスト時はBase URL、通常時はLark URL）
    if (sendBaseOnly) {
      if (!baseWebhookUrl) {
        console.error('Lark Base Webhook URL is not configured while LARK_SEND_BASE_ONLY=true.');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      }
    } else {
      if (!larkWebhookUrl) {
        console.error('Lark Webhook URL is not configured in environment variables.');
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      }
    }

    // Debug: Log received UTM parameters
    console.log('Received UTM parameters:', utmParams);
    
    // Get media name from UTM parameters (coupangはMeta固定)
    const mediaName = isCoupang ? 'Meta広告' : getMediaName(utmParams || {});
    const jobTimingLabel = mapJobTimingLabel(submissionData.jobTiming ?? '');
    console.log('Generated media name:', mediaName, 'isCoupang:', isCoupang);
    
    // 並列送信（Baseのみテスト中は直下の単独送信へ）
    if (!sendBaseOnly) {
      const tasks: Promise<void>[] = [];

      // Lark 送信タスク
      if (larkWebhookUrl) {
        const title = isCoupang ? 'クーパンの応募がありました！' : '新しい応募がありました！';
        const utmDisplay = utmParams?.utm_source
          ? `${utmParams.utm_source}${utmParams.utm_medium ? `(${utmParams.utm_medium})` : ''}`
          : 'RIDEJOB HP';
        const locationDisplay = formData.prefectureName || formData.municipalityName
          ? `${formData.prefectureName || ''} ${formData.municipalityName || ''}`.trim()
          : '未入力';
        const messageContent = `
${title}
-------------------------
流入元: ${utmDisplay}
生年月日: ${formData.birthDate || '未入力'}
氏名: ${formData.fullName || '未入力'} (${formData.fullNameKana || '未入力'})
郵便番号: ${formData.postalCode || '未入力'}
地域: ${locationDisplay}
転職時期: ${jobTimingLabel || '未選択'}
電話番号: ${formData.phoneNumber || '未入力'}
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
          media_name: mediaName,
          utm_source: utmParams?.utm_source || '',
          utm_medium: utmParams?.utm_medium || '',
          utm_campaign: utmParams?.utm_campaign || '',
          utm_term: utmParams?.utm_term || '',
          birth_date: formData.birthDate || '',
          full_name: formData.fullName || '',
          full_name_kana: formData.fullNameKana || '',
          postal_code: formData.postalCode || '',
          prefecture_id: formData.prefectureId || '',
          prefecture_name: formData.prefectureName || '',
          municipality_id: formData.municipalityId || '',
          municipality_name: formData.municipalityName || '',
          phone_number: formData.phoneNumber || '',
          job_timing: jobTimingLabel,
          job_timing: mapJobTimingLabel((submissionData as { jobTiming?: FormData['jobTiming'] }).jobTiming ?? ''),
          experiment_name: submissionData?.experiment?.name || '',
          experiment_variant: submissionData?.experiment?.variant || '',
          submitted_at: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          user_agent: userAgent,
          client_ip: clientIp,
          form_origin: formOrigin || '',
          is_coupang: isCoupang,
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
      } else {
        console.warn('Lark Base Webhook URL is not configured. Skipping Base record creation.');
      }

      // どちらも失敗しても応募自体は成功扱い
      await Promise.allSettled(tasks);
    } else {
      // Baseのみ送信（テストモード）
      if (baseWebhookUrl) {
        const userAgent = request.headers.get('user-agent') || '';
        const clientIp = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || '';
        const basePayload = {
          media_name: isCoupang ? 'Meta広告' : (getMediaName(utmParams || {})),
          utm_source: utmParams?.utm_source || '',
          utm_medium: utmParams?.utm_medium || '',
          utm_campaign: utmParams?.utm_campaign || '',
          utm_term: utmParams?.utm_term || '',
          birth_date: formData.birthDate || '',
          full_name: formData.fullName || '',
          full_name_kana: formData.fullNameKana || '',
          postal_code: formData.postalCode || '',
          prefecture_id: formData.prefectureId || '',
          prefecture_name: formData.prefectureName || '',
          municipality_id: formData.municipalityId || '',
          municipality_name: formData.municipalityName || '',
          phone_number: formData.phoneNumber || '',
          job_timing: jobTimingLabel,
          job_timing: mapJobTimingLabel((submissionData as { jobTiming?: FormData['jobTiming'] }).jobTiming ?? ''),
          experiment_name: submissionData?.experiment?.name || '',
          experiment_variant: submissionData?.experiment?.variant || '',
          submitted_at: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          user_agent: userAgent,
          client_ip: clientIp,
          form_origin: formOrigin || '',
          is_coupang: isCoupang,
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

    // クライアントには成功したことを返す
    // (Larkへの通知成否に関わらず、データを受け付けた時点で成功とすることも多い)
    return NextResponse.json({ message: 'Application submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Error processing application in API route:', error);
    // 予期せぬエラー
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 