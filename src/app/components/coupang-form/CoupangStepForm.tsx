'use client';

import { useCoupangFormState } from './hooks/useCoupangFormState';
import { useSeminarSlots } from './hooks/useSeminarSlots';
import {
  JOB_POSITION_LABELS,
  APPLICATION_REASON_LABELS,
  PAST_EXPERIENCE_LABELS,
} from './constants';
import CoupangApplicationInfoCard from './components/CoupangApplicationInfoCard';
import CoupangSeminarInfoCard from './components/CoupangSeminarInfoCard';
import CoupangConditionCard from './components/CoupangConditionCard';
import CoupangPersonalInfoCard from './components/CoupangPersonalInfoCard';

type CoupangStepFormProps = {
  stepImageSrcs?: {
    step1?: string;
    step2?: string;
    step3?: string;
    step4?: string;
  };
};

export default function CoupangStepForm({
  stepImageSrcs = {
    step1: '/images/STEP1.webp',
    step2: '/images/STEP2.webp',
    step3: '/images/STEP3.webp',
    step4: '/images/STEP4.webp',
  },
}: CoupangStepFormProps) {
  const {
    formData,
    errors,
    isSubmitting,
    cardStates,
    handleChange,
    handleNextStep1,
    handleNextStep2,
    handleNextStep3,
    handlePreviousStep,
    handleSubmit,
  } = useCoupangFormState();

  const { slots, isLoading: slotsLoading } = useSeminarSlots();

  // 選択肢の配列作成
  const jobPositionOptions = [
    { value: '' as const, label: '選択してください' },
    ...Object.entries(JOB_POSITION_LABELS).map(([value, label]) => ({
      value: value as keyof typeof JOB_POSITION_LABELS,
      label,
    })),
  ];

  const applicationReasonOptions = [
    { value: '' as const, label: '選択してください' },
    ...Object.entries(APPLICATION_REASON_LABELS).map(([value, label]) => ({
      value: value as keyof typeof APPLICATION_REASON_LABELS,
      label,
    })),
  ];

  const pastExperienceOptions = [
    { value: '' as const, label: '選択してください' },
    ...Object.entries(PAST_EXPERIENCE_LABELS).map(([value, label]) => ({
      value: value as keyof typeof PAST_EXPERIENCE_LABELS,
      label,
    })),
  ];

  const seminarSlotOptions = slots.map((slot) => ({
    value: slot.date,
    label: slot.date,
  }));

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} noValidate>
        {/* ステップ1: 応募情報 */}
        <CoupangApplicationInfoCard
          stepImageSrc={stepImageSrcs.step1!}
          formData={formData}
          errors={errors}
          jobPositionOptions={jobPositionOptions}
          applicationReasonOptions={applicationReasonOptions}
          onChange={handleChange}
          onNext={handleNextStep1}
          isActive={cardStates.isStep1Active}
        />

        {/* ステップ2: セミナー情報 */}
        <CoupangSeminarInfoCard
          stepImageSrc={stepImageSrcs.step2!}
          formData={formData}
          errors={errors}
          seminarSlotOptions={seminarSlotOptions}
          pastExperienceOptions={pastExperienceOptions}
          slotsLoading={slotsLoading}
          onChange={handleChange}
          onNext={handleNextStep2}
          onPrevious={handlePreviousStep}
          isActive={cardStates.isStep2Active}
        />

        {/* ステップ3: 参加条件確認 */}
        <CoupangConditionCard
          stepImageSrc={stepImageSrcs.step3!}
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onNext={handleNextStep3}
          onPrevious={handlePreviousStep}
          isActive={cardStates.isStep3Active}
        />

        {/* ステップ4: 求職者基本情報 */}
        <CoupangPersonalInfoCard
          stepImageSrc={stepImageSrcs.step4!}
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onPrevious={handlePreviousStep}
          isSubmitting={isSubmitting}
          isActive={cardStates.isStep4Active}
        />
      </form>
    </div>
  );
}

