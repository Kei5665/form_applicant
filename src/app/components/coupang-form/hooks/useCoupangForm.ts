import { useState, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { CoupangFormData, CoupangFormErrors } from '../types';
import { validateCoupangForm, formatPhoneNumber } from '../validation';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

const initialFormData: CoupangFormData = {
  email: '',
  fullName: '',
  fullNameKana: '',
  englishName: '',
  phoneNumber: '',
  jobPosition: '',
  applicationReason: '',
  seminarSlot: '',
  pastExperience: '',
  condition1: false,
  condition2: false,
  condition3: false,
  condition4: false,
  condition5: false,
};

export function useCoupangForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<CoupangFormData>(initialFormData);
  const [errors, setErrors] = useState<CoupangFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // エラーをクリア
    if (errors[name as keyof CoupangFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handlePhoneNumberBlur = useCallback(() => {
    if (formData.phoneNumber) {
      const formatted = formatPhoneNumber(formData.phoneNumber);
      setFormData((prev) => ({ ...prev, phoneNumber: formatted }));
    }
  }, [formData.phoneNumber]);

  const handleSubmit = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // バリデーション
    const validationErrors = validateCoupangForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // 最初のエラーフィールドまでスクロール
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // UTMパラメータ取得
      const urlParams = new URLSearchParams(window.location.search);
      const utmParams = {
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        utm_term: urlParams.get('utm_term') || undefined,
      };

      // GTMイベント送信
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'form_submit',
          form_name: 'coupang_rocketnow_application',
        });
      }

      const response = await fetch('/api/coupang/applicants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          utmParams,
        }),
      });

      if (!response.ok) {
        throw new Error('送信に失敗しました');
      }

      // サンクスページへ遷移
      router.push('/coupang/applicants/new');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router]);

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handlePhoneNumberBlur,
    handleSubmit,
  };
}
