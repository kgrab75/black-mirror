import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get('moduleId');

  if (!moduleId) {
    return NextResponse.json(
      { message: 'Invalid moduleId parameter' },
      { status: 400 },
    );
  }

  const clientId = process.env.WITHINGS_CLIENT_ID;
  const state = JSON.stringify({ moduleId });
  const redirectURI = new URL(
    `/api/withings/exchange?grantType=authorization_code`,
    process.env.REAL_BASE_URL,
  ).toString();

  const authUrl = `https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id=${clientId}&scope=user.info,user.metrics,user.activity&redirect_uri=${redirectURI}&state=${state}`;

  return NextResponse.redirect(authUrl);
}
