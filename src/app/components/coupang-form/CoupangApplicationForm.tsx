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
    handlePhoneNumberBlur,
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
            placeholder="山田　太郎"
            helpText="姓と名の間に全角スペースを入れてください"
          />

          <TextInput
            name="fullNameKana"
            label="氏名（ふりがな）"
            value={formData.fullNameKana}
            onChange={handleChange}
            error={errors.fullNameKana}
            placeholder="やまだ　たろう"
            helpText="ひらがなで、姓と名の間に全角スペースを入れてください"
          />

          <TextInput
            name="englishName"
            label="英名"
            value={formData.englishName}
            onChange={handleChange}
            error={errors.englishName}
            placeholder="Taro　Yamada"
            helpText="名 → 姓 の順で、間に全角スペースを入れてください"
          />

          <TextInput
            name="phoneNumber"
            label="電話番号"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            onBlur={handlePhoneNumberBlur}
            error={errors.phoneNumber}
            placeholder="090-1234-5678"
            helpText="ハイフン付きで入力してください"
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
        <FormSection title="参加条件確認（すべて必須）">
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
