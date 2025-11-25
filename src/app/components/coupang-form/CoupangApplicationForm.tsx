'use client';

import Image from 'next/image';
import { FormSection, TextInput, SelectInput, CheckboxInput } from './components';
import { useCoupangForm } from './hooks/useCoupangForm';
import { useSeminarSlots } from './hooks/useSeminarSlots';
import {
  JOB_POSITION_LABELS,
  APPLICATION_REASON_LABELS,
  PAST_EXPERIENCE_LABELS,
  CONDITION_LABELS,
} from './constants';

export default function CoupangApplicationForm() {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useCoupangForm();

  const { slots, isLoading: slotsLoading } = useSeminarSlots();

  // 選択肢の配列作成
  const jobPositionOptions = Object.entries(JOB_POSITION_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const applicationReasonOptions = Object.entries(APPLICATION_REASON_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const pastExperienceOptions = Object.entries(PAST_EXPERIENCE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const seminarSlotOptions = slots.map((slot) => ({
    value: slot.date,
    label: slot.date,
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
            name="englishName"
            label="英名"
            value={formData.englishName}
            onChange={handleChange}
            error={errors.englishName}
            placeholder="Taro Yamada"
            helpText="名 → 姓 の順で入力してください（例：Taro Yamada）"
          />

          <TextInput
            name="phoneNumber"
            label="電話番号"
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
            name="applicationReason"
            label="志望理由"
            value={formData.applicationReason}
            onChange={handleChange}
            error={errors.applicationReason}
            options={applicationReasonOptions}
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
            options={seminarSlotOptions}
            placeholder={slotsLoading ? '読み込み中...' : '選択してください'}
          />

          <SelectInput
            name="pastExperience"
            label="過去の参加／勤務経験"
            value={formData.pastExperience}
            onChange={handleChange}
            error={errors.pastExperience}
            options={pastExperienceOptions}
          />
        </FormSection>

        {/* カテゴリ4: 参加条件確認 */}
        <FormSection title="参加条件確認（該当する項目にチェックしてください）">
          <div className="space-y-3">
            <CheckboxInput
              name="condition1"
              label={CONDITION_LABELS[0]}
              checked={formData.condition1}
              onChange={handleChange}
              error={errors.condition1}
            />
            <CheckboxInput
              name="condition2"
              label={CONDITION_LABELS[1]}
              checked={formData.condition2}
              onChange={handleChange}
              error={errors.condition2}
            />
            <CheckboxInput
              name="condition3"
              label={CONDITION_LABELS[2]}
              checked={formData.condition3}
              onChange={handleChange}
              error={errors.condition3}
            />
            <CheckboxInput
              name="condition4"
              label={CONDITION_LABELS[3]}
              checked={formData.condition4}
              onChange={handleChange}
              error={errors.condition4}
            />
            <CheckboxInput
              name="condition5"
              label={CONDITION_LABELS[4]}
              checked={formData.condition5}
              onChange={handleChange}
              error={errors.condition5}
            />
          </div>
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
