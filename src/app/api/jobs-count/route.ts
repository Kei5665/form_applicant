import { NextRequest, NextResponse } from 'next/server';
import { getJobCountByPostalCode } from '@/lib/microcms';

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

    // Validate postal code format (7 digits)
    if (!/^\d{7}$/.test(postalCode)) {
      return NextResponse.json(
        { error: 'Invalid postal code format. Must be 7 digits.' },
        { status: 400 }
      );
    }

    const jobCount = await getJobCountByPostalCode(postalCode);

    return NextResponse.json({
      postalCode,
      jobCount,
      message: jobCount > 0 
        ? `${postalCode}エリアで${jobCount}件の求人が見つかりました`
        : `${postalCode}エリアでは現在求人がありません`
    });

  } catch (error) {
    console.error('Error in jobs-count API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job count' },
      { status: 500 }
    );
  }
}