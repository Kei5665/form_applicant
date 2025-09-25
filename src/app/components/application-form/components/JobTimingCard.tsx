'use client';

import FormCard from './FormCard';
import type { FormData, FormErrors } from '../types';

type JobTimingCardProps = {
  selectedTiming: FormData['jobTiming'];
  errors: FormErrors;
  onSelect: (value: FormData['jobTiming']) => void;
  isActive: boolean;
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
    description: '今のうちに求人を確認したい',
    className: 'bg-[#ff702a] text-white shadow-[0_6px_0_0_rgba(255,112,42,0.4)]',
  },
  {
    value: 'no_plan',
    label: 'すぐに転職する気はない',
    className: 'bg-[#9be5ff] text-gray-900 shadow-[0_6px_0_0_rgba(155,229,255,0.5)]',
  },
];

export default function JobTimingCard({ selectedTiming, errors, onSelect, isActive }: JobTimingCardProps) {
  const handleClick = (value: FormData['jobTiming']) => {
    onSelect(value);
  };

  return (
    <FormCard isActive={isActive} className="min-h-[380px]">
      <div className="mb-6 text-left">
        <h2 className="mb-2 text-lg font-bold text-gray-900">転職時期は決まっていますか？</h2>
        <p className="text-sm text-gray-600">状況に合わせて最適なサポートをご案内します</p>
      </div>

      <div className="space-y-4">
        {options.map((option) => {
          const isSelected = selectedTiming === option.value;
          return (
            <button
              key={option.value}
              type="button"
              className={`relative w-full rounded-2xl px-5 py-4 text-left transition-transform duration-150 ease-out focus:outline-none focus:ring-4 focus:ring-orange-200 ${
                option.className
              } ${isSelected ? 'ring-4 ring-[#ffb48a]' : ''}`}
              onClick={() => handleClick(option.value)}
            >
              <span className="block text-base font-bold">{option.label}</span>
              {option.description && <span className="mt-1 block text-sm opacity-90">{option.description}</span>}
              {isSelected && (
                <span className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#ff702a]">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {errors.jobTiming && <p className="mt-4 text-xs text-red-500">{errors.jobTiming}</p>}
    </FormCard>
  );
}


