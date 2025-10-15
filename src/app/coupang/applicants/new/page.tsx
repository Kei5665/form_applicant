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
    <div className="mx-auto max-w-md">
      {/* Completion message card */}
      <div className="flex justify-center my-8">
        <div className="bg-white rounded-lg p-8 w-[90%] shadow-lg text-center max-w-md">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">お申し込み完了</h2>
            <p className="text-gray-800 mb-4">
              この度は、お申し込みいただき、<br/>
              誠にありがとうございました。
            </p>
            <p className="text-gray-800 mb-4">
              担当者より、お電話またはメールにて<br/>
              ご連絡させていただきます。
            </p>
            <p className="text-gray-800 mb-4">
              弊社と面談後、選考会に参加できます。
            </p>
            <p className="text-gray-800 mb-4">
              今しばらくお待ちください。
            </p>
          </div>
        </div>
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
