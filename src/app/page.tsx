'use client'; // Add this directive for client-side interactivity

import Image from "next/image";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Extend Window interface for GTM dataLayer
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function HomeContent() {
  console.log('HomeContent component rendering...');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  console.log('searchParams available:', searchParams);
  
  // State for loading screen visibility
  const [loading, setLoading] = useState(true);
  // State for image loading
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [totalImages] = useState(6); // Total number of critical images to load (STEP1, STEP2, STEP3, kange2, car, ride_logo in header)
  // State for current card index
  const [currentCardIndex, setCurrentCardIndex] = useState(1);
  
  // GTM tracking helper functions
  const trackStepView = (stepNumber: number) => {
    const stepName = stepNumber === 4 ? 'confirmation' : `step_${stepNumber}`;
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        'event': 'step_view',
        'step_name': stepName,
        'step_number': stepNumber
      });
    }
  };

  const trackStepComplete = (stepNumber: number) => {
    const stepName = stepNumber === 4 ? 'confirmation' : `step_${stepNumber}`;
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        'event': 'step_complete',
        'step_name': stepName,
        'step_number': stepNumber
      });
    }
  };

  const trackFormSubmit = () => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        'event': 'form_submit',
        'form_name': 'ridejob_application'
      });
    }
  };
  // State for form data (example structure, adjust as needed)
  const [formData, setFormData] = useState({
    birthDate: {
      year: '',
      month: '',
      day: ''
    },
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    postalCode: '',
    phoneNumber: '',
  });
  // State for UTM parameters (traffic source tracking)
  const [utmParams, setUtmParams] = useState({
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
  });
  // State for job count
  const [jobCount, setJobCount] = useState<number | null>(null);
  const [jobCountMessage, setJobCountMessage] = useState<string>('');
  const [isLoadingJobCount, setIsLoadingJobCount] = useState(false);
  const [jobCountError, setJobCountError] = useState<string>('');
  // State for form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  // State for phone number validation error message
  const [phoneError, setPhoneError] = useState<string | null>(null);
  // State for submit button disabled status
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  // State for form dirty tracking (for exit prevention)
  const [isFormDirty, setIsFormDirty] = useState(false);
  // State for custom exit confirmation modal
  const [showExitModal, setShowExitModal] = useState(false);
  // State for kuroshiro instance
  const [kuroshiroInstance, setKuroshiroInstance] = useState<import('kuroshiro').default | null>(null);

  // --- Helper Functions ---
  const getDaysInMonth = (year: string, month: string): number => {
    if (!year || !month) return 31;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    return new Date(yearNum, monthNum, 0).getDate();
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 84; // 84歳まで
    const endYear = currentYear - 18;   // 18歳から
    const years = [];
    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }
    return years;
  };

  // Format functions for confirmation screen
  const formatBirthDate = (birthDate: { year: string; month: string; day: string }): string => {
    if (!birthDate.year || !birthDate.month || !birthDate.day) return '';
    return `${birthDate.year}年${birthDate.month}月${birthDate.day}日`;
  };

  const formatPhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber || phoneNumber.length !== 11) return phoneNumber;
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7)}`;
  };

  // --- Image Loading Handler ---
  const handleImageLoad = () => {
    setImagesLoaded(prev => prev + 1);
  };

  // --- Image Preloading ---
  useEffect(() => {
    const imagesToPreload = [
      '/images/ride_logo.png',
      '/images/kange2.png', 
      '/images/STEP1.png',
      '/images/STEP2.png',
      '/images/STEP3.png',
      '/images/car.png'
    ];

    const preloadImages = () => {
      imagesToPreload.forEach((src) => {
        const img = document.createElement('img');
        img.src = src;
      });
    };

    preloadImages();
  }, []);

  // --- Loading Screen Effect ---
  useEffect(() => {
    // Hide loading screen when all critical images are loaded or after 5 seconds maximum
    if (imagesLoaded >= totalImages) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500); // Small delay for smooth transition
      return () => clearTimeout(timer);
    }
    
    // Fallback: hide loading screen after 5 seconds even if images aren't loaded
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    
    return () => clearTimeout(fallbackTimer);
  }, [imagesLoaded, totalImages]);

  // --- Form Exit Prevention ---
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isFormDirty) {
        // ブラウザの標準ダイアログは英語で表示されるため、preventDefaultのみ設定
        event.preventDefault();
        event.returnValue = '';
        return '';
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      if (isFormDirty) {
        event.preventDefault();
        setShowExitModal(true);
        // ブラウザの履歴を元に戻す（UTMパラメーターを保持）
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // ページ読み込み時に履歴エントリを追加（UTMパラメーターを保持）
    if (isFormDirty) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isFormDirty]);

  // --- UTM Parameters Initialization ---
  useEffect(() => {
    console.log('UTM useEffect running...');
    console.log('window.location:', window.location.href);
    
    // Get UTM parameters directly from URL
    const urlParams = new URLSearchParams(window.location.search);
    console.log('urlParams:', urlParams.toString());
    
    const utm_source = urlParams.get('utm_source') || '';
    const utm_medium = urlParams.get('utm_medium') || '';
    const utm_campaign = urlParams.get('utm_campaign') || '';
    const utm_term = urlParams.get('utm_term') || '';
    
    console.log('Individual params:', { utm_source, utm_medium, utm_campaign, utm_term });
    
    const newUtmParams = {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
    };
    
    setUtmParams(newUtmParams);
    
    // Log UTM parameters for debugging
    if (utm_source || utm_medium) {
      console.log('UTM Parameters detected:', newUtmParams);
    }
    console.log('All UTM params set:', newUtmParams);
  }, []);

  // --- Kuroshiro Initialization ---
  useEffect(() => {
    const initKuroshiro = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const Kuroshiro = (await import('kuroshiro')).default;
        const KuromojiAnalyzer = (await import('kuroshiro-analyzer-kuromoji')).default;
        
        const kuroshiro = new Kuroshiro();
        await kuroshiro.init(new KuromojiAnalyzer({ dictPath: "/dict" }));
        setKuroshiroInstance(kuroshiro);
        console.log('Kuroshiro initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Kuroshiro:', error);
      }
    };
    
    initKuroshiro();
  }, []);

  // Track initial step view
  useEffect(() => {
    trackStepView(1);
  }, []);

  // Track page abandonment
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only track abandon if form has been started but not completed
      if (isFormDirty && currentCardIndex < 4) {
        if (typeof window !== 'undefined' && window.dataLayer) {
          window.dataLayer.push({
            'event': 'step_abandon',
            'step_name': currentCardIndex === 4 ? 'confirmation' : `step_${currentCardIndex}`,
            'step_number': currentCardIndex
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isFormDirty, currentCardIndex]);

  // --- Card Navigation ---
  const showNextCard = () => {
    setCurrentCardIndex((prevIndex) => {
      const nextIndex = Math.min(prevIndex + 1, 4);
      if (nextIndex > prevIndex) {
        trackStepView(nextIndex);
      }
      return nextIndex;
    });
  };

  const showPreviousCard = () => {
    setCurrentCardIndex((prevIndex) => {
      const nextIndex = Math.max(prevIndex - 1, 1);
      if (nextIndex !== prevIndex) {
        trackStepView(nextIndex);
      }
      return nextIndex;
    });
  };

  // --- Job Count Fetching ---
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

  // --- Form Input Handling ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    let { value } = e.target;
    
    // Remove hyphens from phone number input
    if (name === 'phoneNumber') {
      value = value.replace(/[-－ー]/g, '');
    }
    
    // Handle birth date fields separately
    if (name === 'birthYear' || name === 'birthMonth' || name === 'birthDay') {
      const fieldName = name.replace('birth', '').toLowerCase() as 'year' | 'month' | 'day';
      setFormData((prevData) => ({
        ...prevData,
        birthDate: {
          ...prevData.birthDate,
          [fieldName]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    
    // Mark form as dirty when user starts typing
    if (!isFormDirty) {
      setIsFormDirty(true);
    }
    
    // Clear specific error when user starts typing
    if (errors[name] || (name.startsWith('birth') && errors.birthDate)) {
      setErrors((prevErrors) => ({ 
        ...prevErrors, 
        [name]: '',
        birthDate: '' 
      }));
    }
    // Specific logic for phone number validation on input
    if (name === 'phoneNumber') {
      validatePhoneNumberInput(value);
    }
    // Fetch job count when postal code is entered
    if (name === 'postalCode' && value.length === 7) {
      fetchJobCount(value);
    }
  };

  // --- Auto Furigana Conversion ---
  const convertToHiragana = async (kanjiText: string): Promise<string> => {
    if (kuroshiroInstance && kanjiText.trim()) {
      try {
        const result = await kuroshiroInstance.convert(kanjiText, { 
          to: "hiragana",
          mode: "spaced"
        });
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
        setFormData((prevData) => ({
          ...prevData,
          [targetField]: hiragana,
        }));
      }
    }
  };

  // --- Form Validation ---
  const validateCard1 = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    
    const { year, month, day } = formData.birthDate;
    
    // Check if all fields are selected
    if (!year || !month || !day) {
      newErrors.birthDate = '生年月日をすべて選択してください。';
      isValid = false;
    } else {
      // Create date object from selected values
      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const today = new Date();
      const minAge = 18;
      const maxAge = 84;
      
      // Check if the date is valid (handles invalid dates like Feb 30)
      if (birthDate.getFullYear() !== parseInt(year) || 
          birthDate.getMonth() !== parseInt(month) - 1 || 
          birthDate.getDate() !== parseInt(day)) {
        newErrors.birthDate = '有効な日付を選択してください。';
        isValid = false;
      } else {
        // Calculate age
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        // Check age range
        if (age < minAge) {
          newErrors.birthDate = `${minAge}歳以上である必要があります。`;
          isValid = false;
        } else if (age > maxAge) {
          newErrors.birthDate = `${maxAge}歳以下である必要があります。`;
          isValid = false;
        }
        
        // Check if date is in the future
        if (birthDate > today) {
          newErrors.birthDate = '未来の日付は選択できません。';
          isValid = false;
        }
      }
    }
    setErrors(newErrors);
    return isValid;
  }

  const validateCard2 = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
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
  }

  const handleNextCard2 = () => {
    if (validateCard2()) {
      trackStepComplete(2);
      showNextCard();
      // Fetch job count if postal code is already entered
      if (formData.postalCode && formData.postalCode.length === 7) {
        fetchJobCount(formData.postalCode);
      }
    }
  };

  const handleNextCard3 = () => {
    if (validateFinalStep()) {
      trackStepComplete(3);
      showNextCard(); // Move to confirmation screen (Card 4)
    }
  };

  // Confirmation screen button handlers
  const handleFinalSubmit = async () => {
    // Re-validate before final submission
    if (!validateFinalStep()) {
      setCurrentCardIndex(3); // Go back to Step 3 if validation fails
      return;
    }

    // Execute the actual form submission
    await performFormSubmission();
  };

  // Phone number specific validation logic
  const isValidPhoneNumber = (phoneNumber: string): boolean => {
    if (!/^(070|080|090)\d{8}$/.test(phoneNumber)) return false;
    if (/(.)\1{4,}/.test(phoneNumber)) return false; // More than 4 consecutive same digits
    // Add other specific invalid patterns if necessary
    if (/01234|12345|23456|34567|45678|56789|98765|87654|76543|65432|54321/.test(phoneNumber)) return false; // Sequential numbers
    if (/^09012345678$|^08012345678$/.test(phoneNumber)) return false; // Specific example numbers
    if (/^(\d)\1+$/.test(phoneNumber)) return false; // Repeating pairs like 121212...
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
       // Optionally call notifyInvalidPhoneNumber here if needed immediately
       notifyInvalidPhoneNumber(trimmedNumber);
     } else {
       setPhoneError(null);
       setIsSubmitDisabled(false); // Enable submit only if phone is potentially valid
     }
  };

   // Function to notify backend about invalid phone number (example)
   const notifyInvalidPhoneNumber = async (phoneNumber: string) => {
    try {
      // Replace with your actual API endpoint
      await fetch('/api/notify_invalid_phone', { // Example API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add CSRF token header if needed
        },
        body: JSON.stringify({
          lastName: formData.lastName,
          firstName: formData.firstName,
          phoneNumber: phoneNumber,
        }),
      });
      console.log('Notified backend about invalid phone:', phoneNumber);
    } catch (error) {
      console.error('Error notifying backend:', error);
    }
  };


  // --- Final Form Submission Validation ---
  const validateFinalStep = () => {
    let isValid = true;
    const newErrors: Record<string, string> = { ...errors }; // Keep existing errors

    // Check phone number validity again before submitting
    if (!formData.phoneNumber || !isValidPhoneNumber(formData.phoneNumber)) {
        newErrors.phoneNumber = '有効な携帯番号を入力してください。'; // Add error if not already set or re-validate
        isValid = false;
        setIsSubmitDisabled(true); // Ensure button is disabled
    } else {
        setIsSubmitDisabled(false); // Ensure button is enabled if valid
    }

    setErrors(newErrors);
    return isValid;
  };


  // --- Form Submit Handler (now just prevents default form submission) ---
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission - now handled by confirmation screen
  };

  // --- Actual form submission logic ---
  const performFormSubmission = async () => {
    console.log("Form Data to be Submitted:", formData);
    
    // Track form submission attempt
    trackFormSubmit();

    try {
      // Get fresh UTM parameters directly from URL at submission time
      console.log('Current URL:', window.location.href);
      console.log('Current search params:', window.location.search);
      
      const urlParams = new URLSearchParams(window.location.search);
      const currentUtmParams = {
        utm_source: urlParams.get('utm_source') || '',
        utm_medium: urlParams.get('utm_medium') || '',
        utm_campaign: urlParams.get('utm_campaign') || '',
        utm_term: urlParams.get('utm_term') || '',
      };
      
      // Convert birth date object to string format for API
      const birthDateString = formData.birthDate.year && formData.birthDate.month && formData.birthDate.day
        ? `${formData.birthDate.year}-${formData.birthDate.month.padStart(2, '0')}-${formData.birthDate.day.padStart(2, '0')}`
        : '';
      
      const submissionData = {
        ...formData,
        birthDate: birthDateString, // Convert to string format
        utmParams: currentUtmParams, // Use fresh UTM parameters
      };
      
      console.log('Submitting data with UTM params:', { formData, utmParams, currentUtmParams, submissionData });
      
      const response = await fetch('/api/applicants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Form submitted successfully:', result.message);
        // Clear form dirty state on successful submission
        setIsFormDirty(false);
        // Redirect to completion page
        router.push('/applicants/new');
      } else {
        const errorResult = await response.json();
        console.error('Form submission failed:', errorResult.message);
        // Handle error - show error message to the user
        alert(`エラーが発生しました: ${errorResult.message || 'サーバーエラー'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle network error or other fetch issues
      alert('フォームの送信中にエラーが発生しました。ネットワーク接続を確認してください。');
    }
  };


  // --- Card Styles ---
  // Base card style + transition
  const cardBaseStyle = "bg-white rounded-lg p-5 w-[90%] shadow-lg text-center transition-opacity duration-500 ease-in-out max-w-md"; // Added max-width
  const cardActiveStyle = "opacity-100";
  const cardInactiveStyle = "opacity-0 hidden"; // Use hidden to prevent interaction

  return (
    <div className="mx-auto max-w-md"> {/* Added max-width like mw */}

      {/* Loading Screen */}
      <div
        id="loading-screen"
        className={`fixed top-0 left-0 w-full h-full bg-white bg-opacity-90 flex flex-col justify-center items-center z-[9999] transition-all duration-1000 ease-out ${loading ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        <Image src="/images/ride_logo.png" alt="Ride Job Logo" width={200} height={50} className="w-1/2 mb-4"/> {/* Adjust width as needed */}
         {/* Replace spinners with Tailwind equivalent or remove */}
        <div className="flex space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce delay-150"></div>
            <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-1.5 bg-white w-[95%] mx-auto mt-2.5 rounded-md shadow"> {/* Approximate styles */}
        <div className="pl-2.5">
          <Image src="/images/ride_logo.png" alt="Ride Job Logo" width={120} height={30} className="h-[30px] w-auto" onLoad={handleImageLoad}/> {/* Adjust size */}
        </div>
        <div className="text-right pr-2.5">
          <p className="text-xs text-gray-800 my-1">未経験でタクシー会社に就職するなら</p> {/* Changed text-gray-700 to text-gray-800 */}
          <p className="text-xs text-black font-bold my-1">RIDE JOB（ライドジョブ）</p>
        </div>
      </header>

      {/* People Image */}
      <div className="container mx-auto text-center px-2 flex justify-center my-4"> {/* Added margin */}
        <Image src="/images/kange2.png" alt="" width={500} height={150} className="w-full max-w-lg" onLoad={handleImageLoad}/> {/* Adjust size */}
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} id="form" className="flex justify-center">
        <div className="relative w-full flex justify-center"> {/* Container for cards */}
          {/* Card 1: Birth Date */}
          <div id="card1" className={`${cardBaseStyle} ${currentCardIndex === 1 ? cardActiveStyle : cardInactiveStyle}`}>
            <div className="mb-7 text-left"> {/* form-group */}
              <Image className="w-full mb-4" src="/images/STEP1.png" alt="Step 1" width={300} height={50} onLoad={handleImageLoad}/>
              <label className="font-bold mb-2.5 block text-gray-900">生年月日</label>
              
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Year Select */}
                <div className="flex-1">
                  <label htmlFor="birthYear" className="block text-xs text-gray-600 mb-1 sm:hidden">年</label>
                  <select
                    id="birthYear"
                    name="birthYear"
                    className={`w-full p-3 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} ${!formData.birthDate.year ? 'text-gray-500' : ''}`}
                    value={formData.birthDate.year}
                    onChange={handleInputChange}
                  >
                    <option value="">年を選択</option>
                    {generateYearOptions().map(year => (
                      <option key={year} value={year}>{year}年</option>
                    ))}
                  </select>
                </div>

                {/* Month Select */}
                <div className="flex-1">
                  <label htmlFor="birthMonth" className="block text-xs text-gray-600 mb-1 sm:hidden">月</label>
                  <select
                    id="birthMonth"
                    name="birthMonth"
                    className={`w-full p-3 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} ${!formData.birthDate.month ? 'text-gray-500' : ''} ${!formData.birthDate.year ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.birthDate.month}
                    onChange={handleInputChange}
                    disabled={!formData.birthDate.year}
                  >
                    <option value="">月を選択</option>
                    {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{month}月</option>
                    ))}
                  </select>
                </div>

                {/* Day Select */}
                <div className="flex-1">
                  <label htmlFor="birthDay" className="block text-xs text-gray-600 mb-1 sm:hidden">日</label>
                  <select
                    id="birthDay"
                    name="birthDay"
                    className={`w-full p-3 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} ${!formData.birthDate.day ? 'text-gray-500' : ''} ${!formData.birthDate.month || !formData.birthDate.year ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.birthDate.day}
                    onChange={handleInputChange}
                    disabled={!formData.birthDate.month || !formData.birthDate.year}
                  >
                    <option value="">日を選択</option>
                    {Array.from({length: getDaysInMonth(formData.birthDate.year, formData.birthDate.month)}, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}日</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
            </div>
            <button type="button" className="w-full py-2.5 px-5 rounded-md bg-[#ff702a] text-white font-bold cursor-pointer" onClick={handleNextCard1}>次へ</button>
          </div>

          {/* Card 2: Name */}
          <div id="card2" className={`${cardBaseStyle} ${currentCardIndex === 2 ? cardActiveStyle : cardInactiveStyle}`}>
             <Image className="w-full mb-4" src="/images/STEP2.png" alt="Step 2" width={300} height={50} onLoad={handleImageLoad}/>
             {/* Kanji Name */}
            <div className="mb-7 text-left">
              <label className="font-bold mb-2.5 block text-gray-900">お名前（漢字）</label> {/* Added text-gray-900 */}
              <div className="flex justify-between mb-5"> {/* input-row */}
                 <div className="flex flex-col w-[45%]"> {/* input-group */}
                  <label htmlFor="lastName" className="mb-1 text-sm font-bold text-gray-900">姓</label> {/* Added text-gray-900 */}
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="例: 田中"
                    className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`} // Added text-gray-900 and placeholder-gray-500
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={handleNameBlur}
                  />
                   {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                 </div>
                 <div className="flex flex-col w-[45%]"> {/* input-group */}
                  <label htmlFor="firstName" className="mb-1 text-sm font-bold text-gray-900">名</label> {/* Added text-gray-900 */}
                   <input
                     type="text"
                     id="firstName"
                     name="firstName"
                     placeholder="例: 太郎"
                     className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} // Added text-gray-900 and placeholder-gray-500
                     value={formData.firstName}
                     onChange={handleInputChange}
                     onBlur={handleNameBlur}
                   />
                   {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                 </div>
              </div>
            </div>
            {/* Kana Name */}
            <div className="mb-7 text-left">
              <label className="font-bold mb-2.5 block text-gray-900">お名前（ふりがな）</label> {/* Added text-gray-900 */}
              <div className="flex justify-between mb-5"> {/* input-row */}
                 <div className="flex flex-col w-[45%]"> {/* input-group */}
                  <label htmlFor="lastNameKana" className="mb-1 text-sm font-bold text-gray-900">せい</label> {/* Added text-gray-900 */}
                   <input
                    type="text"
                    id="lastNameKana"
                    name="lastNameKana"
                    placeholder="例: たなか"
                    className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.lastNameKana ? 'border-red-500' : 'border-gray-300'}`} // Added text-gray-900 and placeholder-gray-500
                    value={formData.lastNameKana}
                    onChange={handleInputChange}
                   />
                   {errors.lastNameKana && <p className="text-red-500 text-xs mt-1">{errors.lastNameKana}</p>}
                 </div>
                 <div className="flex flex-col w-[45%]"> {/* input-group */}
                  <label htmlFor="firstNameKana" className="mb-1 text-sm font-bold text-gray-900">めい</label> {/* Added text-gray-900 */}
                   <input
                    type="text"
                    id="firstNameKana"
                    name="firstNameKana"
                    placeholder="例: たろう"
                    className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.firstNameKana ? 'border-red-500' : 'border-gray-300'}`} // Added text-gray-900 and placeholder-gray-500
                    value={formData.firstNameKana}
                    onChange={handleInputChange}
                   />
                    {errors.firstNameKana && <p className="text-red-500 text-xs mt-1">{errors.firstNameKana}</p>}
                 </div>
              </div>
            </div>
            
            {/* Postal Code */}
            <div className="mb-7 text-left">
              <label htmlFor="postalCode" className="block mb-1 text-gray-900">お住まいの郵便番号<br/>( ハイフンなし7桁 )</label>
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
            
             {/* Navigation Buttons */}
             <div className="flex justify-around items-center"> {/* Adjusted alignment */}
               <button type="button" className="py-2 px-4 font-bold cursor-pointer text-gray-800" onClick={showPreviousCard}>＜ 戻る</button> {/* Added text-gray-800 */}
               <button type="button" className="w-[60%] py-2.5 px-5 rounded-md bg-[#ff702a] text-white font-bold cursor-pointer" onClick={handleNextCard2}>次へ</button>
             </div>
          </div>

          {/* Card 3: Job Search Results */}
           <div id="card3" className={`${cardBaseStyle} ${currentCardIndex === 3 ? cardActiveStyle : cardInactiveStyle}`}>
             <Image className="w-full mb-4" src="/images/STEP3.png" alt="Step 3" width={300} height={50} onLoad={handleImageLoad}/>
             
             {/* Job Count Display */}
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
                       <p className="text-blue-800 font-bold text-xl mb-2">
                         郵便番号 {formData.postalCode} エリア
                       </p>
                       <p className="text-blue-800 font-bold text-2xl mb-2">
                         {jobCount}件の求人があります
                       </p>
                       <p className="text-blue-700 text-sm">{jobCountMessage}</p>
                       {jobCount > 0 && (
                         <p className="text-green-700 text-sm mt-2 font-medium">
                           ✅ お近くの求人をご案内できます！
                         </p>
                       )}
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
             {/* Phone Number */}
             <div className="mb-7 text-left">
               <label htmlFor="phoneNumber" className="block mb-1 text-gray-900">携帯番号<br/>( ハイフンなし11桁 )</label> {/* Added text-gray-900 */}
               <input
                 type="tel" // Use tel type
                 id="phoneNumber"
                 name="phoneNumber"
                 placeholder="例: 09012345678"
                 className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${(errors.phoneNumber || phoneError) ? 'border-red-500' : 'border-gray-300'}`} // Added text-gray-900 and placeholder-gray-500
                 value={formData.phoneNumber}
                 onChange={handleInputChange}
                 maxLength={11}
               />
                {/* Combined error display */}
                {(errors.phoneNumber || phoneError) && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber || phoneError}</p>}
                {/* Original phoneError logic retained if specific message needed */}
               {/* <small className={`text-red-500 ${phoneError ? 'block' : 'hidden'}`}>{phoneError}</small> */}
             </div>
              {/* Navigation Buttons */}
             <div className="flex justify-around items-center">
               <button type="button" className="py-2 px-4 font-bold cursor-pointer text-gray-800 mb-0" onClick={showPreviousCard}>＜ 戻る</button>
               <button
                 type="button"
                 className={`w-[60%] py-2.5 px-5 rounded-md text-white font-bold cursor-pointer ${isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ff702a]'}`}
                 disabled={isSubmitDisabled}
                 onClick={handleNextCard3}
               >
                 入力内容を確認する
                </button>
             </div>
          </div>

          {/* Card 4: Confirmation Screen */}
          <div id="card4" className={`${cardBaseStyle} ${currentCardIndex === 4 ? cardActiveStyle : cardInactiveStyle}`}>
            <div className="mb-7 text-left">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">📋 入力内容をご確認ください</h2>
              </div>

              {/* Phone Number - Emphasized Section */}
              <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-2xl mr-2">📱</span>
                  <h3 className="text-lg font-bold text-orange-800">携帯番号の確認</h3>
                </div>
                <div className="bg-white p-3 rounded border border-orange-300">
                  <p className="text-2xl font-bold text-center text-gray-900 mb-2">
                    {formatPhoneNumber(formData.phoneNumber)}
                  </p>
                </div>
              </div>

              {/* Other Information */}
              <div className="space-y-4 mb-6">
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700 font-medium">生年月日：</span>
                      <span className="font-bold text-gray-900">{formatBirthDate(formData.birthDate)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700 font-medium">お名前：</span>
                      <span className="font-bold text-gray-900">{formData.lastName} {formData.firstName}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700 font-medium">ふりがな：</span>
                      <span className="font-bold text-gray-900">{formData.lastNameKana} {formData.firstNameKana}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">郵便番号：</span>
                      <span className="font-bold text-gray-900">{formData.postalCode}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Modify button */}
                <button 
                  type="button"
                  className="w-full py-2.5 px-4 bg-gray-100 text-gray-700 rounded-md font-medium border border-gray-300 hover:bg-gray-200 transition-colors"
                  onClick={() => setCurrentCardIndex(3)}
                >
                  ✏️ 入力内容を修正する
                </button>
                
                {/* Final submit button */}
                <button
                  type="button"
                  className="w-full py-3 px-5 bg-[#ff702a] text-white rounded-md font-bold text-lg hover:bg-orange-600 transition-colors"
                  onClick={handleFinalSubmit}
                >
                  ✅ この内容で送信する
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Taxi Image */}
      <div className="relative text-center mt-4"> {/* Added margin */}
        <Image className="w-1/2 inline-block" src="/images/car.png" alt="Taxi" width={200} height={100} onLoad={handleImageLoad}/> {/* Adjust size */}
      </div>


       {/* Exit Confirmation Modal */}
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
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
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

      {/* Footer */}
      <footer className="text-white py-5 mt-8 bg-[#6DCFE4]"> {/* Common background color */}
        {/* Common Footer Content */}
        <div className="container mx-auto px-4">
          <div className="text-center mb-5">
             {/* Adjusted width using Tailwind classes */}
            <Image className="mb-5 w-1/4 sm:w-1/6 md:w-[150px] inline-block" src="/images/flogo.png" alt="Footer Logo" width={150} height={40}/>
          </div>
          <div className="flex flex-col md:flex-row justify-around items-center text-center md:text-left text-xs mb-3 space-y-2 md:space-y-0">
            <a href="https://pmagent.jp/" className="text-white hover:underline">運営会社について</a>
            <a href="/privacy" className="text-white hover:underline">プライバシーポリシー</a>
          </div>
          <div className="text-center mt-3">
            <p className="text-xs">© 2025 株式会社PMAgent</p>
          </div>
        </div>
        {/* The media query logic for different footers is handled by Tailwind's responsive classes,
           so separate footer elements might not be needed unless content differs significantly.
           For now, using one footer and potentially adjusting content/layout with md: prefixes. */}
      </footer>

       {/*
         Removed original script tags as logic is now integrated into the React component using Hooks.
         - Loading screen: useEffect
         - Card switching: useState, showNextCard, showPreviousCard
         - Form validation: useState, validate functions, handleInputChange, handleSubmit
         - Phone number validation: validatePhoneNumberInput, isValidPhoneNumber, notifyInvalidPhoneNumber (needs API route)
       */}

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
