import { NextResponse } from 'next/server';
import { getCoupangStep1Options } from './options';

export async function GET() {
  const data = await getCoupangStep1Options();
  return NextResponse.json(data, { status: 200 });
}

