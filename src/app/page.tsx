'use client'; // Add this directive for client-side interactivity

import Image from "next/image";
import { useState, useEffect } from 'react';

export default function Home() {
  // State for loading screen visibility
  const [loading, setLoading] = useState(true);
  // State for current card index
  const [currentCardIndex, setCurrentCardIndex] = useState(1);
  // State for form data (example structure, adjust as needed)
  const [formData, setFormData] = useState({
    birthYear: '',
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    postalCode: '',
    phoneNumber: '',
  });
  // State for form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  // State for phone number validation error message
  const [phoneError, setPhoneError] = useState<string | null>(null);
  // State for submit button disabled status
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  // --- Loading Screen Effect ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Hide after 2 seconds

    // Simulate fade-out effect via state change, CSS handles the transition
    return () => clearTimeout(timer);
  }, []);

  // --- Card Navigation ---
  const showNextCard = () => {
    setCurrentCardIndex((prevIndex) => Math.min(prevIndex + 1, 3)); // Assuming 3 cards total
  };

  const showPreviousCard = () => {
    setCurrentCardIndex((prevIndex) => Math.max(prevIndex - 1, 1));
  };

  // --- Form Input Handling ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
    // Specific logic for phone number validation on input
    if (name === 'phoneNumber') {
      validatePhoneNumberInput(value);
    }
  };

  // --- Form Validation ---
  const validateCard1 = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    if (!formData.birthYear || !/^\d{4}$/.test(formData.birthYear)) {
      newErrors.birthYear = '西暦4桁で入力してください。';
      isValid = false;
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
    setErrors(newErrors);
    return isValid;
  };

  const handleNextCard1 = () => {
    if (validateCard1()) {
      showNextCard();
    }
  }

  const handleNextCard2 = () => {
    if (validateCard2()) {
      showNextCard();
    }
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

    if (!formData.postalCode) {
      newErrors.postalCode = '郵便番号は必須です。';
      isValid = false;
    } else if (!/^\d{7}$/.test(formData.postalCode)) {
      newErrors.postalCode = '郵便番号はハイフンなしの7桁で入力してください。';
      isValid = false;
    }

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


  // --- Form Submit Handler ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission

    if (validateFinalStep()) {
       console.log("Form Data to be Submitted:", formData); // Changed log message

       // Call the backend API route
       try {
         const response = await fetch('/api/applicants', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(formData),
         });

         if (response.ok) {
           const result = await response.json();
           console.log('Form submitted successfully:', result.message);
           // Optionally, redirect to a thank you page or show a success message
           alert('お申し込みありがとうございます！'); // Show success alert
           // Reset form or redirect here if needed
           // Example: setCurrentCardIndex(1); setFormData({ ...initial state... });
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
       // Removed the old placeholder alert
    } else {
       console.log("Final validation failed", errors);
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
      {loading && (
         <div
            id="loading-screen"
            className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-90 flex flex-col justify-center items-center z-[9999] transition-opacity duration-1000 ease-out"
            style={{ opacity: loading ? 1 : 0 }} // Control opacity via state
          >
            <Image src="/images/ride_logo.png" alt="Ride Job Logo" width={200} height={50} className="w-1/2 mb-4"/> {/* Adjust width as needed */}
             {/* Replace spinners with Tailwind equivalent or remove */}
            <div className="flex space-x-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce"></div>
                <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-4 h-4 bg-orange-500 rounded-full animate-bounce delay-300"></div>
            </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between p-1.5 bg-white w-[95%] mx-auto mt-2.5 rounded-md shadow"> {/* Approximate styles */}
        <div className="pl-2.5">
          <Image src="/images/ride_logo.png" alt="Ride Job Logo" width={120} height={30} className="h-[30px] w-auto"/> {/* Adjust size */}
        </div>
        <div className="text-right pr-2.5">
          <p className="text-xs text-gray-800 my-1">未経験でタクシー会社に就職するなら</p> {/* Changed text-gray-700 to text-gray-800 */}
          <p className="text-xs text-black font-bold my-1">RIDE JOB（ライドジョブ）</p>
        </div>
      </header>

      {/* People Image */}
      <div className="container mx-auto text-center px-2 flex justify-center my-4"> {/* Added margin */}
        <Image src="/images/kange2.png" alt="" width={500} height={150} className="w-full max-w-lg"/> {/* Adjust size */}
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} id="form" className="flex justify-center">
        <div className="relative w-full flex justify-center"> {/* Container for cards */}
          {/* Card 1: Birth Year */}
          <div id="card1" className={`${cardBaseStyle} ${currentCardIndex === 1 ? cardActiveStyle : cardInactiveStyle}`}>
            <div className="mb-7 text-left"> {/* form-group */}
              <Image className="w-full mb-4" src="/images/STEP1.png" alt="Step 1" width={300} height={50}/>
              <label htmlFor="birthYear" className="font-bold mb-2.5 block text-gray-900">生まれ年（西暦）</label> {/* Added text-gray-900 */}
              <div className="flex items-center">
                <input
                  type="number" // Use number type for year
                  id="birthYear"
                  name="birthYear"
                  placeholder="例: 1990"
                  className={`flex-grow p-2 border rounded text-gray-900 placeholder-gray-500 ${errors.birthYear ? 'border-red-500' : 'border-gray-300'}`} // Added text-gray-900 and placeholder-gray-500
                  value={formData.birthYear}
                  onChange={handleInputChange}
                  maxLength={4}
                />
                <span className="ml-2 font-bold text-gray-900">年</span> {/* Added text-gray-900 */}
              </div>
               {errors.birthYear && <p className="text-red-500 text-xs mt-1">{errors.birthYear}</p>}
            </div>
            <button type="button" className="w-full py-2.5 px-5 rounded-md bg-[#ff702a] text-white font-bold cursor-pointer" onClick={handleNextCard1}>次へ</button>
          </div>

          {/* Card 2: Name */}
          <div id="card2" className={`${cardBaseStyle} ${currentCardIndex === 2 ? cardActiveStyle : cardInactiveStyle}`}>
             <Image className="w-full mb-4" src="/images/STEP2.png" alt="Step 2" width={300} height={50}/>
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
             {/* Navigation Buttons */}
             <div className="flex justify-around items-center"> {/* Adjusted alignment */}
               <button type="button" className="py-2 px-4 font-bold cursor-pointer text-gray-800" onClick={showPreviousCard}>＜ 戻る</button> {/* Added text-gray-800 */}
               <button type="button" className="w-[60%] py-2.5 px-5 rounded-md bg-[#ff702a] text-white font-bold cursor-pointer" onClick={handleNextCard2}>次へ</button>
             </div>
          </div>

          {/* Card 3: Contact Info */}
           <div id="card3" className={`${cardBaseStyle} ${currentCardIndex === 3 ? cardActiveStyle : cardInactiveStyle}`}>
             <Image className="w-full mb-4" src="/images/STEP3.png" alt="Step 3" width={300} height={50}/>
             {/* Postal Code */}
             <div className="mb-7 text-left">
               <label htmlFor="postalCode" className="block mb-1 text-gray-900">お住まいの郵便番号<br/>( ハイフンなし7桁 )</label> {/* Added text-gray-900 */}
               <input
                 type="text" // Keep as text for pattern matching
                 id="postalCode"
                 name="postalCode"
                 placeholder="例: 1234567"
                 className={`p-2 border rounded w-full text-gray-900 placeholder-gray-500 ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`} // Added text-gray-900 and placeholder-gray-500
                 value={formData.postalCode}
                 onChange={handleInputChange}
                 maxLength={7}
               />
                {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
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
              {/* Navigation/Submit Buttons */}
             <div className="flex justify-around items-center">
               <button type="button" className="py-2 px-4 font-bold cursor-pointer text-gray-800 mb-0" onClick={showPreviousCard}>＜ 戻る</button> {/* Added text-gray-800 */}
               <button
                 type="submit"
                 id="submitButton"
                 className={`w-[60%] py-2.5 px-5 rounded-md text-white font-bold cursor-pointer ${isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ff702a]'}`}
                 disabled={isSubmitDisabled}
               >
                 送信
                </button>
             </div>
          </div>
        </div>
      </form>

      {/* Taxi Image */}
      <div className="relative text-center mt-4"> {/* Added margin */}
        <Image className="w-1/2 inline-block" src="/images/car.png" alt="Taxi" width={200} height={100} /> {/* Adjust size */}
      </div>


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
            <a href="https://saiyocommon.com/pmagent/privacy-policy" className="text-white hover:underline">プライバシーポリシー</a>
          </div>
          <div className="text-center mt-3">
            <p className="text-xs">© 2024 株式会社PMAgent</p>
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
