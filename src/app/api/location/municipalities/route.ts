import { NextRequest, NextResponse } from 'next/server';

import { fetchMunicipalities, fetchMunicipalityById } from '@/lib/microcms';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefectureId = searchParams.get('prefectureId') || undefined;
    const municipalityId = searchParams.get('municipalityId');

    if (municipalityId) {
      const municipality = await fetchMunicipalityById(municipalityId);
      return NextResponse.json({ contents: municipality ? [{
        id: municipality.id,
        name: municipality.name,
        prefectureId: municipality.prefecture.id,
      }] : [] });
    }

    const municipalities = await fetchMunicipalities(prefectureId);
    const contents = municipalities.map((item) => ({
      id: item.id,
      name: item.name,
      prefectureId: item.prefecture.id,
    }));
    return NextResponse.json({ contents });
  } catch (error) {
    console.error('Failed to fetch municipalities:', error);
    return NextResponse.json({ error: 'Failed to fetch municipalities' }, { status: 500 });
  }
}

