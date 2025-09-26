const ZIPCLOUD_ENDPOINT = 'https://zipcloud.ibsnet.co.jp/api/search';

export type ZipcloudAddress = {
  zipcode: string;
  prefcode: string;
  address1: string;
  address2: string;
  address3: string;
  kana1: string;
  kana2: string;
  kana3: string;
};

export type ZipcloudResponse = {
  status: number;
  message: string | null;
  results: ZipcloudAddress[] | null;
};

export type ZipcloudLocation = {
  prefectureName?: string;
  municipalityName?: string;
  townName?: string;
};

export async function fetchAddressByZipcode(postalCode: string): Promise<ZipcloudLocation | null> {
  const normalized = postalCode.replace(/[^0-9]/g, '');
  if (normalized.length !== 7) {
    return null;
  }

  const query = new URLSearchParams({ zipcode: normalized, limit: '1' });
  try {
    const response = await fetch(`${ZIPCLOUD_ENDPOINT}?${query.toString()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('ZipCloud API request failed with status', response.status);
      return null;
    }

    const data = (await response.json()) as ZipcloudResponse;
    if (data.status !== 200 || !data.results || data.results.length === 0) {
      if (data.message) {
        console.warn('ZipCloud API responded with message:', data.message);
      }
      return null;
    }

    const { address1, address2, address3 } = data.results[0];
    return {
      prefectureName: address1?.trim() || undefined,
      municipalityName: address2?.trim() || undefined,
      townName: address3?.trim() || undefined,
    };
  } catch (error) {
    console.error('ZipCloud API request threw an error:', error);
    return null;
  }
}
