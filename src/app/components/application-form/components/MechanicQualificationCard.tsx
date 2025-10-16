'use client';

import Image from 'next/image';

import FormCard from './FormCard';
import FingerHint from './FingerHint';
import type { FormErrors, MechanicQualification } from '../types';

type MechanicQualificationCardProps = {
  stepImageSrc: string;
  selectedQualifications: MechanicQualification[];
  errors: FormErrors;
  onToggle: (value: MechanicQualification) => void;
  onNext: () => void;
  onPrevious: () => void;
  isActive: boolean;
};

const qualificationOptions: Array<{
  value: MechanicQualification;
  label: string;
}> = [
  { value: 'none', label: '無資格' },
  { value: 'level3', label: '自動車整備士3級' },
  { value: 'level2', label: '自動車整備士2級' },
  { value: 'level1', label: '自動車整備士1級' },
  { value: 'inspector', label: '自動車検査員' },
  { value: 'body_paint', label: '板金塗装技能士' },
];

export default function MechanicQualificationCard({
  stepImageSrc,
  selectedQualifications,
  errors,
  onToggle,
  onNext,
  onPrevious,
  isActive,
}: MechanicQualificationCardProps) {
  const handleToggle = (value: MechanicQualification) => {
    onToggle(value);
  };

  const isNextEnabled = selectedQualifications.length > 0;
  const shouldShowHint = selectedQualifications.length === 0;

  return (
    <FormCard isActive={isActive} className="pb-6 mt-10">
      <Image className="w-full mb-4" src={stepImageSrc} alt="Step" width={300} height={50} />

      <div className="mb-6 text-center">
        <h2 className="mb-2 text-lg font-bold text-gray-900">
          保有している整備士資格を
          <br />
          選択してください（複数選択可）
        </h2>
      </div>

      <div className="space-y-3 mb-6">
        {qualificationOptions.map((option, index) => {
          const isSelected = selectedQualifications.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              className={`relative w-full rounded-lg px-4 py-4 text-left transition-all duration-150 ease-out border-2 focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isSelected
                  ? 'border-[#ff702a] bg-orange-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
              onClick={() => handleToggle(option.value)}
            >
              <div className="flex items-center justify-between">
                <span className={`text-base font-semibold ${isSelected ? 'text-[#ff702a]' : 'text-gray-900'}`}>
                  {option.label}
                </span>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded border-2 transition-colors ${
                    isSelected
                      ? 'border-[#ff702a] bg-[#ff702a]'
                      : 'border-gray-400 bg-white'
                  }`}
                >
                  {isSelected && (
                    <span className="text-white text-sm font-bold">✓</span>
                  )}
                </div>
              </div>
              {index === 0 && (
                <FingerHint
                  isVisible={shouldShowHint}
                  size={40}
                  className="absolute right-2 top-1/2 -translate-y-1/2 translate-x-12 sm:size-[52px]"
                />
              )}
            </button>
          );
        })}
      </div>

      {errors.mechanicQualifications && (
        <p className="text-red-500 text-xs mb-4">{errors.mechanicQualifications}</p>
      )}

      <div className="flex justify-around items-center">
        <button
          type="button"
          className="py-2 text-sm font-bold cursor-pointer text-gray-800 mb-0"
          onClick={onPrevious}
        >
          ＜ 戻る
        </button>
        <div className="relative ml-auto flex w-[70%] max-w-[320px] items-center justify-end">
          <button
            type="button"
            className={`w-full rounded-md py-3 px-12 text-base font-bold text-white ${
              isNextEnabled
                ? 'bg-[#ff702a] cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={onNext}
            disabled={!isNextEnabled}
          >
            次へ
          </button>
          <FingerHint
            isVisible={isNextEnabled}
            size={44}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 sm:size-[60px]"
          />
        </div>
      </div>
    </FormCard>
  );
}
