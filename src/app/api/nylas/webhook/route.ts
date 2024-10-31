import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Pusher from 'pusher';
import { getWebhookSecretByGrantId } from '@/app/lib/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');

  return new NextResponse(challenge, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const grantId = body.data.object.grant_id;
    const webhookSecret = await getWebhookSecretByGrantId(grantId);

    const signature = request.headers.get('x-nylas-signature');
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(JSON.stringify(body));
    const hash = hmac.digest('hex');

    if (hash !== signature) {
      console.warn('Invalid webhook signature');
      return new NextResponse('Invalid signature', { status: 401 });
    }

    triggerPush(grantId);
    return new NextResponse('Notification received', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error handling notification:', error);
    return new NextResponse('Error processing notification', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}

function triggerPush(grantId: string) {
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

    pusher.trigger(`agenda-${grantId}`, 'events-updated', {});
  }
}
