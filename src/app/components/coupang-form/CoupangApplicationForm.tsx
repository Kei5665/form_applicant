'use client';

import Image from 'next/image';
import { FormSection, TextInput, SelectInput } from './components';
import { useCoupangForm } from './hooks/useCoupangForm';
import { useSeminarSlots } from './hooks/useSeminarSlots';
import {
  JOB_POSITION_LABELS,
  LOCATION_LABELS,
  AGE_OPTIONS,
  JOB_LISTINGS,
} from './constants';

export default function CoupangApplicationForm() {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    selectedJobId,
    setSelectedJobId,
  } = useCoupangForm();

  const { slots, isLoading: slotsLoading } = useSeminarSlots();

  // 選択肢の配列作成
  const jobPositionOptions = Object.entries(JOB_POSITION_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const locationOptions = Object.entries(LOCATION_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const seminarSlotOptions = slots.map((slot) => ({
    value: slot.date,
    label: slot.date,
  }));

  const seminarOptionsWithFallback = [
    ...seminarSlotOptions,
    { value: 'no_schedule', label: '参加できる日程がありません' },
  ];

  const ageOptions = AGE_OPTIONS;

  // 選択中の求人情報を取得
  const selectedJob = JOB_LISTINGS.find((job) => job.id === selectedJobId) || JOB_LISTINGS[0];

  // 求人選択肢の配列作成
  const jobListingOptions = JOB_LISTINGS.map((job) => ({
    value: job.id,
    label: `${job.jobType}（${job.location}）`,
  }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 min-h-screen">
      {/* バナー画像 */}
      <div className="mb-6">
        <Image
          src="/images/coupang_banner.webp"
          alt="ロケットナウ求人特設フォーム"
          width={640}
          height={180}
          className="w-full h-auto rounded-lg"
          priority
        />
      </div>

      {/* セミナー詳細情報 */}
      <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-md">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-l-4 border-[#ff6b35] pl-3">セミナー詳細</h2>

        <div className="space-y-6 text-sm">
          {/* 開催日程 */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-start">
              <span className="inline-block w-2 h-2 bg-[#ff6b35] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              開催日程（全日程オンライン開催となります※ZOOM）
            </h3>
            <p className="text-gray-700 ml-4">スクロールいただき、ご確認ください。</p>
          </div>

          {/* 開催方法 */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-start">
              <span className="inline-block w-2 h-2 bg-[#ff6b35] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              開催方法
            </h3>
            <div className="text-gray-700 ml-4 space-y-1">
              <p>オンライン（Zoom）</p>
              <p className="text-xs">※Zoom URLについては、セミナー開催日当日の午前までにお送りいたします。ご確認お願い致します。</p>
            </div>
          </div>

          {/* 内容 */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-start">
              <span className="inline-block w-2 h-2 bg-[#ff6b35] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              内容（所要時間：30～60分）
            </h3>
            <div className="text-gray-700 ml-4 space-y-2">
              <div>
                <p className="font-semibold">・会社および職務説明（約20～30分）</p>
                <p className="text-xs pl-2">⇒ロケットナウの事業概要や募集職種の仕事内容についてご説明します。</p>
              </div>
              <div>
                <p className="font-semibold">・面接（約5分）</p>
                <p className="text-xs pl-2">⇒オンライン面接形式で実施します。</p>
                <p className="text-xs pl-2">※当日は「電話番号下4桁」「簡単な自己紹介」「職種の志望理由」をご準備のうえ、ご参加くださいませ。</p>
              </div>
            </div>
          </div>

          {/* セミナー参加方法 */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-start">
              <span className="inline-block w-2 h-2 bg-[#ff6b35] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              セミナー参加方法
            </h3>
            <p className="text-gray-700 ml-4">お申し込み時にご登録いただいたメールアドレス宛に、セミナー当日の午前までにZoomリンクと参加方法のご案内をお送りします。</p>
          </div>

          {/* セミナー参加資格 */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-start">
              <span className="inline-block w-2 h-2 bg-[#ff6b35] rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              セミナー参加資格
            </h3>
            <div className="text-gray-700 ml-4 space-y-1">
              <p>・日本国籍を保有している、もしくは日本で就労可能な方が対象です。※永住権保有かつN1資格取得者</p>
              <p>・採用セミナーは原則として1回のみ参加が可能です。繰り返しの参加はご遠慮いただいております。</p>
              <p>・過去にCP ONE JAPANで勤務された、もしくは過去説明会に参加された方は、今回の採用セミナーの対象外となります。</p>
              <p>・面接時の服装はスーツもしくはオフィスカジュアルでお願いします。※スーツ推奨</p>
              <p>・年齢上限は、40歳までとなります。</p>
              <p>・5分前には入室いただき待機をお願い致します。</p>
            </div>
          </div>
        </div>
      </div>

      {/* 求人情報 */}
      <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-md">
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

      <form onSubmit={handleSubmit} noValidate>
        {/* カテゴリ1: 求職者情報 */}
        <FormSection title="求職者情報">
          <TextInput
            name="email"
            label="メールアドレス"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="example@gmail.com"
            helpText="常時利用可能なアドレスをご入力ください（@gmail.com 推奨）"
          />

          <TextInput
            name="fullName"
            label="氏名（漢字）"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="山田太郎"
            helpText="全角文字で入力してください"
          />

          <TextInput
            name="fullNameKana"
            label="氏名（ふりがな）"
            value={formData.fullNameKana}
            onChange={handleChange}
            error={errors.fullNameKana}
            placeholder="やまだたろう"
            helpText="ひらがなで入力してください"
          />

          <TextInput
            name="phoneNumber"
            label="携帯番号"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            error={errors.phoneNumber}
            placeholder="09012345678"
            helpText="ハイフンなしで入力してください"
          />
        </FormSection>

        {/* カテゴリ2: 応募情報 */}
        <FormSection title="応募情報">
          <SelectInput
            name="jobPosition"
            label="希望職種"
            value={formData.jobPosition}
            onChange={handleChange}
            error={errors.jobPosition}
            options={jobPositionOptions}
          />

          <SelectInput
            name="desiredLocation"
            label="希望勤務地"
            value={formData.desiredLocation}
            onChange={handleChange}
            error={errors.desiredLocation}
            options={locationOptions}
          />
        </FormSection>

        {/* カテゴリ3: セミナー情報 */}
        <FormSection title="セミナー情報">
          <SelectInput
            name="seminarSlot"
            label="参加希望日時"
            value={formData.seminarSlot}
            onChange={handleChange}
            error={errors.seminarSlot}
            options={seminarOptionsWithFallback}
            placeholder={slotsLoading ? '読み込み中...' : '選択してください'}
          />

          <SelectInput
            name="age"
            label="年齢"
            value={formData.age}
            onChange={handleChange}
            error={errors.age}
            options={ageOptions}
          />
          <p className="text-xs text-gray-600">※上限年齢は40歳までとなります</p>
        </FormSection>

        {/* 送信ボタン */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '送信中...' : '送信する'}
          </button>
        </div>
      </form>

      {/* Footer */}
      <footer className="text-white py-5 mt-8 bg-[#212e4a]/95 backdrop-blur-sm rounded-lg">
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
