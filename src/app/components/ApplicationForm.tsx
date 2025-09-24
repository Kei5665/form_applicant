'use client';

import Image from 'next/image';
import { Suspense, useMemo } from 'react';

import { BirthDateCard, NameCard, PhoneNumberCard } from './application-form/components';
import { useApplicationFormState } from './application-form/hooks/useApplicationFormState';
import type { PeopleImageVariant } from './application-form/types';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

interface ApplicationFormProps {
  peopleImageSrc: string;
  variant: PeopleImageVariant;
  formOrigin?: 'coupang' | 'default';
  headerLogoSrc?: string;
  headerUpperText?: string;
  headerLowerText?: string;
  containerClassName?: string;
  loadingLogoSrc?: string;
  step1ImageSrc?: string;
  step2ImageSrc?: string;
  step3ImageSrc?: string;
  footerLogoSrc?: string;
  bottomImageSrc?: string;
  showBottomImage?: boolean;
  showHeader?: boolean;
  footerBgClassName?: string;
  showLoadingScreen?: boolean;
  showFooterLogo?: boolean;
}

function ApplicationFormInner({
  peopleImageSrc,
  variant,
  formOrigin = 'default',
  headerLogoSrc = '/images/ride_logo.svg',
  headerUpperText = '未経験でタクシー会社に就職するなら',
  headerLowerText = 'RIDE JOB（ライドジョブ）',
  containerClassName = '',
  loadingLogoSrc = '/images/ride_logo.svg',
  step1ImageSrc = '/images/STEP1.png',
  step2ImageSrc = '/images/STEP2.png',
  step3ImageSrc = '/images/STEP3.png',
  footerLogoSrc = '/images/ride_logo.svg',
  bottomImageSrc = '/images/car.png',
  showBottomImage = true,
  showHeader = true,
  footerBgClassName = 'bg-[#6DCFE4]',
  showLoadingScreen = true,
  showFooterLogo = true,
}: ApplicationFormProps) {
  const imagesToPreload = useMemo(() => [headerLogoSrc, peopleImageSrc, step1ImageSrc], [headerLogoSrc, peopleImageSrc, step1ImageSrc]);

  const {
    loading,
    cardStates,
    formData,
    errors,
    phoneError,
    isSubmitDisabled,
    showExitModal,
    jobResult,
    handleInputChange,
    handleNameBlur,
    handleNextCard1,
    handleNextCard2,
    handlePreviousCard,
    handleSubmit,
    setShowExitModal,
    markFormClean,
  } = useApplicationFormState({
    showLoadingScreen,
    imagesToPreload,
    variant,
    formOrigin,
  });

  return (
    <div className={`mx-auto max-w-md ${containerClassName}`}>
      {showLoadingScreen && (
        <div
          id="loading-screen"
          className={`fixed top-0 left-0 w-full h-full bg-white bg-opacity-90 flex flex-col justify-center items-center z-[9999] transition-all duration-1000 ease-out ${
            loading ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <Image src={loadingLogoSrc} alt="Ride Job Logo" width={200} height={50} className="w-1/2 mb-4" />
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce" />
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce delay-150" />
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce delay-300" />
          </div>
        </div>
      )}

      {showHeader && (
        <header className="flex items-center justify-between p-1.5 bg-white w-[95%] mx-auto mt-2.5 rounded-md shadow">
          <div className="pl-2.5">
            <Image src={headerLogoSrc} alt="Ride Job Logo" width={120} height={30} className="h-[30px] w-auto" priority loading="eager" />
          </div>
          <div className="text-right pr-2.5">
            <p className="text-xs text-gray-800 my-1">{headerUpperText}</p>
            <p className="text-xs text-black font-bold my-1">{headerLowerText}</p>
          </div>
        </header>
      )}

      <div className="container mx-auto text-center px-2 flex justify-center my-4">
        <Image src={peopleImageSrc} alt="" width={500} height={150} className="w-full max-w-lg" priority loading="eager" />
      </div>

      <form onSubmit={handleSubmit} id="form" className="flex justify-center">
        <div className="relative w-full flex justify-center">
          <BirthDateCard
            stepImageSrc={step1ImageSrc}
            birthDate={formData.birthDate}
            errors={errors}
            onChange={handleInputChange}
            onNext={handleNextCard1}
            isActive={cardStates.isCard1Active}
          />

          <NameCard
            stepImageSrc={step2ImageSrc}
            formData={formData}
            errors={errors}
            onChange={handleInputChange}
            onBlur={handleNameBlur}
            onPrevious={handlePreviousCard}
            onNext={handleNextCard2}
            isActive={cardStates.isCard2Active}
          />

          <PhoneNumberCard
            stepImageSrc={step3ImageSrc}
            jobResult={jobResult}
            postalCode={formData.postalCode}
            showJobCount={formOrigin !== 'coupang'}
            errors={errors}
            phoneError={phoneError}
            phoneNumber={formData.phoneNumber}
            onChange={handleInputChange}
            onPrevious={handlePreviousCard}
            isSubmitDisabled={isSubmitDisabled}
            isActive={cardStates.isCard3Active}
          />
        </div>
      </form>

      {showBottomImage && bottomImageSrc && (
        <div className="relative text-center mt-4">
          <Image className="w-1/2 inline-block" src={bottomImageSrc} alt="Taxi" width={200} height={100} />
        </div>
      )}

      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">ページを離れますか？</h3>
            </div>
            <p className="text-gray-600 mb-6">入力中のデータが失われる可能性があります。</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowExitModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                キャンセル
              </button>
              <button
                onClick={() => {
                  markFormClean();
                  setShowExitModal(false);
                  window.history.back();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                離れる
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className={`text-white py-5 mt-8 ${footerBgClassName}`}>
        <div className="container mx-auto px-4">
          {showFooterLogo && (
            <div className="text-center mb-5">
              <Image className="mb-5 w-1/4 sm:w-1/6 md:w-[150px] inline-block" src={footerLogoSrc} alt="Footer Logo" width={150} height={40} />
            </div>
          )}
          <div className="flex flex-col md:flex-row justify-around items-center text-center md:text-left text-xs mb-3 space-y-2 md:space-y-0">
            <a href="https://pmagent.jp/" className="text-white hover:underline">
              運営会社について
            </a>
            <a href="/privacy" className="text-white hover:underline">
              プライバシーポリシー
            </a>
          </div>
          <div className="text-center mt-3">
            <p className="text-xs">© 2025 株式会社PMAgent</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ApplicationForm(props: ApplicationFormProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplicationFormInner {...props} />
    </Suspense>
  );
}

