'use client';

import Image from 'next/image';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

import { BirthDateCard, FormExitModal, JobTimingCard, NameCard, PhoneNumberCard } from './application-form/components';
import { useApplicationFormState } from './application-form/hooks/useApplicationFormState';
import type { PeopleImageVariant } from './application-form/types';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

interface ApplicationFormProps {
  peopleImageSrc: string;
  peopleImageAlt?: string;
  showPeopleImage?: boolean;
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
  enableJobTimingStep?: boolean;
  useModal?: boolean;
}

function ApplicationFormInner({
  peopleImageSrc,
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
  showHeader = true,
  showLoadingScreen = true,
  enableJobTimingStep = true,
  useModal = true,
  peopleImageAlt = '応募フォームイメージ',
  showPeopleImage = true,
}: ApplicationFormProps) {
  const imagesToPreload = useMemo(() => [headerLogoSrc, step1ImageSrc, step2ImageSrc, step3ImageSrc], [headerLogoSrc, step1ImageSrc, step2ImageSrc, step3ImageSrc]);

  const {
    loading,
    cardStates,
    formData,
    errors,
    phoneError,
    emailError,
    isSubmitDisabled,
    isSubmitting,
    jobResult,
    showExitModal,
    handleInputChange,
    handleJobTimingSelect,
    handleNameBlur,
    handleNextCard1,
    handleNextCard2,
    handleNextCard3,
    handlePreviousCard,
    handleSubmit,
    hideExitModal,
    confirmExit,
    exitModalVariant,
  } = useApplicationFormState({
    showLoadingScreen,
    imagesToPreload,
    variant,
    formOrigin,
    enableJobTimingStep,
  });

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!useModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [useModal]);

  const formWrapperClassName = useModal
    ? 'relative w-full max-w-sm px-1 py-6 max-h-[calc(100vh-3rem)] overflow-y-auto no-scrollbar'
    : 'relative w-full max-w-sm px-1 mx-auto no-scrollbar';

  const formContent = (
    <form onSubmit={handleSubmit} id="form" noValidate className="relative pb-4">
      {showPeopleImage && peopleImageSrc && (
        <div className="mb-6 flex justify-center">
          <Image src={peopleImageSrc} alt={peopleImageAlt} width={320} height={180} className="h-auto w-full max-w-[320px]" priority={formOrigin === 'coupang'} />
        </div>
      )}

      {enableJobTimingStep && (
        <JobTimingCard
          selectedTiming={formData.jobTiming}
          errors={errors}
          onSelect={handleJobTimingSelect}
          isActive={cardStates.isCard1Active}
        />
      )}

      <BirthDateCard
        stepImageSrc={step1ImageSrc}
        birthDate={formData.birthDate}
        errors={errors}
        onChange={handleInputChange}
        onNext={enableJobTimingStep ? handleNextCard2 : handleNextCard1}
        onPrevious={enableJobTimingStep ? handlePreviousCard : undefined}
        isActive={enableJobTimingStep ? cardStates.isCard2Active : cardStates.isCard1Active}
      />

      <NameCard
        stepImageSrc={step2ImageSrc}
        postalCode={formData.postalCode}
        prefectureId={formData.prefectureId}
        municipalityId={formData.municipalityId}
        errors={errors}
        onChange={handleInputChange}
        onPrevious={handlePreviousCard}
        onNext={enableJobTimingStep && handleNextCard3 ? handleNextCard3 : handleNextCard2}
        isActive={enableJobTimingStep ? cardStates.isCard3Active : cardStates.isCard2Active}
      />

      <PhoneNumberCard
        stepImageSrc={step3ImageSrc}
        jobResult={jobResult}
        showJobCount={formOrigin !== 'coupang'}
        formData={formData}
        errors={errors}
        phoneError={phoneError}
        emailError={emailError}
        phoneNumber={formData.phoneNumber}
        onChange={handleInputChange}
        onBlur={handleNameBlur}
        onPrevious={handlePreviousCard}
        isSubmitDisabled={isSubmitDisabled}
        isSubmitting={isSubmitting}
        isActive={enableJobTimingStep ? cardStates.isCard4Active : cardStates.isCard3Active}
        showEmailField={formOrigin === 'coupang'}
      />
    </form>
  );

  const modal = (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-4 ${containerClassName}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-form-title"
    >
      {showHeader && (
        <header className="fixed top-0 z-[10001] flex w-full justify-center">
          <div className="flex w-full max-w-md items-center justify-between bg-white px-4 py-4">
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
          className={`absolute inset-0 flex flex-col items-center justify-center bg-white transition-all duration-700 ease-out z-[10001] ${
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

      <div ref={modalContentRef} className={formWrapperClassName}>
        {formContent}
      </div>
      <FormExitModal isOpen={showExitModal} onClose={hideExitModal} onConfirm={confirmExit} variant={exitModalVariant} />
    </div>
  );

  if (useModal) {
    if (typeof window === 'undefined') {
      return modal;
    }

    const portalRoot = document.getElementById('modal-root');

    if (portalRoot) {
      return createPortal(modal, portalRoot);
    }

    return modal;
  }

  return (
    <div className={`flex justify-center px-4 ${containerClassName}`.trim()}>
      <div className={formWrapperClassName}>{formContent}</div>
      <FormExitModal isOpen={showExitModal} onClose={hideExitModal} onConfirm={confirmExit} variant={exitModalVariant} />
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

