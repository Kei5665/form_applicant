'use client';

import { useEffect } from 'react';

type UseFormExitGuardParams = {
  isFormDirty: boolean;
  currentCardIndex: number;
  setShowExitModal: (value: boolean) => void;
  markFormClean: () => void;
};

export function useFormExitGuard({ isFormDirty, currentCardIndex, setShowExitModal, markFormClean }: UseFormExitGuardParams) {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isFormDirty) {
        event.preventDefault();
        event.returnValue = '';
        return '';
      }
      return undefined;
    };

    const handlePopState = (event: PopStateEvent) => {
      if (isFormDirty) {
        event.preventDefault();
        setShowExitModal(true);
        window.history.pushState(null, '', window.location.pathname + window.location.search);
      } else {
        markFormClean();
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
  }, [isFormDirty, setShowExitModal, markFormClean]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isFormDirty && currentCardIndex < 4) {
        window.dataLayer?.push({
          event: 'step_abandon',
          step_name: currentCardIndex === 4 ? 'confirmation' : `step_${currentCardIndex}`,
          step_number: currentCardIndex,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentCardIndex, isFormDirty]);
}

