'use client';

import FormCard from './FormCard';
import FingerHint from './FingerHint';
import type { FormData, FormErrors } from '../types';

type JobTimingCardProps = {
  selectedTiming: FormData['jobTiming'];
  errors: FormErrors;
  onSelect: (value: FormData['jobTiming']) => void;
  isActive: boolean;
  errorMessage?: string;
};

const options: Array<{
  value: FormData['jobTiming'];
  label: string;
  description?: string;
  className: string;
}> = [
  {
    value: 'asap',
    label: '決まれば早く転職したい',
    className: 'bg-[#ff702a] text-white shadow-[0_6px_0_0_rgba(255,112,42,0.4)]',
  },
  {
    value: 'no_plan',
    label: 'すぐに転職する気はない',
    className: 'bg-[#9be5ff] text-gray-900 shadow-[0_6px_0_0_rgba(155,229,255,0.5)]',
  },
];

export default function JobTimingCard({ selectedTiming, errors, onSelect, isActive, errorMessage }: JobTimingCardProps) {
  const handleClick = (value: FormData['jobTiming']) => {
    onSelect(value);
  };

  const isNextEncouraged = Boolean(selectedTiming);
  const shouldShowInitialHint = !selectedTiming;

  return (
    <FormCard isActive={isActive} className="min-h-[280px]">
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-lg font-bold text-gray-900">転職時期は決まっていますか？</h2>
      </div>

      <div className="space-y-4">
        {options.map((option, index) => {
          const isSelected = selectedTiming === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`relative w-full rounded-2xl px-5 py-8 text-center transition-transform duration-150 ease-out focus:outline-none focus:ring-4 focus:ring-orange-200 ${
                option.className
              } ${isSelected ? 'ring-4 ring-[#ffb48a]' : ''}`}
              onClick={() => handleClick(option.value)}
            >
              <span className="block text-xl font-bold">{option.label}</span>
              {option.description && <span className="mt-1 block text-sm opacity-90">{option.description}</span>}
              {isSelected && (
                <span className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#ff702a]">
                  ✓
                </span>
              )}
              {index === 0 && (
                <FingerHint isVisible={shouldShowInitialHint} size={40} className="absolute right-2 top-1/2 -translate-y-1/2 sm:-right-10 sm:size-[56px]" />
              )}
            </button>
          );
        })}
      </div>

      {(errorMessage ?? errors.jobTiming) && <p className="mt-4 text-xs text-red-500">{errorMessage ?? errors.jobTiming}</p>}

      <div className="mt-6 flex items-center justify-end">
        <FingerHint isVisible={isNextEncouraged} size={44} className="sm:size-[60px]" />
      </div>
    </FormCard>
  );
}

