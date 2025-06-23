import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "タクシー運転手の転職ならライドジョブ｜応募フォーム",
  description: "未経験でもわかるドライバー業界の魅力発掘メディア。\nライドジョブは仕事のやりがいやリアルな声、キャリアの可能性など、ドライバー業界の魅力を発見・共有する情報発信プラットフォームです。経験者の声や成功事例、未経験からのキャリアスタートのヒントなど、幅広い情報をお届けします。",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
