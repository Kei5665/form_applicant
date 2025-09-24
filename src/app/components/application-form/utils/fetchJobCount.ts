type JobCountResponse = {
  jobCount: number | null;
  message: string;
  searchMethod?: 'postal_code' | 'prefecture' | 'municipality';
  searchArea?: string;
  error?: string;
};

type JobCountParams =
  | { postalCode: string; prefectureId?: never; municipalityId?: never }
  | { postalCode?: never; prefectureId: string; municipalityId?: never }
  | { postalCode?: never; prefectureId?: never; municipalityId: string };

export async function fetchJobCount(params: JobCountParams): Promise<JobCountResponse> {
  const query = new URLSearchParams();
  if (params.postalCode) {
    query.set('postalCode', params.postalCode);
  }
  if (params.prefectureId) {
    query.set('prefectureId', params.prefectureId);
  }
  if (params.municipalityId) {
    query.set('municipalityId', params.municipalityId);
  }

  const response = await fetch(`/api/jobs-count?${query.toString()}`);
  const data: JobCountResponse = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '求人件数の取得に失敗しました');
  }
  return data;
}

