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