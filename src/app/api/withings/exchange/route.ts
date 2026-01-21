import { updateModule } from '@/app/lib/actions';
import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';
import Pusher from 'pusher';

function triggerPush(access_token?: string) {
  if (
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_APP_KEY &&
    process.env.PUSHER_APP_SECRET
  ) {
    const pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_APP_KEY,
      secret: process.env.PUSHER_APP_SECRET,
      cluster: 'eu',
      useTLS: true,
    });

    pusher.trigger('black-mirror', 'token-loaded', {
      access_token,
    });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const grantType = searchParams.get('grantType');
  const state = searchParams.get('state');

  if (!grantType) {
    return NextResponse.json(
      { message: 'No grantType returned from Withings' },
      { status: 400 },
    );
  }

  if (!state) {
    return NextResponse.json(
      { message: 'No state returned from Withings' },
      { status: 400 },
    );
  }

  let { moduleId } = JSON.parse(state);
  const iModuleId = +moduleId;

  let exchangePayload;

  if (grantType === 'authorization_code') {
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { message: 'No authorization code returned from Withings' },
        { status: 400 },
      );
    }

    const redirectURI = new URL(
      `/api/withings/exchange?grantType=authorization_code`,
      process.env.REAL_BASE_URL,
    ).toString();

    exchangePayload = {
      action: 'requesttoken',
      client_id: process.env.WITHINGS_CLIENT_ID,
      client_secret: process.env.WITHINGS_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectURI,
    };
  } else {
    const refreshToken = searchParams.get('refreshToken');

    if (!refreshToken) {
      return NextResponse.json(
        { message: 'No refreshToken code returned from Withings' },
        { status: 400 },
      );
    }
    exchangePayload = {
      action: 'requesttoken',
      client_id: process.env.WITHINGS_CLIENT_ID,
      client_secret: process.env.WITHINGS_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };
  }

  try {
    const response = await axios.post(
      'https://wbsapi.withings.net/v2/oauth2',
      exchangePayload,
    );

    if (response.data.status === 503) {
      await updateModule(iModuleId, {
        options: {},
      });
      triggerPush();
      return NextResponse.json(
        { message: 'Tokens need to be reloaded' },
        { status: 200 },
      );
    }

    const {
      access_token,
      refresh_token,
    }: { access_token: string; refresh_token: string } = response.data.body;

    if (access_token && refresh_token) {
      await updateModule(iModuleId, {
        options: { access_token, refresh_token },
      });
      triggerPush(access_token);
    }

    const htmlContent = `
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Fermer la fenêtre</title>
            </head>
            <body>
              <p>Vous pouvez fermer cette fenêtre.</p>
            </body>
          </html>
        `;

    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
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
