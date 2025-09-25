'use client';

import Image from 'next/image';
import FormCard from './FormCard';
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
  return (
    <FormCard isActive={isActive} className="h-full">
      <div className="mb-6 text-left">
        <Image className="w-full mb-4" src={stepImageSrc} alt="Step 2" width={300} height={50} priority />
        <label className="font-bold mb-2.5 block text-gray-900">生年月日</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="\\d*"
          id="birthDate"
          name="birthDate"
          placeholder="例: 19900101"
          className={`w-full p-3 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            errors.birthDate ? 'border-red-500' : 'border-gray-300'
          } ${birthDate ? 'text-gray-900' : 'text-gray-500'}`}
          value={birthDate}
          onChange={onChange}
          maxLength={8}
        />
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
        <button type="button" className="flex-1 py-2.5 px-5 rounded-md bg-[#ff702a] text-white font-bold cursor-pointer" onClick={onNext}>
          次へ
        </button>
      </div>
    </FormCard>
  );
}

