import fs from 'fs';
import path from 'path';

interface PostcodeData {
  postal_code: number;
  prefecture: string;
}

let postcodeMap: Map<string, string> | null = null;

export function loadPostcodeData(): Map<string, string> {
  if (postcodeMap) {
    return postcodeMap;
  }

  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'ken_all.json');
    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    const data: PostcodeData[] = JSON.parse(jsonData);
    
    postcodeMap = new Map();
    
    data.forEach(item => {
      const postcodeStr = item.postal_code.toString().padStart(7, '0');
      postcodeMap!.set(postcodeStr, item.prefecture);
    });
    
    console.log(`Loaded ${postcodeMap.size} postal codes`);
    return postcodeMap;
  } catch (error) {
    console.error('Failed to load postcode data:', error);
    return new Map();
  }
}

export function getPrefectureByPostcode(postcode: string): string | null {
  const map = loadPostcodeData();
  
  if (!/^\d{7}$/.test(postcode)) {
    return null;
  }
  
  return map.get(postcode) || null;
}

export function normalizePostcode(postcode: string): string {
  return postcode.replace(/[-－ー\s]/g, '').padStart(7, '0');
}