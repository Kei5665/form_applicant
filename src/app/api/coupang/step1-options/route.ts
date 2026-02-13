import { NextResponse } from 'next/server';
import { getCoupangStep1Options } from './options';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getCoupangStep1Options();
  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
