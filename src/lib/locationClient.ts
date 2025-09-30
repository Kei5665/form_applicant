const prefectureCache = new Map<string, string>();
const municipalityCache = new Map<string, string>();

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

export async function fetchPrefectureName(prefectureId: string): Promise<string> {
  if (prefectureCache.has(prefectureId)) {
    return prefectureCache.get(prefectureId) ?? '';
  }

  const data = await fetchJSON<{ contents: { id: string; region: string }[] }>('/api/location/prefectures');
  data.contents.forEach((item) => {
    prefectureCache.set(item.id, item.region);
  });

  return prefectureCache.get(prefectureId) ?? '';
}

export async function fetchMunicipalityName(municipalityId: string): Promise<string> {
  if (municipalityCache.has(municipalityId)) {
    return municipalityCache.get(municipalityId) ?? '';
  }

  const data = await fetchJSON<{ contents: { id: string; name: string }[] }>(`/api/location/municipalities?municipalityId=${municipalityId}`);
  data.contents.forEach((item) => {
    municipalityCache.set(item.id, item.name);
  });

  return municipalityCache.get(municipalityId) ?? '';
}

