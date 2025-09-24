import type { BirthDate, FormData, FormErrors } from '../types';

const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!/^(070|080|090)\d{8}$/.test(phoneNumber)) return false;
  if (/(.)\1{4,}/.test(phoneNumber)) return false;
  if (/01234|12345|23456|34567|45678|56789|98765|87654|76543|65432|54321/.test(phoneNumber)) return false;
  if (/^09012345678$|^08012345678$/.test(phoneNumber)) return false;
  if (/^(\d)\1+$/.test(phoneNumber)) return false;
  return true;
};

export const validateCard1 = (birthDate: BirthDate) => {
  let isValid = true;
  const errors: FormErrors = {};
  const { year, month, day } = birthDate;

  if (!year || !month || !day) {
    errors.birthDate = '生年月日をすべて選択してください。';
    return { isValid: false, errors };
  }

  const birth = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  const today = new Date();

  if (
    birth.getFullYear() !== parseInt(year, 10) ||
    birth.getMonth() !== parseInt(month, 10) - 1 ||
    birth.getDate() !== parseInt(day, 10)
  ) {
    errors.birthDate = '有効な日付を選択してください。';
    return { isValid: false, errors };
  }

  const minAge = 18;
  const maxAge = 84;
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  if (age < minAge) {
    errors.birthDate = `${minAge}歳以上である必要があります。`;
    isValid = false;
  } else if (age > maxAge) {
    errors.birthDate = `${maxAge}歳以下である必要があります。`;
    isValid = false;
  }

  if (birth > today) {
    errors.birthDate = '未来の日付は選択できません。';
    isValid = false;
  }

  return { isValid, errors };
};

export const validateCard2 = (formData: FormData) => {
  const errors: FormErrors = {};
  let isValid = true;

  const hasPostalCode = Boolean(formData.postalCode);
  const hasLocationSelection = Boolean(formData.prefectureId && formData.municipalityId);

  if (!hasPostalCode && !hasLocationSelection) {
    errors.postalCode = '郵便番号または地域を選択してください。';
    errors.prefectureId = '都道府県を選択してください。';
    errors.municipalityId = '市区町村を選択してください。';
    isValid = false;
  }

  if (hasPostalCode && !/^[0-9]{7}$/.test(formData.postalCode)) {
    errors.postalCode = '郵便番号はハイフンなしの7桁で入力してください。';
    isValid = false;
  }

  if (!formData.prefectureId && formData.municipalityId) {
    errors.prefectureId = '都道府県を選択してください。';
    isValid = false;
  }

  if (formData.prefectureId && !formData.municipalityId) {
    errors.municipalityId = '市区町村を選択してください。';
    isValid = false;
  }

  return { isValid, errors };
};

export const validateNameFields = (formData: FormData) => {
  const errors: FormErrors = {};
  let isValid = true;

  if (!formData.lastName) {
    errors.lastName = '姓は必須です。';
    isValid = false;
  }
  if (!formData.firstName) {
    errors.firstName = '名は必須です。';
    isValid = false;
  }
  if (!formData.lastNameKana || !/^[ぁ-んー]+$/.test(formData.lastNameKana)) {
    errors.lastNameKana = 'ひらがなで入力してください。';
    isValid = false;
  }
  if (!formData.firstNameKana || !/^[ぁ-んー]+$/.test(formData.firstNameKana)) {
    errors.firstNameKana = 'ひらがなで入力してください。';
    isValid = false;
  }

  return { isValid, errors };
};

export const validateFinalStep = (phoneNumber: string) => {
  const errors: FormErrors = {};
  if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
    errors.phoneNumber = '有効な携帯番号を入力してください。';
    return { isValid: false, errors };
  }
  return { isValid: true, errors };
};

export { isValidPhoneNumber };

