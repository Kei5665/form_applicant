'use client';

import Image from 'next/image';

import FormCard from './FormCard';
import type { FormData, FormErrors } from '../types';

type NameCardProps = {
  stepImageSrc: string;
  formData: FormData;
  errors: FormErrors;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onPrevious: () => void;
  onNext: () => void;
  isActive: boolean;
};

export default function NameCard({ stepImageSrc, formData, errors, onChange, onBlur, onPrevious, onNext, isActive }: NameCardProps) {
  return (
    <FormCard isActive={isActive}>
      <Image className="w-full mb-4" src={stepImageSrc} alt="Step 2" width={300} height={50} />
      <div className="mb-7 text-left">
        <label className="font-bold mb-2.5 block text-gray-900">お名前（漢字）</label>
        <div className="flex justify-between mb-5">
          <div className="flex flex-col w-[45%]">
            <label htmlFor="lastName" className="mb-1 text-sm font-bold text-gray-900">
              姓
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="例: 田中"
              className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.lastName}
              onChange={onChange}
              onBlur={onBlur}
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
          <div className="flex flex-col w-[45%]">
            <label htmlFor="firstName" className="mb-1 text-sm font-bold text-gray-900">
              名
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="例: 太郎"
              className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.firstName}
              onChange={onChange}
              onBlur={onBlur}
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>
        </div>
      </div>
      <div className="mb-7 text-left">
        <label className="font-bold mb-2.5 block text-gray-900">お名前（ふりがな）</label>
        <div className="flex justify-between mb-5">
          <div className="flex flex-col w-[45%]">
            <label htmlFor="lastNameKana" className="mb-1 text-sm font-bold text-gray-900">
              せい
            </label>
            <input
              type="text"
              id="lastNameKana"
              name="lastNameKana"
              placeholder="例: たなか"
              className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.lastNameKana ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.lastNameKana}
              onChange={onChange}
            />
            {errors.lastNameKana && <p className="text-red-500 text-xs mt-1">{errors.lastNameKana}</p>}
          </div>
          <div className="flex flex-col w-[45%]">
            <label htmlFor="firstNameKana" className="mb-1 text-sm font-bold text-gray-900">
              めい
            </label>
            <input
              type="text"
              id="firstNameKana"
              name="firstNameKana"
              placeholder="例: たろう"
              className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.firstNameKana ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.firstNameKana}
              onChange={onChange}
            />
            {errors.firstNameKana && <p className="text-red-500 text-xs mt-1">{errors.firstNameKana}</p>}
          </div>
        </div>
      </div>
      <div className="mb-7 text-left">
        <label htmlFor="postalCode" className="block mb-1 text-gray-900">
          お住まいの郵便番号
          <br />
          ( ハイフンなし7桁 )
        </label>
        <input
          type="number"
          id="postalCode"
          name="postalCode"
          placeholder="例: 1234567"
          className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
          value={formData.postalCode}
          onChange={onChange}
          maxLength={7}
        />
        {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
      </div>
      <div className="flex justify-around items-center">
        <button type="button" className="py-2 px-4 font-bold cursor-pointer text-gray-800" onClick={onPrevious}>
          ＜ 戻る
        </button>
        <button type="button" className="w-[60%] py-2.5 px-5 rounded-md bg-[#ff702a] text-white font-bold cursor-pointer" onClick={onNext}>
          次へ
        </button>
      </div>
    </FormCard>
  );
}

