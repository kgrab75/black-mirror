import { fetchModule } from '@/app/lib/data';
import { date2UnixEpoch } from '@/app/lib/utils/date';
import { nylas } from '@/app/lib/utils/nylas';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('identifier');
  const calendarId = searchParams.get('calendarId');
  const startParam = searchParams.get('start');
  const endParam = searchParams.get('end');

  if (!identifier) {
    return NextResponse.json({ message: 'Invalid identifier parameter' }, { status: 400 });
  }

  if (!calendarId) {
    return NextResponse.json({ message: 'Invalid calendarId parameter' }, { status: 400 });
  }


  try {
    const now = new Date();
    const inOneWeek = new Date();
    inOneWeek.setDate(now.getDate() + 7);

    const start = startParam ? date2UnixEpoch(new Date(startParam)) : date2UnixEpoch(now);

    const end = endParam ? date2UnixEpoch(new Date(endParam)) : date2UnixEpoch(inOneWeek);

    const events = await nylas.events.list({
      identifier,
      queryParams: {
        calendarId,
        expandRecurring: true,
        limit: 20,
        start,
        end,
      },
    });
    return NextResponse.json({ events: events.data },);
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Network error', error: errorMessage }, { status: 500 });
  }
}

