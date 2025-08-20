import { NextRequest, NextResponse } from 'next/server';

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
  lastName?: string;
  firstName?: string;
  lastNameKana?: string;
  firstNameKana?: string;
  postalCode?: string;
  phoneNumber?: string;
};

type ApplicantSubmission = ApplicantFormData & {
  utmParams?: UTMParams;
  experiment?: ExperimentInfo;
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
    const { utmParams, ...formData } = submissionData;
    
    // Determine env and feature flags
    const isProduction = process.env.NODE_ENV === 'production';
    const sendBaseOnly = process.env.LARK_SEND_BASE_ONLY === 'true';

    // Determine the appropriate Lark webhook URLs based on environment (with sensible fallbacks)
    const larkWebhookUrl = isProduction
      ? process.env.LARK_WEBHOOK_URL_PROD
          || process.env.LARK_WEBHOOK_URL
          || process.env.LARK_WEBHOOK_URL_TEST
      : process.env.LARK_WEBHOOK_URL_TEST
          || process.env.LARK_WEBHOOK_URL
          || process.env.LARK_WEBHOOK_URL_PROD;
    const baseWebhookUrl = isProduction
      ? process.env.LARK_BASE_WEBHOOK_URL_PROD
          || process.env.LARK_BASE_WEBHOOK_URL
          || process.env.LARK_BASE_WEBHOOK_URL_TEST
      : process.env.LARK_BASE_WEBHOOK_URL_TEST
          || process.env.LARK_BASE_WEBHOOK_URL
          || process.env.LARK_BASE_WEBHOOK_URL_PROD;

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
    
    // Get media name from UTM parameters
    const mediaName = getMediaName(utmParams || {});
    console.log('Generated media name:', mediaName);
    
    // 並列送信（Baseのみテスト中は直下の単独送信へ）
    if (!sendBaseOnly) {
      const tasks: Promise<void>[] = [];

      // Lark 送信タスク
      if (larkWebhookUrl) {
        const messageContent = `
新しい応募がありました！
-------------------------
流入元: ${mediaName}
生年月日: ${formData.birthDate || '未入力'}
氏名: ${formData.lastName || ''} ${formData.firstName || ''} (${formData.lastNameKana || ''} ${formData.firstNameKana || ''})
郵便番号: ${formData.postalCode || '未入力'}
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
          last_name: formData.lastName || '',
          first_name: formData.firstName || '',
          last_name_kana: formData.lastNameKana || '',
          first_name_kana: formData.firstNameKana || '',
          postal_code: formData.postalCode || '',
          phone_number: formData.phoneNumber || '',
          experiment_name: submissionData?.experiment?.name || '',
          experiment_variant: submissionData?.experiment?.variant || '',
          submitted_at: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          user_agent: userAgent,
          client_ip: clientIp,
        };

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
          media_name: mediaName,
          utm_source: utmParams?.utm_source || '',
          utm_medium: utmParams?.utm_medium || '',
          utm_campaign: utmParams?.utm_campaign || '',
          utm_term: utmParams?.utm_term || '',
          birth_date: formData.birthDate || '',
          last_name: formData.lastName || '',
          first_name: formData.firstName || '',
          last_name_kana: formData.lastNameKana || '',
          first_name_kana: formData.firstNameKana || '',
          postal_code: formData.postalCode || '',
          phone_number: formData.phoneNumber || '',
          experiment_name: submissionData?.experiment?.name || '',
          experiment_variant: submissionData?.experiment?.variant || '',
          submitted_at: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          user_agent: userAgent,
          client_ip: clientIp,
        };

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