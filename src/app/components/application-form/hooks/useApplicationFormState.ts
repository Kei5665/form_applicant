'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { FormData, FormErrors, FormOrigin, JobCountResult, PeopleImageVariant } from '../types';
import { useHiraganaConverter } from './useHiraganaConverter';
import { useFormExitGuard } from './useFormExitGuard';
import { useImagePreloader } from './useImagePreloader';
import { trackEvent } from '../utils/trackEvent';
import { isValidPhoneNumber, validateCard1, validateCard2, validateFinalStep } from '../utils/validators';
import { fetchJobCount } from '../utils/fetchJobCount';
import { notifyInvalidPhoneNumber } from '../utils/notifyInvalidPhoneNumber';

type UseApplicationFormStateParams = {
  showLoadingScreen: boolean;
  imagesToPreload: string[];
  variant: PeopleImageVariant;
  formOrigin: FormOrigin;
};

const initialFormData: FormData = {
  birthDate: { year: '', month: '', day: '' },
  lastName: '',
  firstName: '',
  lastNameKana: '',
  firstNameKana: '',
  postalCode: '',
  phoneNumber: '',
};

export function useApplicationFormState({ showLoadingScreen, imagesToPreload, variant, formOrigin }: UseApplicationFormStateParams) {
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

  const loadJobCount = useCallback(async (postalCode: string) => {
    setJobResult((prev) => ({ ...prev, isLoading: true, error: '' }));
    try {
      const result = await fetchJobCount(postalCode);
      setJobResult({ jobCount: result.jobCount, message: result.message, isLoading: false, error: result.error ?? '' });
    } catch (error) {
      console.error('Error fetching job count:', error);
      setJobResult({ jobCount: null, message: '', isLoading: false, error: '求人件数の取得中にエラーが発生しました' });
    }
  }, []);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name } = event.target;
      let { value } = event.target as HTMLInputElement & { value: string };

      if (name === 'phoneNumber') {
        value = value.replace(/[-－ー]/g, '');
      }

      if (name === 'birthYear' || name === 'birthMonth' || name === 'birthDay') {
        const field = name.replace('birth', '').toLowerCase();
        setFormData((prev) => ({
          ...prev,
          birthDate: { ...prev.birthDate, [field]: value },
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }

      if (!isFormDirty) setIsFormDirty(true);

      setErrors((prev) => {
        const next = { ...prev };
        if (name === 'birthYear' || name === 'birthMonth' || name === 'birthDay') {
          next.birthDate = '';
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
          loadJobCount(value);
        } else {
          setJobResult({ jobCount: null, message: '', isLoading: false, error: '' });
        }
      }
    },
    [formOrigin, isFormDirty, loadJobCount]
  );

  const handleNameBlur = useCallback(
    async (event: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      if ((name === 'lastName' || name === 'firstName') && value.trim()) {
        const hiragana = await hiraganaConverter(value);
        if (hiragana) {
          const target = name === 'lastName' ? 'lastNameKana' : 'firstNameKana';
          setFormData((prev) => ({ ...prev, [target]: hiragana }));
        }
      }
    },
    [hiraganaConverter]
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
        notifyInvalidPhoneNumber({ ...formData, phoneNumber: trimmed });
      } else {
        setPhoneError(null);
        setIsSubmitDisabled(false);
      }
    },
    [formData]
  );

  const handleNextCard1 = useCallback(() => {
    const result = validateCard1(formData.birthDate);
    setErrors(result.errors);
    if (result.isValid) {
      trackEvent('step_complete', { step_name: 'step_1', step_number: 1 });
      setCurrentCardIndex(2);
      trackEvent('step_view', { step_name: 'step_2', step_number: 2 });
    }
  }, [formData.birthDate]);

  const handleNextCard2 = useCallback(() => {
    const result = validateCard2(formData);
    setErrors(result.errors);
    if (result.isValid) {
      trackEvent('step_complete', { step_name: 'step_2', step_number: 2 });
      setCurrentCardIndex(3);
      trackEvent('step_view', { step_name: 'step_3', step_number: 3 });
      if (formOrigin !== 'coupang' && formData.postalCode.length === 7) {
        loadJobCount(formData.postalCode);
      }
    }
  }, [formData, formOrigin, loadJobCount]);

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

        const birthDateString = formData.birthDate.year && formData.birthDate.month && formData.birthDate.day
          ? `${formData.birthDate.year}-${formData.birthDate.month.padStart(2, '0')}-${formData.birthDate.day.padStart(2, '0')}`
          : '';

        const body = {
          ...formData,
          birthDate: birthDateString,
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
    () => ({
      isCard1Active: currentCardIndex === 1,
      isCard2Active: currentCardIndex === 2,
      isCard3Active: currentCardIndex === 3,
    }),
    [currentCardIndex]
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
    handleNameBlur,
    handleNextCard1,
    handleNextCard2,
    handlePreviousCard,
    handleSubmit,
    setShowExitModal,
    markFormClean,
  };
}

