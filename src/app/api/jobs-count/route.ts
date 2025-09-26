import { NextRequest, NextResponse } from 'next/server';

import { getJobCountByMunicipality, getJobCountByPostalCode, getJobsByPrefectureId, fetchPrefectureById, fetchMunicipalityById } from '@/lib/microcms';
import { normalizePostcode } from '@/lib/postcode';
import { fetchAddressByZipcode } from '@/lib/zipcloud';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postalCode = searchParams.get('postalCode');
    const prefectureId = searchParams.get('prefectureId');
    const municipalityId = searchParams.get('municipalityId');

    if (municipalityId) {
      const municipality = await fetchMunicipalityById(municipalityId);
      if (!municipality) {
        return NextResponse.json({ error: '市区町村の取得に失敗しました' }, { status: 404 });
      }
      const jobCount = await getJobCountByMunicipality(municipalityId);
      const prefectureName = municipality.prefecture.region;
      const municipalityName = municipality.name;

      return NextResponse.json({
        jobCount,
        searchMethod: 'municipality',
        searchArea: `${prefectureName} ${municipalityName}`,
        prefectureName,
        municipalityName,
        message:
          jobCount > 0
            ? `${prefectureName} ${municipalityName}で${jobCount}件の求人が見つかりました`
            : `${prefectureName} ${municipalityName}では現在求人がありません`,
      });
    }

    if (prefectureId) {
      const prefecture = await fetchPrefectureById(prefectureId);
      if (!prefecture) {
        return NextResponse.json({ error: '都道府県の取得に失敗しました' }, { status: 404 });
      }
      const response = await getJobsByPrefectureId(prefectureId);
      const jobCount = response.totalCount;
      const searchArea = `${prefecture.region}内`;

      return NextResponse.json({
        jobCount,
        searchMethod: 'prefecture',
        searchArea,
        prefectureName: prefecture.region,
        municipalityName: '',
        message:
          jobCount > 0
            ? `${searchArea}で${jobCount}件の求人が見つかりました`
            : `${searchArea}では現在求人がありません`,
      });
    }

    if (!postalCode) {
      return NextResponse.json({ error: 'postalCode または地域IDが必要です' }, { status: 400 });
    }

    const normalizedPostalCode = normalizePostcode(postalCode);
    if (!/^[0-9]{7}$/.test(normalizedPostalCode)) {
      return NextResponse.json({ error: '郵便番号は7桁で指定してください' }, { status: 400 });
    }

    const jobCount = await getJobCountByPostalCode(normalizedPostalCode);
    const searchArea = `郵便番号 ${normalizedPostalCode}`;

    const location = await fetchAddressByZipcode(normalizedPostalCode);

    return NextResponse.json({
      postalCode: normalizedPostalCode,
      jobCount,
      searchMethod: 'postal_code',
      searchArea,
      prefectureName: location?.prefectureName ?? '',
      municipalityName: location?.municipalityName ?? '',
      townName: location?.townName ?? '',
      message:
        jobCount > 0
          ? `${searchArea} のエリアで${jobCount}件の求人が見つかりました`
          : `${searchArea} のエリアでは現在求人がありません`,
    });
  } catch (error) {
    console.error('Error in jobs-count API:', error);
    return NextResponse.json({ error: 'Failed to fetch job count' }, { status: 500 });
  }
}