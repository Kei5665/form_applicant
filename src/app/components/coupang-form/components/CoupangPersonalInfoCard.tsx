'use client';

import Image from 'next/image';
import FormCard from '../../application-form/components/FormCard';
import { TextInput } from './TextInput';
import type { CoupangFormData, CoupangFormErrors } from '../types';

type CoupangPersonalInfoCardProps = {
  stepImageSrc: string;
  formData: CoupangFormData;
  errors: CoupangFormErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onPrevious: () => void;
  isSubmitting: boolean;
  isActive: boolean;
};

export default function CoupangPersonalInfoCard({
  stepImageSrc,
  formData,
  errors,
  onChange,
  onPrevious,
  isSubmitting,
  isActive,
}: CoupangPersonalInfoCardProps) {
  return (
    <FormCard isActive={isActive}>
      <div className="mb-6 flex justify-center">
        <Image
          src={stepImageSrc}
          alt="ステップ4"
          width={320}
          height={180}
          className="h-auto w-full max-w-[320px]"
        />
      </div>

      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600 mb-2">ステップ 4/4</p>
        <h2 className="text-xl font-bold text-gray-900">求職者情報</h2>
      </div>

      <div className="space-y-6">
        <TextInput
          name="email"
          label="メールアドレス"
          type="email"
          value={formData.email}
          onChange={onChange}
          error={errors.email}
          placeholder="example@gmail.com"
          helpText="常時利用可能なアドレスをご入力ください（@gmail.com 推奨）"
        />

        <TextInput
          name="fullName"
          label="氏名（漢字）"
          value={formData.fullName}
          onChange={onChange}
          error={errors.fullName}
          placeholder="山田太郎"
          helpText="全角文字で入力してください"
        />

        <TextInput
          name="fullNameKana"
          label="氏名（ふりがな）"
          value={formData.fullNameKana}
          onChange={onChange}
          error={errors.fullNameKana}
          placeholder="やまだたろう"
          helpText="ひらがなで入力してください"
        />

        <TextInput
          name="englishName"
          label="英名"
          value={formData.englishName}
          onChange={onChange}
          error={errors.englishName}
          placeholder="Taro Yamada"
          helpText="名 → 姓 の順で入力してください（例：Taro Yamada）"
        />

        <TextInput
          name="phoneNumber"
          label="電話番号"
          type="tel"
          value={formData.phoneNumber}
          onChange={onChange}
          error={errors.phoneNumber}
          placeholder="09012345678"
          helpText="ハイフンなしで入力してください"
        />
      </div>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="w-1/3 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          戻る
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-2/3 bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '送信中...' : '送信する'}
        </button>
      </div>
    </FormCard>
  );
}

