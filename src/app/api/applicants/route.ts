import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const larkWebhookUrl = process.env.LARK_WEBHOOK_URL;

    if (!larkWebhookUrl) {
      console.error('Lark Webhook URL is not configured in environment variables.');
      // サーバー内部のエラーとし、具体的な理由はクライアントに返さない
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }

    // Larkに送信するメッセージを作成
    // シンプルなテキスト形式
    const messageContent = `
新しい応募がありました！
-------------------------
生まれ年: ${formData.birthYear || '未入力'}
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