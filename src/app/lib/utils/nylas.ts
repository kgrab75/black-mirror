import Nylas, { WebhookTriggers } from 'nylas';

if (process.env.NYLAS_CLIENT_ID === undefined) {
  throw new Error('NYLAS_CLIENT_ID is undefined');
}

if (process.env.REAL_BASE_URL === undefined) {
  throw new Error('REAL_BASE_URL is undefined');
}

if (process.env.NYLAS_API_KEY === undefined) {
  throw new Error('NYLAS_API_KEY is undefined');
}

if (process.env.NYLAS_API_URI === undefined) {
  throw new Error('NYLAS_API_URI is undefined');
}

export const config = {
  clientId: process.env.NYLAS_CLIENT_ID,
  callbackUri: () => {
    const url = new URL('/api/nylas/oauth/exchange', process.env.REAL_BASE_URL);
    return url.toString();
  },
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI,
};

export const nylas = new Nylas({
  apiKey: config.apiKey,
  apiUri: config.apiUri,
});

export const createWebhook = async () => {
  if (process.env.NYLAS_WEBHOOK_URL === undefined) {
    throw new Error('NYLAS_WEBHOOK_URL is undefined');
  }
  if (process.env.NYLAS_WEBHOOK_EMAIL === undefined) {
    throw new Error('NYLAS_WEBHOOK_EMAIL is undefined');
  }
  try {
    const webhook = await nylas.webhooks.create({
      requestBody: {
        triggerTypes: [
          WebhookTriggers.EventCreated,
          WebhookTriggers.EventDeleted,
          WebhookTriggers.EventUpdated,
        ],
        webhookUrl: process.env.NYLAS_WEBHOOK_URL,
        description: 'My first webhook',
        notificationEmailAddresses: [process.env.NYLAS_WEBHOOK_EMAIL],
      },
    });

    return webhook;
  } catch (error) {
    console.error('Error creating webhook:', error);
  }
};
