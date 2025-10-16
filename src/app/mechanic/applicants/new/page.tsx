'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

// Extend Window interface for GTM dataLayer
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export default function MechanicApplicationComplete() {
  // Track form completion on page load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        'event': 'form_complete',
        'form_name': 'ridejob_mechanic_application'
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex w-full max-w-[480px] flex-col bg-white">
      <header className="px-6 pb-5 pt-8">
        <div className="flex items-start justify-between gap-4">
            <Image
              src="/images/mechanic-logo.png"
              alt="Mechanic Logo"
              width={132}
              height={34}
              className="h-[34px] w-auto"
            />
            <div className="text-right text-[11px] leading-relaxed text-gray-700">
              <p>未経験で整備士に転職するなら</p>
              <p className="font-semibold text-gray-900">RIDE JOB MECHANIC（ライドジョブ メカニック）</p>
            </div>
          </div>
      </header>

      <main className="flex flex-1 flex-col pb-12">
        <section className="mt-6">
          <div className="text-center">
            <p className="mt-6 text-2xl font-bold leading-relaxed" style={{ color: '#2205D9' }}>
              RIDE JOBに問合せいただき
              <br />
              誠にありがとうございました！
            </p>
            <p className="mt-6 text-lg leading-relaxed font-bold text-gray-700">
              担当者より、お電話またはメールにて
              <br />
              求人をご案内させていただきます。
              <br />
              今しばらくお待ちください。
            </p>
          </div>
        </section>

        <div className="mt-6 flex justify-center">
          <Image
            src="/images/thanks-banner.png"
            alt="転職サポートのご案内バナー"
            width={680}
            height={227}
            priority
            className="h-auto w-full"
          />
        </div>

        <section className="mt-12">
          <div className="flex items-center pl-2">
            <span className="mr-2 block h-6 w-1 rounded bg-[#2205D9]"></span>
            <h2 className="text-xl font-semibold text-gray-900">LINEでのご連絡を希望される方</h2>
          </div>
          <div className="px-4">
            <p className="mt-4 text-lg leading-relaxed text-gray-900">
              LINEからもあなたにぴったりの求人をご紹介できます。
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-900">
              ハローワークには掲載されていない非公開求人をLINE限定で案内しています。
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-900">
              下のボタンをタップして、友だち追加からご連絡してください。
            </p>
          </div>

          <div className="mt-4">
            <Link
              href="https://lin.ee/4bLPZ5w"
              className="block"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/line-section.png"
                alt="LINE公式アカウント登録バナー"
                width={750}
                height={516}
                className="h-auto w-full"
              />
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center pl-2">
            <span className="mr-2 block h-6 w-1 rounded bg-[#2205D9]"></span>
            <h2 className="text-xl font-semibold text-gray-900">すぐに求人情報がほしい方</h2>
          </div>
          <div className="px-4">
            <p className="mt-4 text-lg leading-relaxed text-gray-900">
              高年収の求人から採用枠が埋まります。少しでも早く知りたい方は、こちらから面談日程のご予約が可能です。
            </p>
            <div className="mt-6">
              <Link
                href="https://meeting.eeasy.jp/ridejob./general"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl bg-[#2205D9] py-4 text-center text-lg font-semibold text-white shadow-[0_6px_0_rgba(0,0,0,0.15)] transition-transform hover:translate-y-[1px]"
              >
                面談予約へ
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center pl-2">
            <span className="mr-2 block h-6 w-1 rounded bg-[#2205D9]"></span>
            <h2 className="text-xl font-semibold text-gray-900">RIDE JOBが大切にしていること</h2>
          </div>
          <div className="px-4">
            <p className="mt-4 text-lg leading-relaxed text-gray-900">
              私たちはおもてなしの心あふれるサポートを通して、求職者様の感動を作り出す転職支援をモットーにしています。
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-900">
              日本全国の移動を作り出すことを目指して、タクシー業界に特化した転職エージェント事業を行っています。
            </p>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-[#00A0E9] shadow-[0_8px_20px_rgba(0,160,233,0.25)]">
            <div className="relative h-0 w-full pb-[56.25%]">
              <iframe
                src="https://www.youtube.com/embed/knB0b7Mq_KA?start=1101"
                title="RIDE JOB紹介動画"
                className="absolute left-0 top-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center pl-2">
            <span className="mr-2 block h-6 w-1 rounded bg-[#2205D9]"></span>
            <h2 className="text-xl font-semibold text-gray-900">RIDE JOB公式サイトで求人を探す</h2>
          </div>
          <div className="px-4">
            <p className="mt-4 text-lg leading-relaxed text-gray-900">
              地域・職種を選んで求人検索のできる公式サイトをご用意しました。
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-900">
              気になる求人がありましたら、ご連絡の際にお伝えください。
            </p>
          </div>
          <div className="mt-6 px-2">
            <Link
              href="https://ridejob.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl bg-[#2205D9] py-4 text-center text-lg font-semibold text-white shadow-[0_6px_0_rgba(0,0,0,0.15)] transition-transform hover:translate-y-[1px]"
            >
              公式サイト
            </Link>
          </div>
        </section>

      </main>

      <footer className="mt-16 bg-[#CDE6FF] px-6 py-12 text-center text-sm text-gray-800">
        <div className="flex flex-col items-center gap-6">
          <Image
            src="/images/ride_logo.svg"
            alt="RIDE JOB ロゴ"
            width={160}
            height={40}
            className="h-auto w-[160px]"
            priority
          />
          <nav className="flex flex-col gap-3 text-base font-medium">
            <Link href="https://pmagent.jp/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
              運営会社について
            </Link>
            <Link href="/privacy" className="hover:opacity-80">
              プライバシーポリシー
            </Link>
          </nav>
          <p className="text-xs">© 2025 株式会社PMAgent</p>
        </div>
      </footer>
      </div>
    </div>
  );
}
