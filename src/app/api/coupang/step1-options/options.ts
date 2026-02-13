export type CoupangStep1Options = {
  jobPositions: string[];
  desiredLocations: string[];
  combinations: { jobPosition: string; desiredLocation: string }[];
  updatedAt: string;
  source: 'gas' | 'fallback';
};

function uniqueNonEmpty(values: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = String(value ?? '').trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function getFallbackOptions(): CoupangStep1Options {
  return {
    jobPositions: [],
    desiredLocations: [],
    combinations: [],
    updatedAt: new Date().toISOString(),
    source: 'fallback',
  };
}

function parseCombinations(rawValue: unknown): { jobPosition: string; desiredLocation: string }[] {
  if (!Array.isArray(rawValue)) {
    return [];
  }

  const seen = new Set<string>();
  const result: { jobPosition: string; desiredLocation: string }[] = [];

  for (const item of rawValue) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const obj = item as { jobPosition?: unknown; desiredLocation?: unknown };
    const jobPosition = String(obj.jobPosition ?? '').trim();
    const desiredLocation = String(obj.desiredLocation ?? '').trim();
    if (!jobPosition || !desiredLocation) {
      continue;
    }
    const key = `${jobPosition}@@${desiredLocation}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push({ jobPosition, desiredLocation });
  }

  return result;
}

export async function getCoupangStep1Options(): Promise<CoupangStep1Options> {
  const gasApiUrl = process.env.GAS_COUPANG_STEP1_OPTIONS_API_URL;

  if (!gasApiUrl) {
    console.warn('GAS_COUPANG_STEP1_OPTIONS_API_URL is not set. Using fallback options.');
    return getFallbackOptions();
  }

  try {
    const response = await fetch(gasApiUrl, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch coupang step1 options: ${response.status} ${response.statusText}`
      );
      return getFallbackOptions();
    }

    const rawData = (await response.json()) as {
      jobPositions?: unknown[];
      desiredLocations?: unknown[];
      combinations?: unknown[];
      updatedAt?: string;
    };

    const jobPositions = uniqueNonEmpty(rawData.jobPositions ?? []);
    const desiredLocations = uniqueNonEmpty(rawData.desiredLocations ?? []);
    const combinations = parseCombinations(rawData.combinations);

    if (jobPositions.length === 0 || desiredLocations.length === 0) {
      console.error('Invalid step1 options payload from GAS. Using empty fallback options.', rawData);
      return getFallbackOptions();
    }

    return {
      jobPositions,
      desiredLocations,
      combinations,
      updatedAt: rawData.updatedAt || new Date().toISOString(),
      source: 'gas',
    };
  } catch (error) {
    console.error('Error fetching coupang step1 options. Using fallback options.', error);
    return getFallbackOptions();
  }
}
