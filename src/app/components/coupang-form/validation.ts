import type { CoupangFormData, CoupangFormErrors } from './types';

// メールアドレス形式のバリデーション
export function validateEmail(email: string): string | undefined {
  if (!email) {
    return 'メールアドレスを入力してください';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '正しいメールアドレス形式で入力してください';
  }

  return undefined;
}

// 氏名（漢字）のバリデーション
export function validateFullName(fullName: string): string | undefined {
  if (!fullName) {
    return '氏名（漢字）を入力してください';
  }

  // 全角文字チェック（ひらがな、カタカナ、漢字、スペース）
  const fullWidthRegex = /^[ぁ-んァ-ヶー一-龥々〆〤\u3000 ]+$/;
  if (!fullWidthRegex.test(fullName)) {
    return '全角文字で入力してください';
  }

  return undefined;
}

// 氏名（ふりがな）のバリデーション
export function validateFullNameKana(fullNameKana: string): string | undefined {
  if (!fullNameKana) {
    return '氏名（ふりがな）を入力してください';
  }

  // ひらがなとスペースのみチェック
  const hiraganaRegex = /^[ぁ-ん\u3000 ]+$/;
  if (!hiraganaRegex.test(fullNameKana)) {
    return 'ひらがなで入力してください';
  }

  return undefined;
}

// 電話番号のバリデーション
export function validatePhoneNumber(phoneNumber: string): string | undefined {
  if (!phoneNumber) {
    return '電話番号を入力してください';
  }

  // 数字のみ抽出
  const numbers = phoneNumber.replace(/[^\d]/g, '');
  
  // 10桁または11桁の数字をチェック
  if (numbers.length < 10 || numbers.length > 11) {
    return '10桁または11桁の電話番号を入力してください';
  }

  // 0から始まることをチェック
  if (!numbers.startsWith('0')) {
    return '電話番号は0から始まる必要があります';
  }

  return undefined;
}

// 選択式フィールドのバリデーション
export function validateRequired(value: string | boolean, fieldName: string): string | undefined {
  if (!value) {
    return `${fieldName}を選択してください`;
  }
  return undefined;
}

export function validateBirthDate(birthDate: string): string | undefined {
  if (!birthDate) {
    return '生年月日を入力してください';
  }

  if (!/^\d{8}$/.test(birthDate)) {
    return '生年月日を8桁の数字で入力してください';
  }

  const year = Number(birthDate.slice(0, 4));
  const month = Number(birthDate.slice(4, 6));
  const day = Number(birthDate.slice(6, 8));

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return '生年月日を8桁の数字で入力してください';
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return '生年月日を8桁の数字で入力してください';
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return '生年月日を8桁の数字で入力してください';
  }

  return undefined;
}

// 全フォームデータのバリデーション
export function validateCoupangForm(formData: CoupangFormData): CoupangFormErrors {
  const errors: CoupangFormErrors = {};

  // 求職者情報
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const fullNameError = validateFullName(formData.fullName);
  if (fullNameError) errors.fullName = fullNameError;

  const fullNameKanaError = validateFullNameKana(formData.fullNameKana);
  if (fullNameKanaError) errors.fullNameKana = fullNameKanaError;

  const phoneNumberError = validatePhoneNumber(formData.phoneNumber);
  if (phoneNumberError) errors.phoneNumber = phoneNumberError;

  // 応募情報
  if (!formData.jobPosition) {
    errors.jobPosition = '希望職種を選択してください';
  }

  if (!formData.desiredLocation) {
    errors.desiredLocation = '希望勤務地を選択してください';
  }

  // セミナー情報
  if (!formData.seminarSlot) {
    errors.seminarSlot = '参加希望日時を選択してください';
  }

  if (!formData.age) {
    errors.age = '年齢を選択してください';
  }

  const birthDateError = validateBirthDate(formData.birthDate);
  if (birthDateError) errors.birthDate = birthDateError;

  return errors;
}

// 電話番号の自動フォーマット
export function formatPhoneNumber(value: string): string {
  // 数字のみ抽出
  const numbers = value.replace(/[^\d]/g, '');

  // 長さに応じてフォーマット
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else if (numbers.length <= 11) {
    // 携帯電話の場合 (090-1234-5678)
    if (numbers.startsWith('070') || numbers.startsWith('080') || numbers.startsWith('090')) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
    // 固定電話の場合
    return `${numbers.slice(0, numbers.length - 8)}-${numbers.slice(numbers.length - 8, numbers.length - 4)}-${numbers.slice(numbers.length - 4)}`;
  }

  return value;
}
