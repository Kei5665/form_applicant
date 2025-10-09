// microCMS API client
const BASE_URL = `https://${process.env.MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1`;
const API_KEY = process.env.MICROCMS_API_KEY;

if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
  throw new Error('microCMS environment variables are not set');
}

export interface MicroCMSListResponse<T> {
  contents: T[];
  totalCount: number;
  offset: number;
  limit: number;
}

export interface PrefectureEntry {
  id: string;
  region: string;
  area: string;
}

export interface MunicipalityEntry {
  id: string;
  name: string;
  prefecture: {
    id: string;
    region: string;
  };
}

const DEFAULT_LIMIT = 100;

async function fetchFromMicroCMS<T>(endpoint: string, searchParams?: URLSearchParams): Promise<MicroCMSListResponse<T>> {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  if (searchParams) {
    url.search = searchParams.toString();
  }

  const response = await fetch(url.toString(), {
    headers: {
      'X-MICROCMS-API-KEY': API_KEY!,
    },
    // Next.js fetch caching options。必要に応じて再検討
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`microCMS API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchAllFromMicroCMS<T>(endpoint: string, baseParams?: URLSearchParams): Promise<T[]> {
  const results: T[] = [];
  const baseParamsString = baseParams ? baseParams.toString() : undefined;
  let offset = 0;

  while (true) {
    const params = new URLSearchParams(baseParamsString);
    params.set('limit', DEFAULT_LIMIT.toString());
    params.set('offset', offset.toString());

    const data = await fetchFromMicroCMS<T>(endpoint, params);
    if (data.contents.length === 0) {
      break;
    }

    results.push(...data.contents);
    offset += data.contents.length;

    if (offset >= data.totalCount) {
      break;
    }
  }

  return results;
}

export async function fetchPrefectures(): Promise<PrefectureEntry[]> {
  return fetchAllFromMicroCMS<PrefectureEntry>('prefectures');
}

export async function fetchMunicipalities(prefectureId?: string): Promise<MunicipalityEntry[]> {
  const params = prefectureId ? new URLSearchParams({ filters: `prefecture[equals]${prefectureId}` }) : undefined;
  return fetchAllFromMicroCMS<MunicipalityEntry>('municipalities', params);
}

export async function fetchPrefectureById(prefectureId: string): Promise<PrefectureEntry | null> {
  const params = new URLSearchParams({ filters: `id[equals]${prefectureId}`, limit: '1' });
  const data = await fetchFromMicroCMS<PrefectureEntry>('prefectures', params);
  return data.contents[0] ?? null;
}

export async function fetchMunicipalityById(municipalityId: string): Promise<MunicipalityEntry | null> {
  const params = new URLSearchParams({ filters: `id[equals]${municipalityId}`, limit: '1' });
  const data = await fetchFromMicroCMS<MunicipalityEntry>('municipalities', params);
  return data.contents[0] ?? null;
}

export interface MediaImage {
  url: string;
  height: number;
  width: number;
}

export interface Job {
  id: string;
  title?: string;
  prefecture?: {
    id: string;
    region: string;
    area: string;
  };
  municipality?: {
    id: string;
    name: string;
    prefecture: {
      id: string;
      region: string;
      area: string;
    };
  };
  jobCategory?: {
    id: string;
    name: string;
    category: string;
  };
  companyName?: string;
  jobName?: string;
  catchCopy?: string;
  addressZip?: string;
  addressPrefMuni?: string;
  addressLine?: string;
  addressBuilding?: string;
  employmentType?: string;
  wageType?: string;
  salaryMin?: number;
  salaryMax?: number;
  images?: MediaImage[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
}

export type JobsResponse = MicroCMSListResponse<Job>;

export async function getPrefectureByRegion(regionName: string): Promise<PrefectureEntry | null> {
  const params = new URLSearchParams({ filters: `region[equals]${regionName}` });
  const data = await fetchFromMicroCMS<PrefectureEntry>('prefectures', params);
  return data.contents[0] ?? null;
}

export async function getJobsByPrefectureId(prefectureId: string): Promise<JobsResponse> {
  const params = new URLSearchParams({ filters: `prefecture[equals]${prefectureId}` });
  return fetchFromMicroCMS<Job>('jobs', params);
}

export async function getJobCountByPrefecture(prefectureName: string): Promise<number> {
  const prefecture = await getPrefectureByRegion(prefectureName);
  if (!prefecture) {
    return 0;
  }
  const response = await getJobsByPrefectureId(prefecture.id);
  return response.totalCount;
}

export async function getJobsByMunicipalityId(municipalityId: string): Promise<JobsResponse> {
  const params = new URLSearchParams({ filters: `municipality[equals]${municipalityId}` });
  return fetchFromMicroCMS<Job>('jobs', params);
}

export async function getJobCountByMunicipality(municipalityId: string): Promise<number> {
  const response = await getJobsByMunicipalityId(municipalityId);
  return response.totalCount;
}

export async function getRandomJobsByPrefectureId(prefectureId: string, count: number = 3): Promise<Job[]> {
  const response = await getJobsByPrefectureId(prefectureId);
  if (response.contents.length === 0) {
    return [];
  }
  
  // シャッフルしてランダムに取得
  const shuffled = [...response.contents].sort(() => Math.random() - 0.5);
  
  // 指定件数または利用可能な求人数の少ない方を返す
  return shuffled.slice(0, Math.min(count, shuffled.length));
}