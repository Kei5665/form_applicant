'use client';

import Image from 'next/image';

import FormCard from './FormCard';
import type { FormErrors, JobCountResult } from '../types';

type PhoneNumberCardProps = {
  stepImageSrc: string;
  jobResult: JobCountResult;
  postalCode: string;
  showJobCount: boolean;
  errors: FormErrors;
  phoneError: string | null;
  phoneNumber: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPrevious: () => void;
  isSubmitDisabled: boolean;
  isActive: boolean;
};

export default function PhoneNumberCard({
  stepImageSrc,
  jobResult,
  postalCode,
  showJobCount,
  errors,
  phoneError,
  phoneNumber,
  onChange,
  onPrevious,
  isSubmitDisabled,
  isActive,
}: PhoneNumberCardProps) {
  return (
    <FormCard isActive={isActive}>
      <Image className="w-full mb-4" src={stepImageSrc} alt="Step 3" width={300} height={50} />
      {showJobCount && (
        <div className="mb-6">
          {postalCode && postalCode.length === 7 ? (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              {jobResult.isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce mr-2" />
                  <span className="text-blue-700 text-sm">求人件数を確認中...</span>
                </div>
              ) : jobResult.error ? (
                <p className="text-red-600 text-sm text-center">{jobResult.error}</p>
              ) : jobResult.jobCount !== null ? (
                <div className="text-center">
                  <p className="text-blue-800 font-bold text-xl mb-2">郵便番号 {postalCode} エリア</p>
                  <p className="text-blue-800 font-bold text-2xl mb-2">{jobResult.jobCount}件の求人があります</p>
                  <p className="text-blue-700 text-sm">{jobResult.message}</p>
                  {jobResult.jobCount > 0 && <p className="text-green-700 text-sm mt-2 font-medium">✅ お近くの求人をご案内できます！</p>}
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  <p>郵便番号を入力して求人を検索してください</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-600">
              <p>郵便番号を入力して求人を検索してください</p>
            </div>
          )}
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

