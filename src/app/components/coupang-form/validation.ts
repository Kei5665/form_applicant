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

  // 全角スペースで分割
  const parts = fullName.split('　');
  if (parts.length !== 2) {
    return '姓と名の間に全角スペースを1つ入れてください（例：山田　太郎）';
  }

  if (parts[0].trim() === '' || parts[1].trim() === '') {
    return '姓と名の両方を入力してください';
  }

  // 全角文字チェック（ひらがな、カタカナ、漢字）
  const fullWidthRegex = /^[ぁ-んァ-ヶー一-龥々〆〤]+$/;
  if (!fullWidthRegex.test(parts[0]) || !fullWidthRegex.test(parts[1])) {
    return '全角文字で入力してください';
  }

  return undefined;
}

// 氏名（ふりがな）のバリデーション
export function validateFullNameKana(fullNameKana: string): string | undefined {
  if (!fullNameKana) {
    return '氏名（ふりがな）を入力してください';
  }

  // 全角スペースで分割
  const parts = fullNameKana.split('　');
  if (parts.length !== 2) {
    return '姓と名の間に全角スペースを1つ入れてください（例：やまだ　たろう）';
  }

  if (parts[0].trim() === '' || parts[1].trim() === '') {
    return '姓と名の両方を入力してください';
  }

  // ひらがなのみチェック
  const hiraganaRegex = /^[ぁ-ん]+$/;
  if (!hiraganaRegex.test(parts[0]) || !hiraganaRegex.test(parts[1])) {
    return 'ひらがなで入力してください';
  }

  return undefined;
}

// 英名のバリデーション
export function validateEnglishName(englishName: string): string | undefined {
  if (!englishName) {
    return '英名を入力してください';
  }

  // 全角スペースで分割
  const parts = englishName.split('　');
  if (parts.length !== 2) {
    return '名と姓の間に全角スペースを1つ入れてください（例：Taro　Yamada）';
  }

  if (parts[0].trim() === '' || parts[1].trim() === '') {
    return '名と姓の両方を入力してください';
  }

  // アルファベットチェック（大文字小文字、スペース、ハイフン許可）
  const alphabetRegex = /^[a-zA-Z\-]+$/;
  if (!alphabetRegex.test(parts[0].trim()) || !alphabetRegex.test(parts[1].trim())) {
    return 'アルファベットで入力してください';
  }

  return undefined;
}

// 電話番号のバリデーション
export function validatePhoneNumber(phoneNumber: string): string | undefined {
  if (!phoneNumber) {
    return '電話番号を入力してください';
  }

  // ハイフン付き形式チェック（XXX-XXXX-XXXX or XX-XXXX-XXXX）
  const phoneRegex = /^0\d{1,4}-\d{1,4}-\d{4}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return 'ハイフン付きで入力してください（例：090-1234-5678）';
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

  const englishNameError = validateEnglishName(formData.englishName);
  if (englishNameError) errors.englishName = englishNameError;

  const phoneNumberError = validatePhoneNumber(formData.phoneNumber);
  if (phoneNumberError) errors.phoneNumber = phoneNumberError;

  // 応募情報
  if (!formData.jobPosition) {
    errors.jobPosition = '希望職種を選択してください';
  }

  if (!formData.applicationReason) {
    errors.applicationReason = '志望理由を選択してください';
  }

  // セミナー情報
  if (!formData.seminarSlot) {
    errors.seminarSlot = '参加希望日時を選択してください';
  }

  if (!formData.pastExperience) {
    errors.pastExperience = '過去の参加／勤務経験を選択してください';
  }

  // 参加条件確認
  if (!formData.condition1) {
    errors.condition1 = '参加条件を確認してください';
  }
  if (!formData.condition2) {
    errors.condition2 = '参加条件を確認してください';
  }
  if (!formData.condition3) {
    errors.condition3 = '参加条件を確認してください';
  }
  if (!formData.condition4) {
    errors.condition4 = '参加条件を確認してください';
  }
  if (!formData.condition5) {
    errors.condition5 = '参加条件を確認してください';
  }

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
