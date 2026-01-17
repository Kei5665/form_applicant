import { NextRequest, NextResponse } from 'next/server';
import { getLatestJobsByCategoryId, getLatestJobsByCategoryIds, getRandomJobsByPrefectureId } from '@/lib/microcms';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prefectureId = searchParams.get('prefectureId');
    const categoryId = searchParams.get('categoryId');
    const categoryIdsParam = searchParams.get('categoryIds');
    const categoryIds = categoryIdsParam
      ? categoryIdsParam.split(',').map((id) => id.trim()).filter(Boolean)
      : [];
    const countParam = searchParams.get('count');
    const count = countParam ? parseInt(countParam, 10) : 3;

    if (!prefectureId && !categoryId && categoryIds.length === 0) {
      return NextResponse.json(
        { error: 'prefectureId, categoryId, or categoryIds is required' },
        { status: 400 }
      );
    }

    const jobs = categoryIds.length > 0
      ? await getLatestJobsByCategoryIds(categoryIds, count)
      : categoryId
        ? await getLatestJobsByCategoryId(categoryId, count)
        : await getRandomJobsByPrefectureId(prefectureId!, count);

    if (jobs.length === 0) {
      return NextResponse.json(
        { error: 'No jobs found for the specified filters' },
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
