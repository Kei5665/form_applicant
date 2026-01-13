'use client';

import Image from 'next/image';
import FormCard from '../../application-form/components/FormCard';
import { SelectInput } from './SelectInput';
import type { CoupangFormData, CoupangFormErrors, Age } from '../types';

type CoupangSeminarInfoCardProps = {
  stepImageSrc: string;
  formData: CoupangFormData;
  errors: CoupangFormErrors;
  seminarSlotOptions: { value: string; label: string }[];
  ageOptions: { value: Age | ''; label: string }[];
  slotsLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isActive: boolean;
};

export default function CoupangSeminarInfoCard({
  stepImageSrc,
  formData,
  errors,
  seminarSlotOptions,
  ageOptions,
  slotsLoading,
  onChange,
  onNext,
  onPrevious,
  isActive,
}: CoupangSeminarInfoCardProps) {
  return (
    <FormCard isActive={isActive}>
      <div className="mb-6 flex justify-center">
        <Image
          src={stepImageSrc}
          alt="ステップ2"
          width={320}
          height={180}
          className="h-auto w-full max-w-[320px]"
        />
      </div>

      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600 mb-2">ステップ 2/4</p>
        <h2 className="text-xl font-bold text-gray-900">セミナー情報</h2>
      </div>

      <div className="space-y-6">
        <SelectInput
          name="seminarSlot"
          label="参加希望日時"
          value={formData.seminarSlot}
          onChange={onChange}
          error={errors.seminarSlot}
          options={seminarSlotOptions}
          placeholder={slotsLoading ? '読み込み中...' : '選択してください'}
        />

        <SelectInput
          name="age"
          label="年齢"
          value={formData.age}
          onChange={onChange}
          error={errors.age}
          options={ageOptions}
        />
      </div>

      <p className="mt-4 text-xs text-gray-600">※上限年齢は40歳までとなります</p>

      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onPrevious}
          className="w-1/3 bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={onNext}
          className="w-2/3 bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold py-4 px-6 rounded-lg transition-colors"
        >
          次へ
        </button>
      </div>
    </FormCard>
  );
}
