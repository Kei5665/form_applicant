'use client';

import Image from 'next/image';
import { useMemo } from 'react';

import FormCard from './FormCard';
import type { BirthDate, FormErrors } from '../types';

type BirthDateCardProps = {
  stepImageSrc: string;
  birthDate: BirthDate;
  errors: FormErrors;
  onChange: (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onNext: () => void;
  isActive: boolean;
};

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 84;
  const endYear = currentYear - 18;
  const years: number[] = [];
  for (let year = endYear; year >= startYear; year--) {
    years.push(year);
  }
  return years;
};

const getDaysInMonth = (year: string, month: string) => {
  if (!year || !month) return 31;
  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);
  return new Date(yearNum, monthNum, 0).getDate();
};

export default function BirthDateCard({ stepImageSrc, birthDate, errors, onChange, onNext, isActive }: BirthDateCardProps) {
  const years = useMemo(generateYearOptions, []);
  const days = useMemo(() => getDaysInMonth(birthDate.year, birthDate.month), [birthDate.year, birthDate.month]);

  return (
    <FormCard isActive={isActive} className="h-full">
      <div className="mb-6 text-left">
        <Image className="w-full mb-4" src={stepImageSrc} alt="Step 1" width={300} height={50} priority />
        <label className="font-bold mb-2.5 block text-gray-900">生年月日</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label htmlFor="birthYear" className="block text-xs text-gray-600 mb-1 sm:hidden">
              年
            </label>
            <select
              id="birthYear"
              name="birthYear"
              className={`w-full p-3 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.birthDate ? 'border-red-500' : 'border-gray-300'
              } ${!birthDate.year ? 'text-gray-500' : ''}`}
              value={birthDate.year}
              onChange={onChange}
            >
              <option value="">年を選択</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="birthMonth" className="block text-xs text-gray-600 mb-1 sm:hidden">
              月
            </label>
            <select
              id="birthMonth"
              name="birthMonth"
              className={`w-full p-3 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.birthDate ? 'border-red-500' : 'border-gray-300'
              } ${!birthDate.month ? 'text-gray-500' : ''} ${!birthDate.year ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={birthDate.month}
              onChange={onChange}
              disabled={!birthDate.year}
            >
              <option value="">月を選択</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {month}月
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="birthDay" className="block text-xs text-gray-600 mb-1 sm:hidden">
              日
            </label>
            <select
              id="birthDay"
              name="birthDay"
              className={`w-full p-3 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                errors.birthDate ? 'border-red-500' : 'border-gray-300'
              } ${!birthDate.day ? 'text-gray-500' : ''} ${!birthDate.month || !birthDate.year ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={birthDate.day}
              onChange={onChange}
              disabled={!birthDate.month || !birthDate.year}
            >
              <option value="">日を選択</option>
              {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}日
                </option>
              ))}
            </select>
          </div>
        </div>
        {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
      </div>
      <button type="button" className="w-full py-2.5 px-5 rounded-md bg-[#ff702a] text-white font-bold cursor-pointer" onClick={onNext}>
        次へ
      </button>
    </FormCard>
  );
}

