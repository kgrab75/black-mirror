import { config, nylas } from '@/app/lib/utils/nylas';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get('moduleId');

  if (!moduleId) {
    return NextResponse.json({ message: 'Invalid moduleId parameter' }, { status: 400 });
  }

  const authUrl = nylas.auth.urlForOAuth2({
    clientId: config.clientId,
    redirectUri: config.callbackUri,
    state: JSON.stringify({ moduleId })
  });

  return NextResponse.json({ authUrl }, { status: 200 });
}

