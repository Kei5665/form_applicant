import { NextRequest, NextResponse } from 'next/server';

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
    const submissionData = await request.json();
    const { utmParams, ...formData } = submissionData;
    const larkWebhookUrl = process.env.LARK_WEBHOOK_URL;

    if (!larkWebhookUrl) {
      console.error('Lark Webhook URL is not configured in environment variables.');
      // サーバー内部のエラーとし、具体的な理由はクライアントに返さない
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }

    // Debug: Log received UTM parameters
    console.log('Received UTM parameters:', utmParams);
    
    // Get media name from UTM parameters
    const mediaName = getMediaName(utmParams || {});
    console.log('Generated media name:', mediaName);
    
    // Larkに送信するメッセージを作成
    // シンプルなテキスト形式
    const messageContent = `
新しい応募がありました！
-------------------------
流入元: ${mediaName}
生年月日: ${formData.birthDate || '未入力'}
氏名: ${formData.lastName || ''} ${formData.firstName || ''} (${formData.lastNameKana || ''} ${formData.firstNameKana || ''})
郵便番号: ${formData.postalCode || '未入力'}
電話番号: ${formData.phoneNumber || '未入力'}
-------------------------
    `.trim(); // 前後の空白を削除

    // Lark Webhookのペイロード (msg_type は必須)
    const larkPayload = {
      msg_type: 'text',
      content: {
        text: messageContent,
      },
    };

    // Lark WebhookにPOSTリクエストを送信
    const larkResponse = await fetch(larkWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(larkPayload),
    });

    // Lark APIからのレスポンスをチェック
    if (!larkResponse.ok) {
      // Larkへの通知失敗時の処理
      const errorBody = await larkResponse.text();
      console.error(`Failed to send notification to Lark (${larkResponse.status}): ${errorBody}`);
      // エラーが発生しても、ユーザーの申し込み自体は受け付けたとみなす場合が多い
      // ここではクライアントには成功を返す（内部的にはエラーログで追跡）
      // 必要であれば、クライアントにエラーを返すことも検討
      // return NextResponse.json({ message: 'Failed to send notification' }, { status: 502 }); // Bad Gatewayなど
    } else {
        // Larkからの成功レスポンスをログ出力 (デバッグ用)
        const larkResult = await larkResponse.json();
        console.log('Lark notification sent successfully:', larkResult);
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