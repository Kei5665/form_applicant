'use client';

import Image from 'next/image';

import FormCard from './FormCard';
import type { FormErrors } from '../types';

type NameCardProps = {
  stepImageSrc: string;
  postalCode: string;
  errors: FormErrors;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPrevious: () => void;
  onNext: () => void;
  isActive: boolean;
};

export default function NameCard({ stepImageSrc, postalCode, errors, onChange, onPrevious, onNext, isActive }: NameCardProps) {
  return (
    <FormCard isActive={isActive} className="h-full">
      <Image className="w-full mb-4" src={stepImageSrc} alt="Step 2" width={300} height={50} />
        <div>
          <h3 className="mb-2 text-base font-semibold text-gray-900">郵便番号を入力してください</h3>
          <p className="mb-4 text-xs text-gray-500">該当地域の求人件数を確認します</p>
          <label htmlFor="postalCode" className="mb-1 block text-gray-900">
            郵便番号（ハイフンなし7桁）
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="\\d*"
            id="postalCode"
            name="postalCode"
            placeholder="例: 1234567"
            className={`w-full rounded-lg border p-3 text-gray-900 placeholder-gray-500 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
            value={postalCode}
            onChange={onChange}
            maxLength={7}
          />
          {errors.postalCode && <p className="mt-2 text-xs text-red-500">{errors.postalCode}</p>}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button type="button" className="py-2 px-4 font-bold text-gray-800" onClick={onPrevious}>
            ＜ 戻る
          </button>
          <button type="button" className="w-[60%] rounded-md bg-[#ff702a] py-2.5 px-5 font-bold text-white" onClick={onNext}>
            次へ
          </button>
        </div>
    </FormCard>
  );
}

