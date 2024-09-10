import { updateModule } from "@/app/lib/actions";
import { config, nylas } from "@/app/lib/utils/nylas";
import { redirect } from "next/navigation";
import { NextResponse, NextRequest } from "next/server";
import Nylas, { CodeExchangeRequest } from "nylas";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ message: 'No authorization code returned from Nylas' }, { status: 400 });
  }

  if (!state) {
    return NextResponse.json({ message: 'No state returned from Nylas' }, { status: 400 });
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
      calendarId: "primary",
    });

    const primaryCalendar = calendars.data;

    await updateModule(iModuleId, { options: { grantId, primaryCalendar } });

    const url = new URL('/', process.env.BASE_URL);

    return NextResponse.redirect(url);
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Network error', error: errorMessage }, { status: 500 });
  }
}