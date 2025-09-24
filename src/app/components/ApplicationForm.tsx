'use client';

import Image from 'next/image';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

import { BirthDateCard, JobTimingCard, NameCard, PhoneNumberCard } from './application-form/components';
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
  step4ImageSrc?: string;
  footerLogoSrc?: string;
  bottomImageSrc?: string;
  showBottomImage?: boolean;
  showHeader?: boolean;
  footerBgClassName?: string;
  showLoadingScreen?: boolean;
  showFooterLogo?: boolean;
}

function ApplicationFormInner({
  variant,
  formOrigin = 'default',
  containerClassName = '',
  headerLogoSrc = '/images/ride_logo.svg',
  headerUpperText = '未経験でタクシー会社に就職するなら',
  headerLowerText = 'RIDE JOB（ライドジョブ）',
  loadingLogoSrc = '/images/ride_logo.svg',
  step1ImageSrc = '/images/STEP1.png',
  step2ImageSrc = '/images/STEP2.png',
  step3ImageSrc = '/images/STEP3.png',
  step4ImageSrc = '/images/STEP4.png',
  showHeader = true,
  showLoadingScreen = true,
}: ApplicationFormProps) {
  const imagesToPreload = useMemo(
    () => [headerLogoSrc, step1ImageSrc, step2ImageSrc, step3ImageSrc, step4ImageSrc],
    [headerLogoSrc, step1ImageSrc, step2ImageSrc, step3ImageSrc, step4ImageSrc]
  );

  const {
    loading,
    cardStates,
    formData,
    errors,
    phoneError,
    isSubmitDisabled,
    jobResult,
    handleInputChange,
    handleJobTimingSelect,
    handleNameBlur,
    handleNextCard1,
    handleNextCard2,
    handleNextCard3,
    handlePreviousCard,
    handleSubmit,
  } = useApplicationFormState({
    showLoadingScreen,
    imagesToPreload,
    variant,
    formOrigin,
  });

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const modal = (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-4 ${containerClassName}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-form-title"
    >
      {showHeader && (
        <header className="fixed top-0 left-0 right-0 z-[10001] flex w-full justify-center px-4 pt-3">
          <div className="flex w-[95%] max-w-md items-center justify-between rounded-lg bg-white px-4 py-2 shadow-lg">
            <Image src={headerLogoSrc} alt="Ride Job Logo" width={120} height={30} className="h-[30px] w-auto" priority loading="eager" />
            <div className="text-right">
              <p className="text-[11px] text-gray-700 leading-tight">{headerUpperText}</p>
              <p className="text-xs font-bold text-gray-900 leading-tight">{headerLowerText}</p>
            </div>
          </div>
        </header>
      )}

      {showLoadingScreen && (
        <div
          id="loading-screen"
          className={`absolute inset-0 flex flex-col items-center justify-center bg-white transition-all duration-700 ease-out ${
            loading ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          <Image src={loadingLogoSrc} alt="Ride Job Logo" width={200} height={50} className="w-36 mb-4" />
          <div className="flex space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce" />
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce delay-150" />
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce delay-300" />
          </div>
        </div>
      )}

      <div ref={modalContentRef} className="relative w-full max-w-sm max-h-[calc(100vh-112px)] overflow-y-auto px-1">
          <form onSubmit={handleSubmit} id="form" noValidate className="relative min-h-[720px] pb-4">
            <JobTimingCard
              stepImageSrc={step1ImageSrc}
              selectedTiming={formData.jobTiming}
              errors={errors}
              onSelect={handleJobTimingSelect}
              isActive={cardStates.isCard1Active}
            />

            <BirthDateCard
              stepImageSrc={step2ImageSrc}
              birthDate={formData.birthDate}
              errors={errors}
              onChange={handleInputChange}
              onNext={handleNextCard2}
              onPrevious={handlePreviousCard}
              isActive={cardStates.isCard2Active}
            />

            <NameCard
              stepImageSrc={step3ImageSrc}
              postalCode={formData.postalCode}
              prefectureId={formData.prefectureId}
              municipalityId={formData.municipalityId}
              errors={errors}
              onChange={handleInputChange}
              onPrevious={handlePreviousCard}
              onNext={handleNextCard3}
              isActive={cardStates.isCard3Active}
            />

            <PhoneNumberCard
              stepImageSrc={step4ImageSrc}
              jobResult={jobResult}
              showJobCount={formOrigin !== 'coupang'}
              postalCode={formData.postalCode}
              formData={formData}
              errors={errors}
              phoneError={phoneError}
              phoneNumber={formData.phoneNumber}
              onChange={handleInputChange}
              onBlur={handleNameBlur}
              onPrevious={handlePreviousCard}
              isSubmitDisabled={isSubmitDisabled}
              isActive={cardStates.isCard4Active}
            />
          </form>
      </div>
    </div>
  );

  if (typeof window === 'undefined') {
    return modal;
  }

  const portalRoot = document.getElementById('modal-root');

  if (portalRoot) {
    return createPortal(modal, portalRoot);
  }

  return modal;
}

export default function ApplicationForm(props: ApplicationFormProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplicationFormInner {...props} />
    </Suspense>
  );
}

