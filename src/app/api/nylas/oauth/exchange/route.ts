import { updateModule } from '@/app/lib/actions';
import { config, createWebhook, nylas } from '@/app/lib/utils/nylas';
import { CalendarIcon } from '@heroicons/react/24/solid';
import { redirect } from 'next/navigation';
import { NextResponse, NextRequest } from 'next/server';
import Nylas, { CodeExchangeRequest } from 'nylas';
import Pusher from 'pusher';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json(
      { message: 'No authorization code returned from Nylas' },
      { status: 400 },
    );
  }

  if (!state) {
    return NextResponse.json(
      { message: 'No state returned from Nylas' },
      { status: 400 },
    );
  }
  let { moduleId } = JSON.parse(state);
  const iModuleId = +moduleId;

  const codeExchangePayload = {
    clientSecret: config.apiKey,
    clientId: config.clientId,
    redirectUri: config.callbackUri(),
    code,
  } as CodeExchangeRequest;

  try {
    const response = await nylas.auth.exchangeCodeForToken(codeExchangePayload);
    const { grantId } = response;

    const calendars = await nylas.calendars.find({
      identifier: grantId,
      calendarId: 'primary',
    });

    const primaryCalendar = calendars.data;

    const webhook = await createWebhook();
    await updateModule(iModuleId, {
      options: {
        grantId,
        primaryCalendar,
        webhookSecret: webhook?.data.webhookSecret,
      },
    });

    triggerPush(iModuleId, grantId, primaryCalendar.name);
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

function triggerPush(iModuleId: number, grantId: string, calendarId: string) {
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

    pusher.trigger(`agenda-${iModuleId}`, 'access-granted', {
      grantId,
      calendarId,
    });
  }
}
