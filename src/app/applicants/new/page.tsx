'use client';

import Image from "next/image";
import { useEffect } from "react";

// Extend Window interface for GTM dataLayer
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export default function ApplicationComplete() {
  // Track form completion on page load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        'event': 'form_complete',
        'form_name': 'ridejob_application'
      });
    }
  }, []);

  return (
    <div className="mx-auto max-w-md">
      {/* Header */}
      <header className="flex items-center justify-between p-1.5 bg-white w-[95%] mx-auto mt-2.5 rounded-md shadow">
        <div className="pl-2.5">
          <Image src="/images/ride_logo.png" alt="Ride Job Logo" width={120} height={30} className="h-[30px] w-auto"/>
        </div>
        <div className="text-right pr-2.5">
          <p className="text-xs text-gray-800 my-1">未経験でタクシー会社に就職するなら</p>
          <p className="text-xs text-black font-bold my-1">RIDE JOB（ライドジョブ）</p>
        </div>
      </header>

      {/* Completion message card */}
      <div className="flex justify-center my-8">
        <div className="bg-white rounded-lg p-8 w-[90%] shadow-lg text-center max-w-md">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">お申し込み完了</h2>
            <p className="text-gray-800 mb-4">
              この度は、RIDE JOBにお申し込みいただき、<br/>
              誠にありがとうございました。
            </p>
            <p className="text-gray-800 mb-4">
              担当者より、お電話またはメールにて<br/>
              ご連絡させていただきます。
            </p>
            <p className="text-gray-800 mb-4">
              今しばらくお待ちください。
            </p>
          </div>
        </div>
      </div>

      {/* Taxi Image */}
      <div className="relative text-center mt-4">
        <Image className="w-1/2 inline-block" src="/images/car.png" alt="Taxi" width={200} height={100} />
      </div>

      {/* Footer */}
      <footer className="text-white py-5 mt-8 bg-[#6DCFE4]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-5">
            <Image className="mb-5 w-1/4 sm:w-1/6 md:w-[150px] inline-block" src="/images/flogo.png" alt="Footer Logo" width={150} height={40}/>
          </div>
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