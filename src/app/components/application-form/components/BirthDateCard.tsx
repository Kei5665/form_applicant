'use client';

import Image from 'next/image';

import FormCard from './FormCard';
import FingerHint from './FingerHint';
import type { BirthDate, FormErrors } from '../types';

type BirthDateCardProps = {
  stepImageSrc: string;
  birthDate: BirthDate;
  errors: FormErrors;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  isActive: boolean;
  onPrevious?: () => void;
};

export default function BirthDateCard({ stepImageSrc, birthDate, errors, onChange, onNext, isActive, onPrevious }: BirthDateCardProps) {
  const isFilled = birthDate.length === 8;

  return (
    <FormCard isActive={isActive} className="h-full">
      <div className="mb-6 text-left">
        <Image className="w-full mb-4" src={stepImageSrc} alt="Step 2" width={300} height={50} priority />
        <h1 className="text-lg text-center font-bold mb-4 text-gray-700">条件に合った求人を検索します</h1>
        <label className="font-bold mb-2.5 block text-gray-900">生年月日</label>
        <div className="relative flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            pattern="\\d*"
            id="birthDate"
            name="birthDate"
            placeholder="例: 19900101"
            className={`flex-1 p-3 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              errors.birthDate ? 'border-red-500' : 'border-gray-300'
            } ${birthDate ? 'text-gray-900' : 'text-gray-500'}`}
            value={birthDate}
            onChange={onChange}
            maxLength={8}
          />
          <FingerHint isVisible={!isFilled} size={40} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 sm:size-[52px]" />
        </div>
        {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
      </div>
      <div className="flex items-center justify-between gap-4">
        {onPrevious ? (
          <button type="button" className="py-2 px-4 font-bold text-gray-800" onClick={onPrevious}>
            ＜ 戻る
          </button>
        ) : (
          <span />
        )}
        <div className="relative flex flex-1 items-center justify-end gap-2">
          <button type="button" className="flex-1 py-2.5 px-5 rounded-md bg-[#ff702a] text-white font-bold cursor-pointer" onClick={onNext}>
            次へ
          </button>
          <FingerHint isVisible={isFilled} size={44} className="sm:size-[56px]" />
        </div>
      </div>
    </FormCard>
  );
}

