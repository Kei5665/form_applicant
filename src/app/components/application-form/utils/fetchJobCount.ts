type JobCountResponse = {
  jobCount: number | null;
  message: string;
  error?: string;
};

export async function fetchJobCount(postalCode: string): Promise<JobCountResponse> {
  const response = await fetch(`/api/jobs-count?postalCode=${postalCode}`);
  const data: JobCountResponse = await response.json();
  if (!response.ok) {
    throw new Error(data.error || '求人件数の取得に失敗しました');
  }
  return data;
}

