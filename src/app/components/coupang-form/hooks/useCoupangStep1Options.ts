'use client';

import { useEffect, useMemo, useState } from 'react';

type SelectOption = {
  value: string;
  label: string;
};

type OptionsState = {
  jobPositionOptions: SelectOption[];
  locationOptions: SelectOption[];
  locationOptionsByJobPosition: Record<string, SelectOption[]>;
};

function toOptions(values: string[]): SelectOption[] {
  return values.map((value) => ({ value, label: value }));
}

function getFallbackOptions(): OptionsState {
  return {
    jobPositionOptions: [],
    locationOptions: [],
    locationOptionsByJobPosition: {},
  };
}

function buildLocationMap(
  combinations: { jobPosition: string; desiredLocation: string }[]
): Record<string, SelectOption[]> {
  const map = new Map<string, string[]>();

  for (const pair of combinations) {
    const current = map.get(pair.jobPosition) ?? [];
    if (!current.includes(pair.desiredLocation)) {
      current.push(pair.desiredLocation);
      map.set(pair.jobPosition, current);
    }
  }

  const record: Record<string, SelectOption[]> = {};
  for (const [jobPosition, locations] of map.entries()) {
    record[jobPosition] = toOptions(locations);
  }

  return record;
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
          combinations?: { jobPosition?: string; desiredLocation?: string }[];
        };

        const jobPositions = Array.isArray(data.jobPositions) ? data.jobPositions : [];
        const desiredLocations = Array.isArray(data.desiredLocations) ? data.desiredLocations : [];
        const combinations = Array.isArray(data.combinations)
          ? data.combinations
              .map((pair) => ({
                jobPosition: String(pair?.jobPosition ?? '').trim(),
                desiredLocation: String(pair?.desiredLocation ?? '').trim(),
              }))
              .filter((pair) => pair.jobPosition && pair.desiredLocation)
          : [];
        if (!isMounted || jobPositions.length === 0 || desiredLocations.length === 0) {
          return;
        }

        setOptions({
          jobPositionOptions: toOptions(jobPositions),
          locationOptions: toOptions(desiredLocations),
          locationOptionsByJobPosition: buildLocationMap(combinations),
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
