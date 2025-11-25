'use client';

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export default function CoupangApplicationComplete() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'form_complete',
        form_name: 'ridejob_application'
      });
    }
  }, []);

  return (
    <div className="mx-auto max-w-md px-4 bg-[#f1f9fa] min-h-screen">
      {/* Header Section */}
      <div className="text-center pt-8 pb-4">
        <h1 className="text-2xl font-bold text-[#ff6b35] leading-relaxed">
          この度はお申込みいただき<br />ありがとうございました！
        </h1>
      </div>

      {/* Gift Campaign Section */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <div className="text-center">
          <p className="text-base mb-3">
            <span className="text-2xl mr-2">🎁</span>
            <span className="font-bold text-gray-600 text-xl">説明会参加者限定<br />アマギフ1,000円プレゼントが</span>
            <br />
            <p className="font-bold text-red-600 text-xl mt-2">もうすぐ終了です！</p>
          </p>
          <p className="text-sm text-gray-700 mb-2">
            迷っている方はお早めに✨
          </p>
          <p className="text-sm text-gray-700">
            面談予約 or LINE登録で今ならGET！
          </p>
        </div>
      </div>

      {/* Selection Process Section */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-[#ff6b35] pl-3">
          担当エージェントに直接細かく聴きたい方
        </h2>
        <div className="text-base text-gray-700 space-y-2 mb-6">
          <p>担当者との電話面談の日程をご調整いただいた方に</p>
          <p>求人の詳細をお送りいたします。</p>
          <p>ご面談の際に選考会の詳細もお伝えいたします。</p>
        </div>
        <a
          href="https://pmagent.eeasy.jp/ridejob"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold py-4 px-6 rounded-lg text-center transition-colors"
        >
          面談予約へ<br />
        </a>
      </div>

      {/* LINE Registration Section */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-[#ff6b35] pl-3">
          担当エージェントにLINEで細かく聴きたい方
        </h2>
        <div className="text-base text-gray-700 space-y-2 mb-6">
          <p>LIFT JOB 公式LINEにご登録後、</p>
          <p>求人内容をお送りいたします。</p>
        </div>
        <a
          href="https://lin.ee/SSlcaLH"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold py-4 px-6 rounded-lg text-center transition-colors"
        >
          LINE登録へ<br />
        </a>
      </div>

      {/* Footer */}
      <footer className="text-white py-5 mt-8 bg-[#212e4a]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-around items-center text-center md:text-left text-xs mb-3 space-y-2 md:space-y-0">
            <a href="https://pmagent.jp/" className="text-white hover:underline">運営会社について</a>
            <a href="/privacy" className="text-white hover:underline">プライバシーポリシー</a>
          </div>
          <div className="text-center mt-3">
            <p className="text-xs">© 2025 株式会社PMAgent</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
