import { fetchModule } from '@/app/lib/data';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { WeightProps } from '@/app/lib/definitions';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const moduleId = +(searchParams.get('moduleId') || 0);
  const type = searchParams.get('type');

  try {
    const response = await getMeasures(type, moduleId);

    const measures = response.data.body.measuregrps;

    return NextResponse.json({ measures });
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { message: 'Network error', error: errorMessage },
      { status: 500 },
    );
  }
}

async function getMeasures(
  type: string | null,
  moduleId: number,
  toRefresh = true,
) {
  const myModule = (await fetchModule(moduleId)) as WeightProps;
  const config = {
    headers: { Authorization: `Bearer ${myModule.options.access_token}` },
  };

  const measureGetmeasPayload = {
    action: 'getmeas',
    meastype: type,
  };
  const response = await axios.post(
    'https://wbsapi.withings.net/measure',
    measureGetmeasPayload,
    config,
  );
  const status = response.data.status;

  if (status === 401 && toRefresh) {
    const state = JSON.stringify({ moduleId: myModule.id });
    const exchangeURL = `${process.env.REAL_BASE_URL}/api/withings/exchange?grantType=refresh_token&state=${state}&refreshToken=${myModule.options.refresh_token}`;

    await fetch(exchangeURL);

    return getMeasures(type, moduleId, false);
  }
  return response;
}
