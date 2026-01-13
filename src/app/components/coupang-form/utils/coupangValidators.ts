import type { CoupangFormData, CoupangFormErrors } from '../types';

// メールアドレスのバリデーション
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 電話番号のバリデーション（11桁の数字）
export function isValidPhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^0\d{10}$/;
  return phoneRegex.test(phoneNumber);
}

// ステップ1: 応募情報のバリデーション
export function validateStep1(formData: CoupangFormData): { isValid: boolean; errors: CoupangFormErrors } {
  const errors: CoupangFormErrors = {};

  if (!formData.jobPosition) {
    errors.jobPosition = '希望職種を選択してください';
  }

  if (!formData.desiredLocation) {
    errors.desiredLocation = '希望勤務地を選択してください';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ステップ2: セミナー情報のバリデーション
export function validateStep2(formData: CoupangFormData): { isValid: boolean; errors: CoupangFormErrors } {
  const errors: CoupangFormErrors = {};

  if (!formData.seminarSlot) {
    errors.seminarSlot = '参加希望日時を選択してください';
  }

  if (!formData.age) {
    errors.age = '年齢を選択してください';
  } else {
    const ageValue = Number(formData.age);
    if (Number.isNaN(ageValue) || ageValue < 18 || ageValue > 40) {
      errors.age = '年齢は18歳〜40歳の範囲で選択してください';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ステップ3: 参加条件確認のバリデーション
export function validateStep3(formData: CoupangFormData): { isValid: boolean; errors: CoupangFormErrors } {
  const errors: CoupangFormErrors = {};

  // 氏名（漢字）
  if (!formData.fullName.trim()) {
    errors.fullName = '氏名を入力してください';
  } else if (!/^[ぁ-んァ-ヶー一-龠々\s]+$/.test(formData.fullName)) {
    errors.fullName = '氏名は全角文字で入力してください';
  }

  // 氏名（ふりがな）
  if (!formData.fullNameKana.trim()) {
    errors.fullNameKana = 'ふりがなを入力してください';
  } else if (!/^[ぁ-んー\s]+$/.test(formData.fullNameKana)) {
    errors.fullNameKana = 'ふりがなはひらがなで入力してください';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ステップ4: 求職者基本情報のバリデーション
export function validateStep4(formData: CoupangFormData): { isValid: boolean; errors: CoupangFormErrors } {
  const errors: CoupangFormErrors = {};

  // メールアドレス
  if (!formData.email.trim()) {
    errors.email = 'メールアドレスを入力してください';
  } else if (!isValidEmail(formData.email)) {
    errors.email = '有効なメールアドレスを入力してください';
  }

  // 電話番号
  if (!formData.phoneNumber.trim()) {
    errors.phoneNumber = '電話番号を入力してください';
  } else if (!isValidPhoneNumber(formData.phoneNumber)) {
    errors.phoneNumber = '有効な電話番号を入力してください（11桁の数字）';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// すべてのステップのバリデーション（最終送信前）
export function validateAllSteps(formData: CoupangFormData): { isValid: boolean; errors: CoupangFormErrors } {
  const step1 = validateStep1(formData);
  const step2 = validateStep2(formData);
  const step3 = validateStep3(formData);
  const step4 = validateStep4(formData);

  const allErrors = {
    ...step1.errors,
    ...step2.errors,
    ...step3.errors,
    ...step4.errors,
  };

  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
  };
}
