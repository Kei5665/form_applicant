import { NextResponse } from "next/server";

// 2027新卒 鈑金塗装職LP（/gulliver/newgraduate → 本番は /entry/gulliver/newgraduate）の
// 会社説明会お申し込み受付。当リポジトリの applicants と同じく Lark Webhook へ通知する軽量リード窓口。
// 専用チャンネル LARK_WEBHOOK_URL_GULLIVER_BP を優先し、無ければ MECHANIC → 既定 にフォールバック。

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const cap = (s: string, n: number) => (s.length > n ? s.slice(0, n) : s);

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    // ハニーポット: 隠しフィールドに値があれば bot とみなし、黙って成功扱いで破棄。
    const honeypot = (form.get("company_url") || "").toString().trim();
    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    const name = cap((form.get("name") || "").toString().trim(), 100);
    const email = cap((form.get("email") || "").toString().trim(), 254);
    const tel = cap((form.get("tel") || "").toString().trim(), 32);
    const area = cap((form.get("area") || "").toString().trim(), 100);

    const errors: string[] = [];
    if (!name) errors.push("お名前は必須です。");
    if (!email) errors.push("メールアドレスは必須です。");
    else if (!isValidEmail(email)) errors.push("メールアドレスの形式が正しくありません。");
    if (!tel) errors.push("電話番号は必須です。");
    else if (!/^[0-9\-+() ]{10,}$/.test(tel)) errors.push("電話番号の形式が正しくありません。");

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }

    const isProd = process.env.NODE_ENV === "production";
    const webhookUrl =
      process.env.LARK_WEBHOOK_URL_GULLIVER_BP_PROD ||
      process.env.LARK_WEBHOOK_URL_GULLIVER_BP ||
      (isProd ? process.env.LARK_WEBHOOK_URL_MECHANIC_PROD : process.env.LARK_WEBHOOK_URL_MECHANIC_TEST) ||
      process.env.LARK_WEBHOOK_URL_MECHANIC ||
      process.env.LARK_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json({ error: "サーバー設定が不足しています。(WEBHOOK)" }, { status: 500 });
    }

    const textLines: string[] = [
      "【2027新卒 鈑金塗装職LP / Gulliver】会社説明会のお申し込みが届きました",
      `お名前: ${name}`,
      `メール: ${email}`,
      tel ? `電話: ${tel}` : undefined,
      area ? `希望エリア: ${area}` : undefined,
      "経路: /entry/gulliver/newgraduate (BP / 2027新卒)",
    ].filter((line): line is string => typeof line === "string");

    const payload = { msg_type: "text", content: { text: textLines.join("\n") } };

    let larkRes: Response;
    try {
      larkRes = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      return NextResponse.json(
        { error: "送信に失敗しました。時間をおいて再度お試しください。" },
        { status: 502 }
      );
    }

    const larkData = await larkRes.json().catch(() => ({} as { code?: number }));

    if (
      !larkRes.ok ||
      (larkData && typeof larkData.code !== "undefined" && larkData.code !== 0)
    ) {
      return NextResponse.json(
        { error: "送信に失敗しました。時間をおいて再度お試しください。" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "不正なリクエストです。" }, { status: 400 });
  }
}
