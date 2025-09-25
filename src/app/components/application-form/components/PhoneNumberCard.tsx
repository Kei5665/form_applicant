'use client';

import Image from 'next/image';

import FormCard from './FormCard';
import type { FormData, FormErrors, JobCountResult } from '../types';

type PhoneNumberCardProps = {
  stepImageSrc: string;
  jobResult: JobCountResult;
  showJobCount: boolean;
  postalCode: string;
  formData: FormData;
  errors: FormErrors;
  phoneError: string | null;
  phoneNumber: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onPrevious: () => void;
  isSubmitDisabled: boolean;
  isActive: boolean;
};

export default function PhoneNumberCard({
  stepImageSrc,
  jobResult,
  showJobCount,
  postalCode,
  formData,
  errors,
  phoneError,
  phoneNumber,
  onChange,
  onBlur,
  onPrevious,
  isSubmitDisabled,
  isActive,
}: PhoneNumberCardProps) {
  return (
    <FormCard isActive={isActive} className="pb-6">
      <Image className="w-full mb-4" src={stepImageSrc} alt="Step 4" width={300} height={50} />

      <div className="mb-6 text-left">
        <label className="font-bold mb-2.5 block text-gray-900">お名前（漢字）</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          placeholder="例: 田中 太郎"
          className={`p-3 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
          value={formData.fullName}
          onChange={onChange}
          onBlur={onBlur}
        />
        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
      </div>

      <div className="mb-6 text-left">
        <label className="font-bold mb-2.5 block text-gray-900">お名前（ふりがな）</label>
        <input
          type="text"
          id="fullNameKana"
          name="fullNameKana"
          placeholder="例: たなか たろう"
          className={`p-3 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.fullNameKana ? 'border-red-500' : 'border-gray-300'} ${formData.fullNameKana && !errors.fullNameKana ? 'text-gray-900' : ''}`}
          value={formData.fullNameKana}
          onChange={onChange}
        />
        {errors.fullNameKana && <p className="text-red-500 text-xs mt-1">{errors.fullNameKana}</p>}
      </div>

      {showJobCount && (
        <div className="mb-6">
          <div className={`rounded-lg border ${jobResult.jobCount !== null ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 text-gray-600'} p-4 text-center text-sm`}>
            {jobResult.isLoading ? (
              <div className="flex items-center justify-center text-blue-700">
                <div className="mr-2 h-4 w-4 animate-bounce rounded-full bg-blue-500" />
                <span>求人件数を確認中...</span>
              </div>
            ) : jobResult.error ? (
              <p className="text-red-600">{jobResult.error}</p>
            ) : jobResult.jobCount !== null ? (
              <div>
                <p className="text-base font-bold text-blue-900">
                  {jobResult.searchArea ? `${jobResult.searchArea}` : postalCode ? `郵便番号 ${postalCode} エリア` : '選択エリア'}
                </p>
                <p className="text-xl font-bold text-blue-900">{jobResult.jobCount}件の求人があります</p>
                <p>{jobResult.message}</p>
                {jobResult.jobCount > 0 && <p className="mt-2 font-medium text-green-700">✅ お近くの求人をご案内できます！</p>}
              </div>
            ) : (
              <p>郵便番号を入力するか地域を選択して求人を検索してください</p>
            )}
          </div>
        </div>
      )}

      <div className="mb-6 text-left">
        <label htmlFor="phoneNumber" className="block mb-1 text-gray-900">
          携帯番号
          <br />
          ( ハイフンなし11桁 )
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          placeholder="例: 09012345678"
          className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.phoneNumber || phoneError ? 'border-red-500' : 'border-gray-300'}`}
          value={phoneNumber}
          onChange={onChange}
          maxLength={11}
        />
        {(errors.phoneNumber || phoneError) && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber || phoneError}</p>}
      </div>

      <div className="flex justify-around items-center">
        <button type="button" className="py-2 px-4 font-bold cursor-pointer text-gray-800 mb-0" onClick={onPrevious}>
          ＜ 戻る
        </button>
        <button
          type="submit"
          className={`w-[60%] py-2.5 px-5 rounded-md text-white font-bold cursor-pointer ${isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ff702a]'}`}
          disabled={isSubmitDisabled}
        >
          送信
        </button>
      </div>
    </FormCard>
  );
}

