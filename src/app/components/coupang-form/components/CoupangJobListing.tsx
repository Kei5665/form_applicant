'use client';

import { useState } from 'react';
import { JOB_LISTINGS } from '../constants';

export default function CoupangJobListing() {
  const [selectedJobId, setSelectedJobId] = useState<string>(JOB_LISTINGS[0].id);

  // 選択中の求人情報を取得
  const selectedJob = JOB_LISTINGS.find((job) => job.id === selectedJobId) || JOB_LISTINGS[0];

  // 求人選択肢の配列作成
  const jobListingOptions = JOB_LISTINGS.map((job) => ({
    value: job.id,
    label: `${job.jobType}（${job.location}）`,
  }));

  return (
    <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-md">
      <h2 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-[#ff6b35] pl-3">求人情報</h2>

      <div className="space-y-4">
        {/* 求人選択ドロップダウン */}
        <div>
          <label htmlFor="jobListing" className="block text-sm font-semibold text-gray-900 mb-2">
            求人を選択
          </label>
          <select
            id="jobListing"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-[#ff6b35] text-sm text-black font-medium transition-all"
          >
            {jobListingOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 求人詳細カード */}
        <div className="border-2 border-[#ff6b35] rounded-lg overflow-hidden bg-white">
          {/* ヘッダー部分 */}
          <div className="bg-gradient-to-r from-[#ff6b35] to-[#ff8555] p-4 text-white">
            <h4 className="font-bold text-base mb-1 leading-relaxed">
              {selectedJob.title}
            </h4>
            <p className="text-sm opacity-90">{selectedJob.company}</p>
          </div>

          {/* コンテンツ部分 */}
          <div className="p-4 space-y-4">
            {/* 給与情報 */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
              <div className="flex items-center mb-2">
                <span className="text-lg font-bold text-amber-700">💰</span>
                <span className="ml-2 font-bold text-gray-900">{selectedJob.salary}</span>
              </div>
              <div className="space-y-1 text-xs text-gray-700">
                {selectedJob.salaryDetail.map((detail, index) => (
                  <p key={index} className="flex items-start">
                    <span className="mr-1">✅</span>
                    <span>{detail}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* アピールポイント */}
            <div>
              <h5 className="font-bold text-sm text-gray-900 mb-2 flex items-center">
                <span className="mr-1">✨</span>
                アピールポイント
              </h5>
              <div className="grid gap-2">
                {selectedJob.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start text-xs text-gray-700 bg-blue-50 p-2 rounded">
                    <span className="text-[#ff6b35] mr-1.5 flex-shrink-0">✓</span>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 募集職種・勤務形態 */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600 mb-1">募集職種</p>
                <p className="font-semibold text-gray-900">{selectedJob.jobType}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-gray-600 mb-1">勤務形態</p>
                <p className="font-semibold text-gray-900">{selectedJob.workStyle}</p>
              </div>
            </div>

            {/* 詳細リンク */}
            <div className="pt-2 border-t border-gray-200">
              <a
                href={selectedJob.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold py-3 px-4 rounded-lg text-center transition-colors text-sm"
              >
                詳細を見る →
              </a>
              <p className="text-xs text-gray-500 mt-2 text-center">
                最終更新日: {selectedJob.updatedAt}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

