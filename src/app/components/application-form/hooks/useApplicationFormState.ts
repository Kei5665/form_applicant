'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { FormData, FormErrors, FormOrigin, JobCountResult, PeopleImageVariant } from '../types';
import { useHiraganaConverter } from './useHiraganaConverter';
import { useFormExitGuard } from './useFormExitGuard';
import { useImagePreloader } from './useImagePreloader';
import { trackEvent } from '../utils/trackEvent';
import { isValidPhoneNumber, validateBirthDateCard, validateCard2, validateFinalStep, validateJobTiming, validateNameFields } from '../utils/validators';
import { fetchJobCount, type JobCountParams } from '../utils/fetchJobCount';
import { notifyInvalidPhoneNumber } from '../utils/notifyInvalidPhoneNumber';

type UseApplicationFormStateParams = {
  showLoadingScreen: boolean;
  imagesToPreload: string[];
  variant: PeopleImageVariant;
  formOrigin: FormOrigin;
  enableJobTimingStep: boolean;
};

const initialFormData: FormData = {
  jobTiming: '',
  birthDate: '',
  fullName: '',
  fullNameKana: '',
  postalCode: '',
  prefectureId: '',
  municipalityId: '',
  phoneNumber: '',
};

export function useApplicationFormState({ showLoadingScreen, imagesToPreload, variant, formOrigin, enableJobTimingStep }: UseApplicationFormStateParams) {
  const router = useRouter();
  const [loading, setLoading] = useState(showLoadingScreen);
  const [currentCardIndex, setCurrentCardIndex] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [jobResult, setJobResult] = useState<JobCountResult>({ jobCount: null, message: '', isLoading: false, error: '' });

  const markFormClean = useCallback(() => {
    setIsFormDirty(false);
  }, []);

  useImagePreloader({ images: imagesToPreload, onComplete: () => setLoading(false), enable: showLoadingScreen });
  useFormExitGuard({ isFormDirty, currentCardIndex, setShowExitModal, markFormClean });

  useEffect(() => {
    trackEvent('experiment_impression', { experiment: 'people_image', variant });
    trackEvent('step_view', { step_name: 'step_1', step_number: 1 });
  }, [variant]);

  const hiraganaConverter = useHiraganaConverter();

  const loadJobCount = useCallback(async (params: Partial<JobCountParams>) => {
    const hasPostal = 'postalCode' in params && typeof params.postalCode === 'string';
    const hasPref = 'prefectureId' in params && typeof params.prefectureId === 'string';
    const hasMunicipality = 'municipalityId' in params && typeof params.municipalityId === 'string';

    if (!hasPostal && !hasPref && !hasMunicipality) {
      setJobResult({ jobCount: null, message: '', isLoading: false, error: '' });
      return;
    }
    setJobResult((prev) => ({ ...prev, isLoading: true, error: '' }));
    try {
      const result = await fetchJobCount(
        hasPostal
          ? { postalCode: params.postalCode as string }
          : hasPref
            ? { prefectureId: params.prefectureId as string }
            : { municipalityId: params.municipalityId as string }
      );
      setJobResult({
        jobCount: result.jobCount,
        message: result.message,
        isLoading: false,
        error: result.error ?? '',
        searchMethod: result.searchMethod,
        searchArea: result.searchArea,
      });
    } catch (error) {
      console.error('Error fetching job count:', error);
      setJobResult({ jobCount: null, message: '', isLoading: false, error: '求人件数の取得中にエラーが発生しました' });
    }
  }, []);

  const validatePhoneNumberInput = useCallback(
    (phoneNumber: string) => {
      const trimmed = phoneNumber.trim();
      if (trimmed.length < 11) {
        setPhoneError(null);
        setIsSubmitDisabled(true);
        return;
      }
      if (!isValidPhoneNumber(trimmed)) {
        setPhoneError('有効な携帯番号を入力してください。');
        setIsSubmitDisabled(true);
        notifyInvalidPhoneNumber({ fullName: formData.fullName, phoneNumber: trimmed });
      } else {
        setPhoneError(null);
        setIsSubmitDisabled(false);
      }
    },
    [formData]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name } = event.target;
      let { value } = event.target as HTMLInputElement & { value: string };

      if (name === 'phoneNumber') {
        value = value.replace(/[-－ー]/g, '');
      }

      if (name === 'birthDate') {
        value = value.replace(/\D/g, '').slice(0, 8);
      }

      if (name === 'fullNameKana') {
        value = value.replace(/[^ぁ-んー\s]/g, '');
      }

      setFormData((prev) => {
        if (name === 'jobTiming') {
          return {
            ...prev,
            jobTiming: value as FormData['jobTiming'],
          };
        }

        if (name === 'prefectureId') {
          return {
            ...prev,
            prefectureId: value,
            municipalityId: '',
            postalCode: '',
          };
        }

        if (name === 'municipalityId') {
          return {
            ...prev,
            municipalityId: value,
            postalCode: '',
          };
        }

        if (name === 'postalCode') {
          return {
            ...prev,
            postalCode: value,
            prefectureId: '',
            municipalityId: '',
          };
        }

        return { ...prev, [name]: value };
      });

      if (!isFormDirty) setIsFormDirty(true);

      setErrors((prev) => {
        const next = { ...prev };
        if (name === 'birthDate') {
          next.birthDate = '';
        } else if (name === 'jobTiming') {
          next.jobTiming = '';
        } else if (name === 'prefectureId') {
          next.prefectureId = '';
          next.municipalityId = '';
          next.postalCode = '';
        } else if (name === 'municipalityId') {
          next.municipalityId = '';
          next.postalCode = '';
        } else if (name === 'postalCode') {
          next.postalCode = '';
          next.prefectureId = '';
          next.municipalityId = '';
        } else if (name in next) {
          next[name as keyof FormErrors] = '';
        }
        return next;
      });

      if (name === 'phoneNumber') {
        validatePhoneNumberInput(value);
      }

      if (name === 'postalCode') {
        if (value.length === 7 && formOrigin !== 'coupang') {
          loadJobCount({ postalCode: value });
        } else {
          setJobResult({ jobCount: null, message: '', isLoading: false, error: '' });
        }
      } else if (name === 'prefectureId') {
        if (value) {
          loadJobCount({ prefectureId: value });
        } else {
          setJobResult({ jobCount: null, message: '', isLoading: false, error: '' });
        }
      } else if (name === 'municipalityId') {
        if (value) {
          loadJobCount({ municipalityId: value });
        } else if (formData.prefectureId) {
          loadJobCount({ prefectureId: formData.prefectureId });
        } else {
          setJobResult({ jobCount: null, message: '', isLoading: false, error: '' });
        }
      }
    },
    [formData.prefectureId, formOrigin, isFormDirty, loadJobCount, validatePhoneNumberInput]
  );

  const handleNameBlur = useCallback(
    async (event: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      if (name === 'fullName' && value.trim()) {
        const hiragana = await hiraganaConverter(value);
        if (hiragana) {
          setFormData((prev) => (prev.fullNameKana ? prev : { ...prev, fullNameKana: hiragana }));
        }
      }
    },
    [hiraganaConverter]
  );

  const handleNextCard1 = useCallback(
    (jobTimingValue?: FormData['jobTiming']) => {
      if (enableJobTimingStep) {
        const value = jobTimingValue ?? formData.jobTiming;
        const result = validateJobTiming(value);
        setErrors(result.errors);
        if (result.isValid) {
          trackEvent('step_complete', { step_name: 'step_1', step_number: 1 });
          setCurrentCardIndex(2);
          trackEvent('step_view', { step_name: 'step_2', step_number: 2 });
        }
      } else {
        const result = validateBirthDateCard(formData.birthDate);
        setErrors(result.errors);
        if (result.isValid) {
          trackEvent('step_complete', { step_name: 'step_1', step_number: 1 });
          setCurrentCardIndex(2);
          trackEvent('step_view', { step_name: 'step_2', step_number: 2 });
        }
      }
    },
    [enableJobTimingStep, formData.birthDate, formData.jobTiming]
  );

  const handleJobTimingSelect = useCallback(
    (value: FormData['jobTiming']) => {
      if (!enableJobTimingStep) return;
      setFormData((prev) => ({ ...prev, jobTiming: value }));
      setErrors((prev) => ({ ...prev, jobTiming: '' }));
      if (!isFormDirty) {
        setIsFormDirty(true);
      }
      handleNextCard1(value);
    },
    [enableJobTimingStep, handleNextCard1, isFormDirty]
  );

  const handleNextCard2 = useCallback(() => {
    const result = validateBirthDateCard(formData.birthDate);
    setErrors(result.errors);
    if (result.isValid) {
      trackEvent('step_complete', { step_name: enableJobTimingStep ? 'step_2' : 'step_1', step_number: enableJobTimingStep ? 2 : 1 });
      setCurrentCardIndex((prev) => prev + 1);
      trackEvent('step_view', { step_name: enableJobTimingStep ? 'step_3' : 'step_2', step_number: enableJobTimingStep ? 3 : 2 });
    }
  }, [enableJobTimingStep, formData.birthDate]);

  const handleNextCard3 = useCallback(() => {
    const result = validateCard2(formData);
    setErrors(result.errors);
    if (result.isValid) {
      trackEvent('step_complete', { step_name: enableJobTimingStep ? 'step_3' : 'step_2', step_number: enableJobTimingStep ? 3 : 2 });
      setCurrentCardIndex((prev) => prev + 1);
      trackEvent('step_view', { step_name: enableJobTimingStep ? 'step_4' : 'step_3', step_number: enableJobTimingStep ? 4 : 3 });
      if (formOrigin !== 'coupang') {
        if (formData.municipalityId) {
          loadJobCount({ municipalityId: formData.municipalityId });
        } else if (formData.prefectureId) {
          loadJobCount({ prefectureId: formData.prefectureId });
        } else if (formData.postalCode.length === 7) {
          loadJobCount({ postalCode: formData.postalCode });
        }
      }
    }
  }, [enableJobTimingStep, formData, formOrigin, loadJobCount]);

  const handlePreviousCard = useCallback(() => {
    setCurrentCardIndex((prev) => {
      const next = Math.max(prev - 1, 1);
      if (next !== prev) {
        trackEvent('step_view', { step_name: `step_${next}`, step_number: next });
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nameValidation = validateNameFields(formData);
      if (!nameValidation.isValid) {
        setErrors((prev) => ({ ...prev, ...nameValidation.errors }));
        setIsSubmitDisabled(true);
        return;
      }
      const phoneValidation = validateFinalStep(formData.phoneNumber);
      if (!phoneValidation.isValid) {
        setErrors((prev) => ({ ...prev, ...phoneValidation.errors }));
        setIsSubmitDisabled(true);
        return;
      }
      setIsSubmitDisabled(false);
      trackEvent('form_submit', { form_name: 'ridejob_application' });

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const utmParams = {
          utm_source: urlParams.get('utm_source') || '',
          utm_medium: urlParams.get('utm_medium') || '',
          utm_campaign: urlParams.get('utm_campaign') || '',
          utm_term: urlParams.get('utm_term') || '',
        };

        const birthDateString = formData.birthDate.length === 8
          ? `${formData.birthDate.slice(0, 4)}-${formData.birthDate.slice(4, 6)}-${formData.birthDate.slice(6, 8)}`
          : '';

        const { fetchPrefectureName, fetchMunicipalityName } = await import('@/lib/locationClient');
        const prefectureName = formData.prefectureId ? await fetchPrefectureName(formData.prefectureId) : '';
        const municipalityName = formData.municipalityId
          ? await fetchMunicipalityName(formData.municipalityId)
          : '';

        const body = {
          ...formData,
          birthDate: birthDateString,
          prefectureName,
          municipalityName,
          utmParams,
          experiment: { name: 'people_image', variant },
          formOrigin,
        } as Record<string, unknown>;

        const response = await fetch('/api/applicants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorResult = await response.json();
          alert(`エラーが発生しました: ${errorResult.message || 'サーバーエラー'}`);
          return;
        }

        await response.json();
        setIsFormDirty(false);
        const targetPath = formOrigin === 'coupang' ? '/coupang/applicants/new' : '/applicants/new';
        router.push(targetPath);
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('フォームの送信中にエラーが発生しました。ネットワーク接続を確認してください。');
      }
    },
    [formData, formOrigin, router, variant]
  );

  const cardStates = useMemo(
    () => {
      if (enableJobTimingStep) {
        return {
          isCard1Active: currentCardIndex === 1,
          isCard2Active: currentCardIndex === 2,
          isCard3Active: currentCardIndex === 3,
          isCard4Active: currentCardIndex === 4,
        };
      }

      return {
        isCard1Active: currentCardIndex === 1,
        isCard2Active: currentCardIndex === 2,
        isCard3Active: currentCardIndex === 3,
        isCard4Active: false,
      };
    },
    [currentCardIndex, enableJobTimingStep]
  );

  return {
    loading,
    cardStates,
    formData,
    errors,
    phoneError,
    isSubmitDisabled,
    showExitModal,
    jobResult,
    handleInputChange,
    handleJobTimingSelect,
    handleNameBlur,
    handleNextCard1,
    handleNextCard2,
    ...(enableJobTimingStep
      ? { handleNextCard3 }
      : {}),
    handlePreviousCard,
    handleSubmit,
    setShowExitModal,
    markFormClean,
  };
}

