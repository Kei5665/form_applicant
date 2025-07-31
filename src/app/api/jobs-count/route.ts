import { NextRequest, NextResponse } from 'next/server';
import { getJobCountByPrefecture } from '@/lib/microcms';
import { getPrefectureByPostcode, normalizePostcode } from '@/lib/postcode';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postalCode = searchParams.get('postalCode');

    if (!postalCode) {
      return NextResponse.json(
        { error: 'Postal code is required' },
        { status: 400 }
      );
    }

    // Normalize and validate postal code format (7 digits)
    const normalizedPostalCode = normalizePostcode(postalCode);
    if (!/^\d{7}$/.test(normalizedPostalCode)) {
      return NextResponse.json(
        { error: 'Invalid postal code format. Must be 7 digits.' },
        { status: 400 }
      );
    }

    // Get prefecture from postal code
    const prefecture = getPrefectureByPostcode(normalizedPostalCode);
    
    if (!prefecture) {
      return NextResponse.json(
        { error: 'Prefecture not found for this postal code' },
        { status: 404 }
      );
    }

    // Search by prefecture (broader search for better user experience)
    const jobCount = await getJobCountByPrefecture(prefecture);
    const searchMethod = 'prefecture';
    const searchArea = `${prefecture}内`;

    return NextResponse.json({
      postalCode: normalizedPostalCode,
      jobCount,
      searchMethod,
      searchArea,
      message: jobCount > 0 
        ? `${searchArea}で${jobCount}件の求人が見つかりました`
        : searchMethod === 'prefecture' 
          ? `${searchArea}では現在求人がありません`
          : `${searchArea}では現在求人がありません`
    });

  } catch (error) {
    console.error('Error in jobs-count API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job count' },
      { status: 500 }
    );
  }
}