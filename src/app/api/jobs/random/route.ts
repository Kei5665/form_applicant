import { NextRequest, NextResponse } from 'next/server';
import { getRandomJobsByPrefectureId } from '@/lib/microcms';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prefectureId = searchParams.get('prefectureId');
    const countParam = searchParams.get('count');
    const count = countParam ? parseInt(countParam, 10) : 3;

    if (!prefectureId) {
      return NextResponse.json(
        { error: 'prefectureId is required' },
        { status: 400 }
      );
    }

    const jobs = await getRandomJobsByPrefectureId(prefectureId, count);

    if (jobs.length === 0) {
      return NextResponse.json(
        { error: 'No jobs found for the specified prefecture' },
        { status: 404 }
      );
    }

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Error fetching random jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

