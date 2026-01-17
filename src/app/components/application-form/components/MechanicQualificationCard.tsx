'use client';

import Image from 'next/image';
import FormCard from './FormCard';
import StepProgressBar from './StepProgressBar';
import type { FormErrors, MechanicQualification } from '../types';

type MechanicQualificationCardProps = {
  selectedQualification: MechanicQualification | '';
  errors: FormErrors;
  onSelect: (value: MechanicQualification) => void;
  onNext: () => void;
  onPrevious?: () => void;
  isActive: boolean;
  progress: {
    currentStep: number;
    totalSteps: number;
  };
};

const qualificationOptions: Array<{
  value: MechanicQualification;
  label: string;
  imageSrc?: string;
}> = [
  { value: 'level3', label: '自動車整備士3級', imageSrc: '/images/整備士３級.png' },
  { value: 'level2', label: '自動車整備士2級', imageSrc: '/images/整備士2級.png' },
  { value: 'level1', label: '自動車整備士1級', imageSrc: '/images/整備士1級.png' },
  { value: 'inspector', label: '自動車検査員', imageSrc: '/images/自動車検査員.png' },
  { value: 'none', label: '資格なし' },
];

export default function MechanicQualificationCard({
  selectedQualification,
  errors,
  onSelect,
  onNext,
  onPrevious,
  isActive,
  progress,
}: MechanicQualificationCardProps) {
  const handleToggle = (value: MechanicQualification) => {
    onSelect(value);
  };

  const isNextEnabled = Boolean(selectedQualification);

  const cardOptions = qualificationOptions.filter((option) => option.value !== 'none');
  const noneOption = qualificationOptions.find((option) => option.value === 'none');

  return (
    <FormCard isActive={isActive} className="pb-6 mt-10">
      <StepProgressBar currentStep={progress.currentStep} totalSteps={progress.totalSteps} />

      <div className="mb-6 text-center">
        <p className="text-xs font-semibold text-gray-500">条件に合った求人を検索します</p>
        <h2 className="mt-2 text-lg font-bold text-gray-900">保有資格を教えてください</h2>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        {cardOptions.map((option, index) => {
          const isSelected = selectedQualification === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`relative flex w-full flex-col items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-center transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isSelected
                  ? 'bg-orange-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleToggle(option.value)}
            >
              <span className="sr-only">{option.label}</span>
              {option.imageSrc && (
                <Image
                  src={option.imageSrc}
                  alt={option.label}
                  width={160}
                  height={120}
                  className="h-[110px] w-auto"
                />
              )}
            </button>
          );
        })}
      </div>

      {noneOption && (
        <button
          type="button"
          className={`mb-6 w-full rounded-xl border-2 py-3 text-center text-sm font-semibold transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            selectedQualification === noneOption.value
              ? 'border-[#ff702a] bg-orange-50 text-[#ff702a]'
              : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
          }`}
          onClick={() => handleToggle(noneOption.value)}
        >
          {noneOption.label}
        </button>
      )}

      {errors.mechanicQualification && (
        <p className="text-red-500 text-xs mb-4">{errors.mechanicQualification}</p>
      )}

      <div className="flex justify-around items-center">
        {onPrevious ? (
          <button
            type="button"
            className="py-2 text-sm font-bold cursor-pointer text-gray-800 mb-0"
            onClick={onPrevious}
          >
            ＜ 戻る
          </button>
        ) : (
          <span />
        )}
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
        </div>
      </div>
    </FormCard>
  );
}
