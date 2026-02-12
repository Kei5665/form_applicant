'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  JOB_POSITION_LABELS,
  LOCATION_LABELS,
} from '../constants';

type SelectOption = {
  value: string;
  label: string;
};

type OptionsState = {
  jobPositionOptions: SelectOption[];
  locationOptions: SelectOption[];
};

function toOptions(values: string[]): SelectOption[] {
  return values.map((value) => ({ value, label: value }));
}

function getFallbackOptions(): OptionsState {
  return {
    jobPositionOptions: toOptions(Object.values(JOB_POSITION_LABELS)),
    locationOptions: toOptions(Object.values(LOCATION_LABELS)),
  };
}

export function useCoupangStep1Options() {
  const fallbackOptions = useMemo(getFallbackOptions, []);
  const [options, setOptions] = useState<OptionsState>(fallbackOptions);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const response = await fetch('/api/coupang/step1-options');
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          jobPositions?: string[];
          desiredLocations?: string[];
        };

        const jobPositions = Array.isArray(data.jobPositions) ? data.jobPositions : [];
        const desiredLocations = Array.isArray(data.desiredLocations) ? data.desiredLocations : [];
        if (!isMounted || jobPositions.length === 0 || desiredLocations.length === 0) {
          return;
        }

        setOptions({
          jobPositionOptions: toOptions(jobPositions),
          locationOptions: toOptions(desiredLocations),
        });
      } catch (error) {
        console.error('Failed to load coupang step1 options:', error);
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    ...options,
    isLoadingOptions,
  };
}

