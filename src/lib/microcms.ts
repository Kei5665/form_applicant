// microCMS API client
const BASE_URL = `https://${process.env.MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1`;
const API_KEY = process.env.MICROCMS_API_KEY;

if (!process.env.MICROCMS_SERVICE_DOMAIN || !process.env.MICROCMS_API_KEY) {
  throw new Error('microCMS environment variables are not set');
}

// Job data type based on microCMS schema
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
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
}

// API response type
export interface JobsResponse {
  contents: Job[];
  totalCount: number;
  offset: number;
  limit: number;
}

// Fetch jobs by postal code
export async function getJobsByPostalCode(postalCode: string): Promise<JobsResponse> {
  const url = `${BASE_URL}/jobs?filters=addressZip[equals]${postalCode}`;
  
  const response = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error(`microCMS API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get job count by postal code
export async function getJobCountByPostalCode(postalCode: string): Promise<number> {
  try {
    const response = await getJobsByPostalCode(postalCode);
    return response.totalCount;
  } catch (error) {
    console.error('Error fetching job count:', error);
    throw error;
  }
}

// Prefecture data type
export interface Prefecture {
  id: string;
  region: string;
  area: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
}

// API response type for prefectures
export interface PrefecturesResponse {
  contents: Prefecture[];
  totalCount: number;
  offset: number;
  limit: number;
}

// Fetch prefecture by region name
export async function getPrefectureByRegion(regionName: string): Promise<Prefecture | null> {
  const url = `${BASE_URL}/prefectures?filters=region[equals]${encodeURIComponent(regionName)}`;
  
  const response = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error(`microCMS API error: ${response.status} ${response.statusText}`);
  }

  const data: PrefecturesResponse = await response.json();
  return data.contents.length > 0 ? data.contents[0] : null;
}

// Fetch jobs by prefecture ID
export async function getJobsByPrefectureId(prefectureId: string): Promise<JobsResponse> {
  const url = `${BASE_URL}/jobs?filters=prefecture[equals]${prefectureId}`;
  
  const response = await fetch(url, {
    headers: {
      'X-MICROCMS-API-KEY': API_KEY!,
    },
  });

  if (!response.ok) {
    throw new Error(`microCMS API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get job count by prefecture (2-step process)
export async function getJobCountByPrefecture(prefectureName: string): Promise<number> {
  try {
    // Step 1: Get prefecture ID by region name
    const prefecture = await getPrefectureByRegion(prefectureName);
    if (!prefecture) {
      return 0;
    }

    // Step 2: Get jobs by prefecture ID
    const response = await getJobsByPrefectureId(prefecture.id);
    return response.totalCount;
  } catch (error) {
    console.error('Error fetching job count by prefecture:', error);
    throw error;
  }
}