'use client';

import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export type PeopleImageVariant = 'A' | 'B';

type FormErrors = {
  birthDate?: string;
  lastName?: string;
  firstName?: string;
  lastNameKana?: string;
  firstNameKana?: string;
  postalCode?: string;
  phoneNumber?: string;
};

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
}: ApplicationFormProps) {
  const router = useRouter();

  // Loading / assets
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [totalImages] = useState(3);

  const [currentCardIndex, setCurrentCardIndex] = useState(1);

  const trackStepView = (stepNumber: number) => {
    const stepName = stepNumber === 4 ? 'confirmation' : `step_${stepNumber}`;
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'step_view',
        step_name: stepName,
        step_number: stepNumber,
      });
    }
  };

  const trackStepComplete = (stepNumber: number) => {
    const stepName = stepNumber === 4 ? 'confirmation' : `step_${stepNumber}`;
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'step_complete',
        step_name: stepName,
        step_number: stepNumber,
      });
    }
  };

  const trackFormSubmit = () => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'form_submit',
        form_name: 'ridejob_application',
      });
    }
  };

  // 実験インプレッション
  useEffect(() => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'experiment_impression',
        experiment: 'people_image',
        variant,
      });
    }
  }, [variant]);

  const [formData, setFormData] = useState({
    birthDate: { year: '', month: '', day: '' },
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    postalCode: '',
    phoneNumber: '',
  });

  // UTMは送信時にURLから都度取得する

  const [jobCount, setJobCount] = useState<number | null>(null);
  const [jobCountMessage, setJobCountMessage] = useState<string>('');
  const [isLoadingJobCount, setIsLoadingJobCount] = useState(false);
  const [jobCountError, setJobCountError] = useState<string>('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [kuroshiroInstance, setKuroshiroInstance] = useState<import('kuroshiro').default | null>(null);

  const getDaysInMonth = (year: string, month: string): number => {
    if (!year || !month) return 31;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    return new Date(yearNum, monthNum, 0).getDate();
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

  const handleImageLoad = () => setImagesLoaded((prev) => prev + 1);

  useEffect(() => {
    const imagesToPreload = [
      headerLogoSrc,
      peopleImageSrc,
      step1ImageSrc,
    ];
    imagesToPreload.forEach((src) => {
      const img = document.createElement('img');
      img.src = src;
    });
  }, [headerLogoSrc, peopleImageSrc, step1ImageSrc]);

  useEffect(() => {
    if (imagesLoaded >= totalImages) {
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
    const fallbackTimer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(fallbackTimer);
  }, [imagesLoaded, totalImages]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isFormDirty) {
        event.preventDefault();
        event.returnValue = '';
        return '';
      }
    };
    const handlePopState = (event: PopStateEvent) => {
      if (isFormDirty) {
        event.preventDefault();
        setShowExitModal(true);
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    if (isFormDirty) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isFormDirty]);

  // UTMの事前保存は不要

  useEffect(() => {
    const initKuroshiro = async () => {
      try {
        const Kuroshiro = (await import('kuroshiro')).default;
        const KuromojiAnalyzer = (await import('kuroshiro-analyzer-kuromoji')).default;
        const kuroshiro = new Kuroshiro();
        await kuroshiro.init(new KuromojiAnalyzer({ dictPath: '/dict' }));
        setKuroshiroInstance(kuroshiro);
      } catch (error) {
        console.error('Failed to initialize Kuroshiro:', error);
      }
    };
    initKuroshiro();
  }, []);

  useEffect(() => {
    trackStepView(1);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isFormDirty && currentCardIndex < 4) {
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            event: 'step_abandon',
            step_name: currentCardIndex === 4 ? 'confirmation' : `step_${currentCardIndex}`,
            step_number: currentCardIndex,
          });
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty, currentCardIndex]);

  const showNextCard = () => {
    setCurrentCardIndex((prevIndex) => {
      const nextIndex = Math.min(prevIndex + 1, 3);
      if (nextIndex > prevIndex) trackStepView(nextIndex);
      return nextIndex;
    });
  };
  const showPreviousCard = () => {
    setCurrentCardIndex((prevIndex) => {
      const nextIndex = Math.max(prevIndex - 1, 1);
      if (nextIndex !== prevIndex) trackStepView(nextIndex);
      return nextIndex;
    });
  };

  const fetchJobCount = async (postalCode: string) => {
    if (!/^\d{7}$/.test(postalCode)) return;
    setIsLoadingJobCount(true);
    setJobCountError('');
    try {
      const response = await fetch(`/api/jobs-count?postalCode=${postalCode}`);
      const data = await response.json();
      if (response.ok) {
        setJobCount(data.jobCount);
        setJobCountMessage(data.message);
      } else {
        setJobCountError(data.error || '求人件数の取得に失敗しました');
        setJobCount(null);
        setJobCountMessage('');
      }
    } catch (error) {
      console.error('Error fetching job count:', error);
      setJobCountError('求人件数の取得中にエラーが発生しました');
      setJobCount(null);
      setJobCountMessage('');
    } finally {
      setIsLoadingJobCount(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    let { value } = e.target as HTMLInputElement | HTMLSelectElement & { value: string };
    if (name === 'phoneNumber') {
      value = value.replace(/[-－ー]/g, '');
    }
    if (name === 'birthYear' || name === 'birthMonth' || name === 'birthDay') {
      const fieldName = name.replace('birth', '').toLowerCase() as 'year' | 'month' | 'day';
      setFormData((prevData) => ({
        ...prevData,
        birthDate: { ...prevData.birthDate, [fieldName]: value },
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
    if (!isFormDirty) setIsFormDirty(true);

    // Clear related error messages
    if (name === 'birthYear' || name === 'birthMonth' || name === 'birthDay') {
      if (errors.birthDate) {
        setErrors((prevErrors) => ({ ...prevErrors, birthDate: '' }));
      }
    } else if (
      name === 'lastName' ||
      name === 'firstName' ||
      name === 'lastNameKana' ||
      name === 'firstNameKana' ||
      name === 'postalCode' ||
      name === 'phoneNumber'
    ) {
      const key = name as keyof FormErrors;
      if (errors[key]) {
        setErrors((prevErrors) => ({ ...prevErrors, [key]: '' }));
      }
    }

    if (name === 'phoneNumber') {
      validatePhoneNumberInput(value);
    }
    if (name === 'postalCode' && value.length === 7) {
      fetchJobCount(value);
    }
  };

  const convertToHiragana = async (kanjiText: string): Promise<string> => {
    if (kuroshiroInstance && kanjiText.trim()) {
      try {
        const result = await kuroshiroInstance.convert(kanjiText, { to: 'hiragana', mode: 'spaced' });
        return result;
      } catch (error) {
        console.error('Failed to convert to hiragana:', error);
        return '';
      }
    }
    return '';
  };

  const handleNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if ((name === 'lastName' || name === 'firstName') && value.trim()) {
      const hiragana = await convertToHiragana(value);
      if (hiragana) {
        const targetField = name === 'lastName' ? 'lastNameKana' : 'firstNameKana';
        setFormData((prevData) => ({ ...prevData, [targetField]: hiragana }));
      }
    }
  };

  const validateCard1 = () => {
    let isValid = true;
    const newErrors: FormErrors = {};
    const { year, month, day } = formData.birthDate;
    if (!year || !month || !day) {
      newErrors.birthDate = '生年月日をすべて選択してください。';
      isValid = false;
    } else {
      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date();
      const minAge = 18;
      const maxAge = 84;
      if (
        birthDate.getFullYear() !== parseInt(year) ||
        birthDate.getMonth() !== parseInt(month) - 1 ||
        birthDate.getDate() !== parseInt(day)
      ) {
        newErrors.birthDate = '有効な日付を選択してください。';
        isValid = false;
      } else {
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < minAge) {
          newErrors.birthDate = `${minAge}歳以上である必要があります。`;
          isValid = false;
        } else if (age > maxAge) {
          newErrors.birthDate = `${maxAge}歳以下である必要があります。`;
          isValid = false;
        }
        if (birthDate > today) {
          newErrors.birthDate = '未来の日付は選択できません。';
          isValid = false;
        }
      }
    }
    setErrors(newErrors);
    return isValid;
  };

  const validateCard2 = () => {
    let isValid = true;
    const newErrors: FormErrors = {};
    if (!formData.lastName) {
      newErrors.lastName = '姓は必須です。';
      isValid = false;
    }
    if (!formData.firstName) {
      newErrors.firstName = '名は必須です。';
      isValid = false;
    }
    if (!formData.lastNameKana || !/^[ぁ-んー]+$/.test(formData.lastNameKana)) {
      newErrors.lastNameKana = 'ひらがなで入力してください。';
      isValid = false;
    }
    if (!formData.firstNameKana || !/^[ぁ-んー]+$/.test(formData.firstNameKana)) {
      newErrors.firstNameKana = 'ひらがなで入力してください。';
      isValid = false;
    }
    if (!formData.postalCode) {
      newErrors.postalCode = '郵便番号は必須です。';
      isValid = false;
    } else if (!/^\d{7}$/.test(formData.postalCode)) {
      newErrors.postalCode = '郵便番号はハイフンなしの7桁で入力してください。';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleNextCard1 = () => {
    if (validateCard1()) {
      trackStepComplete(1);
      showNextCard();
    }
  };

  const handleNextCard2 = () => {
    if (validateCard2()) {
      trackStepComplete(2);
      showNextCard();
      if (formData.postalCode && formData.postalCode.length === 7) {
        fetchJobCount(formData.postalCode);
      }
    }
  };

  const isValidPhoneNumber = (phoneNumber: string): boolean => {
    if (!/^(070|080|090)\d{8}$/.test(phoneNumber)) return false;
    if (/(.)\1{4,}/.test(phoneNumber)) return false;
    if (/01234|12345|23456|34567|45678|56789|98765|87654|76543|65432|54321/.test(phoneNumber)) return false;
    if (/^09012345678$|^08012345678$/.test(phoneNumber)) return false;
    if (/^(\d)\1+$/.test(phoneNumber)) return false;
    return true;
  };

  const validatePhoneNumberInput = (phoneNumber: string) => {
    const trimmedNumber = phoneNumber.trim();
    if (trimmedNumber.length < 11) {
      setPhoneError(null);
      setIsSubmitDisabled(true);
      return;
    }
    if (!isValidPhoneNumber(trimmedNumber)) {
      setPhoneError('有効な携帯番号を入力してください。');
      setIsSubmitDisabled(true);
      notifyInvalidPhoneNumber(trimmedNumber);
    } else {
      setPhoneError(null);
      setIsSubmitDisabled(false);
    }
  };

  const notifyInvalidPhoneNumber = async (phoneNumber: string) => {
    try {
      await fetch('/api/notify_invalid_phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastName: formData.lastName, firstName: formData.firstName, phoneNumber }),
      });
    } catch (error) {
      console.error('Error notifying backend:', error);
    }
  };

  const validateFinalStep = () => {
    let isValid = true;
    const newErrors: FormErrors = { ...errors };
    if (!formData.phoneNumber || !isValidPhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = '有効な携帯番号を入力してください。';
      isValid = false;
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateFinalStep()) {
      trackFormSubmit();
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const currentUtmParams = {
          utm_source: urlParams.get('utm_source') || '',
          utm_medium: urlParams.get('utm_medium') || '',
          utm_campaign: urlParams.get('utm_campaign') || '',
          utm_term: urlParams.get('utm_term') || '',
        };
        const birthDateString =
          formData.birthDate.year && formData.birthDate.month && formData.birthDate.day
            ? `${formData.birthDate.year}-${formData.birthDate.month.padStart(2, '0')}-${formData.birthDate.day.padStart(2, '0')}`
            : '';
        const submissionData = {
          ...formData,
          birthDate: birthDateString,
          utmParams: currentUtmParams,
          experiment: { name: 'people_image', variant },
          formOrigin,
        } as Record<string, unknown>;
        const response = await fetch('/api/applicants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData),
        });
        if (response.ok) {
          await response.json();
          setIsFormDirty(false);
          router.push('/applicants/new');
        } else {
          const errorResult = await response.json();
          alert(`エラーが発生しました: ${errorResult.message || 'サーバーエラー'}`);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('フォームの送信中にエラーが発生しました。ネットワーク接続を確認してください。');
      }
    }
  };

  const cardBaseStyle =
    'bg-white rounded-lg p-5 w-[90%] shadow-lg text-center transition-opacity duration-500 ease-in-out max-w-md';
  const cardActiveStyle = 'opacity-100';
  const cardInactiveStyle = 'opacity-0 hidden';

  return (
    <div className={`mx-auto max-w-md ${containerClassName}`}>
      <div
        id="loading-screen"
        className={`fixed top-0 left-0 w-full h-full bg-white bg-opacity-90 flex flex-col justify-center items-center z-[9999] transition-all duration-1000 ease-out ${
          loading ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <Image src={loadingLogoSrc} alt="Ride Job Logo" width={200} height={50} className="w-1/2 mb-4" onLoad={handleImageLoad} />
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>

      {showHeader && (
        <header className="flex items-center justify-between p-1.5 bg-white w-[95%] mx-auto mt-2.5 rounded-md shadow">
          <div className="pl-2.5">
            <Image src={headerLogoSrc} alt="Ride Job Logo" width={120} height={30} className="h-[30px] w-auto" onLoad={handleImageLoad} priority loading="eager" />
          </div>
          <div className="text-right pr-2.5">
            <p className="text-xs text-gray-800 my-1">{headerUpperText}</p>
            <p className="text-xs text-black font-bold my-1">{headerLowerText}</p>
          </div>
        </header>
      )}

      {/* People Image */}
      <div className="container mx-auto text-center px-2 flex justify-center my-4">
        <Image src={peopleImageSrc} alt="" width={500} height={150} className="w-full max-w-lg" onLoad={handleImageLoad} priority loading="eager" />
      </div>

      <form onSubmit={handleSubmit} id="form" className="flex justify-center">
        <div className="relative w-full flex justify-center">
          {/* Card 1 */}
          <div id="card1" className={`${cardBaseStyle} ${currentCardIndex === 1 ? cardActiveStyle : cardInactiveStyle}`}>
            <div className="mb-7 text-left">
              <Image className="w-full mb-4" src={step1ImageSrc} alt="Step 1" width={300} height={50} onLoad={handleImageLoad} priority loading="eager" />
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
                    } ${!formData.birthDate.year ? 'text-gray-500' : ''}`}
                    value={formData.birthDate.year}
                    onChange={handleInputChange}
                  >
                    <option value="">年を選択</option>
                    {generateYearOptions().map((year) => (
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
                    } ${!formData.birthDate.month ? 'text-gray-500' : ''} ${!formData.birthDate.year ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.birthDate.month}
                    onChange={handleInputChange}
                    disabled={!formData.birthDate.year}
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
                    } ${!formData.birthDate.day ? 'text-gray-500' : ''} ${
                      !formData.birthDate.month || !formData.birthDate.year ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    value={formData.birthDate.day}
                    onChange={handleInputChange}
                    disabled={!formData.birthDate.month || !formData.birthDate.year}
                  >
                    <option value="">日を選択</option>
                    {Array.from({ length: getDaysInMonth(formData.birthDate.year, formData.birthDate.month) }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}日
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
            </div>
            <button type="button" className="w-full py-2.5 px-5 rounded-md bg-[#ff702a] text-white font-bold cursor-pointer" onClick={handleNextCard1}>
              次へ
            </button>
          </div>

          {/* Card 2 */}
          <div id="card2" className={`${cardBaseStyle} ${currentCardIndex === 2 ? cardActiveStyle : cardInactiveStyle}`}>
            <Image className="w-full mb-4" src={step2ImageSrc} alt="Step 2" width={300} height={50} />
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
                    onChange={handleInputChange}
                    onBlur={handleNameBlur}
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
                    onChange={handleInputChange}
                    onBlur={handleNameBlur}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                  />
                  {errors.firstNameKana && <p className="text-red-500 text-xs mt-1">{errors.firstNameKana}</p>}
                </div>
              </div>
            </div>

            <div className="mb-7 text-left">
              <label htmlFor="postalCode" className="block mb-1 text-gray-900">
                お住まいの郵便番号<br />( ハイフンなし7桁 )
              </label>
              <input
                type="number"
                id="postalCode"
                name="postalCode"
                placeholder="例: 1234567"
                className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.postalCode}
                onChange={handleInputChange}
                maxLength={7}
              />
              {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
            </div>

            <div className="flex justify-around items-center">
              <button type="button" className="py-2 px-4 font-bold cursor-pointer text-gray-800" onClick={showPreviousCard}>
                ＜ 戻る
              </button>
              <button type="button" className="w-[60%] py-2.5 px-5 rounded-md bg-[#ff702a] text-white font-bold cursor-pointer" onClick={handleNextCard2}>
                次へ
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div id="card3" className={`${cardBaseStyle} ${currentCardIndex === 3 ? cardActiveStyle : cardInactiveStyle}`}>
            <Image className="w-full mb-4" src={step3ImageSrc} alt="Step 3" width={300} height={50} />
            <div className="mb-6">
              {formData.postalCode && formData.postalCode.length === 7 ? (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  {isLoadingJobCount ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce mr-2"></div>
                      <span className="text-blue-700 text-sm">求人件数を確認中...</span>
                    </div>
                  ) : jobCountError ? (
                    <p className="text-red-600 text-sm text-center">{jobCountError}</p>
                  ) : jobCount !== null ? (
                    <div className="text-center">
                      <p className="text-blue-800 font-bold text-xl mb-2">郵便番号 {formData.postalCode} エリア</p>
                      <p className="text-blue-800 font-bold text-2xl mb-2">{jobCount}件の求人があります</p>
                      <p className="text-blue-700 text-sm">{jobCountMessage}</p>
                      {jobCount > 0 && <p className="text-green-700 text-sm mt-2 font-medium">✅ お近くの求人をご案内できます！</p>}
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

            <div className="mb-7 text-left">
              <label htmlFor="phoneNumber" className="block mb-1 text-gray-900">
                携帯番号<br />( ハイフンなし11桁 )
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="例: 09012345678"
                className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${
                  errors.phoneNumber || phoneError ? 'border-red-500' : 'border-gray-300'
                }`}
                value={formData.phoneNumber}
                onChange={handleInputChange}
                maxLength={11}
              />
              {(errors.phoneNumber || phoneError) && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber || phoneError}</p>}
            </div>

            <div className="flex justify-around items-center">
              <button type="button" className="py-2 px-4 font-bold cursor-pointer text-gray-800 mb-0" onClick={showPreviousCard}>
                ＜ 戻る
              </button>
              <button
                type="submit"
                className={`w-[60%] py-2.5 px-5 rounded-md text-white font-bold cursor-pointer ${
                  isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ff702a]'
                }`}
                disabled={isSubmitDisabled}
              >
                送信
              </button>
            </div>
          </div>
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
                  setIsFormDirty(false);
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
          <div className="text-center mb-5">
            <Image className="mb-5 w-1/4 sm:w-1/6 md:w-[150px] inline-block" src={footerLogoSrc} alt="Footer Logo" width={150} height={40} />
          </div>
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






