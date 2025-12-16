'use client';

import Image from 'next/image';
import FormCard from '../../application-form/components/FormCard';
import { CheckboxInput } from './CheckboxInput';
import type { CoupangFormData, CoupangFormErrors } from '../types';
import { CONDITION_LABELS } from '../constants';

type CoupangConditionCardProps = {
  stepImageSrc: string;
  formData: CoupangFormData;
  errors: CoupangFormErrors;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isActive: boolean;
};

export default function CoupangConditionCard({
  stepImageSrc,
  formData,
  errors,
  onChange,
  onNext,
  onPrevious,
  isActive,
}: CoupangConditionCardProps) {
  return (
    <FormCard isActive={isActive}>
      <div className="mb-6 flex justify-center">
        <Image
          src={stepImageSrc}
          alt="ステップ3"
          width={320}
          height={180}
          className="h-auto w-full max-w-[320px]"
        />
      </div>

      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600 mb-2">ステップ 3/4</p>
        <h2 className="text-xl font-bold text-gray-900">参加条件確認</h2>
        <p className="text-sm text-gray-600 mt-2">該当する項目にチェックしてください</p>
      </div>

      <div className="space-y-4">
        <CheckboxInput
          name="condition1"
          label={CONDITION_LABELS[0]}
          checked={formData.condition1}
          onChange={onChange}
          error={errors.condition1}
        />
        <CheckboxInput
          name="condition2"
          label={CONDITION_LABELS[1]}
          checked={formData.condition2}
          onChange={onChange}
          error={errors.condition2}
        />
        <CheckboxInput
          name="condition3"
          label={CONDITION_LABELS[2]}
          checked={formData.condition3}
          onChange={onChange}
          error={errors.condition3}
        />
      </div>

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

