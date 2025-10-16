'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { FormData, FormErrors, FormOrigin, JobCountResult, PeopleImageVariant } from '../types';
import { useHiraganaConverter } from './useHiraganaConverter';
import { useFormExitGuard } from './useFormExitGuard';
import { useImagePreloader } from './useImagePreloader';
import { trackEvent } from '../utils/trackEvent';
import { isValidEmail, isValidPhoneNumber, validateBirthDateCard, validateCard2, validateFinalStep, validateJobTiming, validateNameFields } from '../utils/validators';
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
  email: '',
};

export function useApplicationFormState({ showLoadingScreen, imagesToPreload, variant, formOrigin, enableJobTimingStep }: UseApplicationFormStateParams) {
  const router = useRouter();
  const [loading, setLoading] = useState(showLoadingScreen);
  const [currentCardIndex, setCurrentCardIndex] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{ type: 'history-back' } | null>(null);
  const [exitModalVariant, setExitModalVariant] = useState<'default' | 'phone'>('default');
  const [jobResult, setJobResult] = useState<JobCountResult>({ jobCount: null, message: '', isLoading: false, error: '' });

  const markFormClean = useCallback(() => {
    setIsFormDirty(false);
  }, []);

  useImagePreloader({ images: imagesToPreload, onComplete: () => setLoading(false), enable: showLoadingScreen });
  useFormExitGuard({
    isFormDirty,
    currentCardIndex,
    setShowExitModal,
    markFormClean,
    setPendingNavigation,
    setExitModalVariant,
    phoneCardIndex: enableJobTimingStep ? 4 : 3,
  });

  const getStepNumber = useCallback(
    (cardIndex: number) => (enableJobTimingStep ? cardIndex - 1 : cardIndex),
    [enableJobTimingStep]
  );

  const getStepEventPayload = useCallback(
    (cardIndex: number) => {
      const stepNumber = getStepNumber(cardIndex);
      return {
        step_name: `step_${stepNumber}`,
        step_number: stepNumber,
      };
    },
    [getStepNumber]
  );

  const hideExitModal = useCallback(() => {
    setShowExitModal(false);
    setPendingNavigation(null);
    setExitModalVariant('default');
  }, []);

  const confirmExit = useCallback(() => {
    if (!pendingNavigation) {
      setShowExitModal(false);
      return;
    }

    setShowExitModal(false);
    markFormClean();
    const navigation = pendingNavigation;
    setPendingNavigation(null);
    setExitModalVariant('default');

    if (navigation.type === 'history-back') {
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    }
  }, [pendingNavigation, markFormClean, setExitModalVariant]);

  useEffect(() => {
    trackEvent('experiment_impression', { experiment: 'people_image', variant });
    trackEvent('step_view', getStepEventPayload(1));
  }, [variant, getStepEventPayload]);

  const hiraganaConverter = useHiraganaConverter();

  const loadJobCount = useCallback(async (params: Partial<JobCountParams>) => {
    const hasPostal = typeof params.postalCode === 'string' && params.postalCode.trim().length > 0;
    const hasPref = typeof params.prefectureId === 'string' && params.prefectureId.trim().length > 0;

    if (!hasPostal && !hasPref) {
      setJobResult({ jobCount: null, message: '', isLoading: false, error: '' });
      return;
    }
    setJobResult((prev) => ({ ...prev, isLoading: true, error: '' }));
    try {
      const result = await fetchJobCount(
        hasPostal
          ? { postalCode: params.postalCode as string }
          : { prefectureId: params.prefectureId as string }
      );
      setJobResult({
        jobCount: result.jobCount,
        message: result.message,
        isLoading: false,
        error: result.error ?? '',
        searchMethod: result.searchMethod,
        searchArea: result.searchArea,
        prefectureName: result.prefectureName,
        prefectureId: result.prefectureId,
      });
    } catch (error) {
      console.error('Error fetching job count:', error);
      setJobResult({ jobCount: null, message: '', isLoading: false, error: '求人件数の取得中にエラーが発生しました' });
    }
  }, []);

  const isSubmitReady = useCallback(
    (phoneNumber: string, email: string) => {
      const trimmedPhone = phoneNumber.trim();
      if (trimmedPhone.length !== 11 || !isValidPhoneNumber(trimmedPhone)) {
        return false;
      }
      if (formOrigin !== 'coupang') {
        return true;
      }
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        return false;
      }
      return isValidEmail(trimmedEmail);
    },
    [formOrigin]
  );

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
        const submitReady = isSubmitReady(trimmed, formData.email);
        setIsSubmitDisabled(!submitReady);
      }
    },
    [formData.email, formData.fullName, isSubmitReady]
  );

  const validateEmailInput = useCallback(
    (email: string) => {
      if (formOrigin !== 'coupang') {
        return;
      }
      const trimmed = email.trim();
      if (!trimmed) {
        setEmailError('メールアドレスを入力してください。');
        setIsSubmitDisabled(true);
        return;
      }
      if (!isValidEmail(trimmed)) {
        setEmailError('有効なメールアドレスを入力してください。');
        setIsSubmitDisabled(true);
        return;
      }
      setEmailError(null);
      const submitReady = isSubmitReady(formData.phoneNumber, trimmed);
      setIsSubmitDisabled(!submitReady);
    },
    [formData.phoneNumber, formOrigin, isSubmitReady]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name } = event.target;
      let { value } = event.target as HTMLInputElement & { value: string };

      if (name === 'phoneNumber') {
        value = value.replace(/[-－ー]/g, '');
      }

      if (name === 'email') {
        value = value.replace(/\s/g, '').toLowerCase();
      }

      if (name === 'birthDate') {
        value = value.replace(/\D/g, '').slice(0, 8);
      }

      if (name === 'fullNameKana') {
        const nativeEvent = event.nativeEvent as (InputEvent & { isComposing?: boolean }) | undefined;
        const isComposing = nativeEvent?.isComposing ?? false;
        const isInsertCompositionText = nativeEvent?.inputType === 'insertCompositionText';

        if (!isComposing && !isInsertCompositionText) {
          value = value.replace(/[^ぁ-んー\s]/g, '');
        }
      }

      setFormData((prev) => {
        if (name === 'jobTiming') {
          return {
            ...prev,
            jobTiming: value as FormData['jobTiming'],
          };
        }

        if (name === 'email') {
          return {
            ...prev,
            email: value,
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
        } else if (name === 'email') {
          next.email = '';
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

      if (name === 'email') {
        validateEmailInput(value);
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
      }
    },
    [formOrigin, isFormDirty, loadJobCount, validateEmailInput, validatePhoneNumberInput]
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
          trackEvent('step_complete', getStepEventPayload(1));
          setCurrentCardIndex(2);
          trackEvent('step_view', getStepEventPayload(2));
        }
      } else {
        const result = validateBirthDateCard(formData.birthDate);
        setErrors(result.errors);
        if (result.isValid) {
          trackEvent('step_complete', getStepEventPayload(1));
          setCurrentCardIndex(2);
          trackEvent('step_view', getStepEventPayload(2));
        }
      }
    }, [enableJobTimingStep, formData.birthDate, formData.jobTiming, getStepEventPayload]);

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
      trackEvent('step_complete', getStepEventPayload(enableJobTimingStep ? 2 : 1));
      setCurrentCardIndex((prev) => prev + 1);
      trackEvent('step_view', getStepEventPayload(enableJobTimingStep ? 3 : 2));
    }
  }, [enableJobTimingStep, formData.birthDate, getStepEventPayload]);

  const handleNextCard3 = useCallback(() => {
    const result = validateCard2(formData);
    setErrors(result.errors);
    if (result.isValid) {
      trackEvent('step_complete', getStepEventPayload(enableJobTimingStep ? 3 : 2));
      setCurrentCardIndex((prev) => prev + 1);
      trackEvent('step_view', getStepEventPayload(enableJobTimingStep ? 4 : 3));
      if (formOrigin !== 'coupang') {
        if (formData.prefectureId) {
          loadJobCount({ prefectureId: formData.prefectureId });
        } else if (formData.postalCode.length === 7) {
          loadJobCount({ postalCode: formData.postalCode });
        }
      }
    }
  }, [enableJobTimingStep, formData, formOrigin, loadJobCount, getStepEventPayload]);

  const handlePreviousCard = useCallback(() => {
    setCurrentCardIndex((prev) => {
      const next = Math.max(prev - 1, 1);
      if (next !== prev) {
        trackEvent('step_view', getStepEventPayload(next));
      }
      return next;
    });
  }, [getStepEventPayload]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting) {
        return;
      }
      const nameValidation = validateNameFields(formData);
      if (!nameValidation.isValid) {
        setErrors((prev) => ({ ...prev, ...nameValidation.errors }));
        setIsSubmitDisabled(true);
        return;
      }
      const finalValidation = validateFinalStep(formData, formOrigin === 'coupang');
      if (!finalValidation.isValid) {
        setErrors((prev) => ({ ...prev, ...finalValidation.errors }));
        setIsSubmitDisabled(true);
        return;
      }
      setIsSubmitting(true);
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
          setIsSubmitting(false);
          return;
        }

        await response.json();
        setIsFormDirty(false);

        // 都道府県IDとお名前をlocalStorageに保存（サンクスページで求人表示・パーソナライズ用）
        if (typeof window !== 'undefined') {
          // 都道府県IDを保存（formDataまたはjobResultから取得）
          const prefectureIdToSave = formData.prefectureId || jobResult.prefectureId;

          if (prefectureIdToSave) {
            localStorage.setItem('ridejob_prefecture_id', prefectureIdToSave);
          }

          if (formData.fullName) {
            localStorage.setItem('ridejob_user_name', formData.fullName);
          }
        }
        
        const targetPath = formOrigin === 'mechanic'
          ? '/mechanic/applicants/new'
          : formOrigin === 'coupang' ? '/coupang/applicants/new' : '/applicants/new';
        router.push(targetPath);
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('フォームの送信中にエラーが発生しました。ネットワーク接続を確認してください。');
        setIsSubmitting(false);
      }
    },
    [formData, formOrigin, router, variant, isSubmitting, jobResult.prefectureId]
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
    emailError,
    isSubmitDisabled,
    isSubmitting,
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
    hideExitModal,
    confirmExit,
    exitModalVariant,
    markFormClean,
  };
}

