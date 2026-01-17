type JobCountResponse = {
  jobCount: number | null;
  message: string;
  searchMethod?: 'postal_code' | 'prefecture';
  searchArea?: string;
  prefectureName?: string;
  prefectureId?: string;
  error?: string;
};

export type JobCountParams =
  | { postalCode: string; prefectureId?: never; municipalityId?: never; jobCategoryIds?: string[] }
  | { postalCode?: never; prefectureId: string; jobCategoryIds?: string[] };

export async function fetchJobCount(params: JobCountParams): Promise<JobCountResponse> {
  const query = new URLSearchParams();
  if (params.postalCode) {
    query.set('postalCode', params.postalCode);
  }
  if (params.prefectureId) {
    query.set('prefectureId', params.prefectureId);
  }
  if (params.jobCategoryIds && params.jobCategoryIds.length > 0) {
    query.set('jobCategoryIds', params.jobCategoryIds.join(','));
  }

  const response = await fetch(`/api/jobs-count?${query.toString()}`);
  const data: JobCountResponse = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '求人件数の取得に失敗しました');
  }
  return data;
}
