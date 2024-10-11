import Nylas from 'nylas';

if (process.env.NYLAS_CLIENT_ID === undefined) {
  throw new Error('NYLAS_CLIENT_ID is undefined');
}

if (process.env.BASE_URL === undefined) {
  throw new Error('BASE_URL is undefined');
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
    const url = new URL('/api/nylas/oauth/exchange', process.env.BASE_URL);
    return url.toString();
  },
  apiKey: process.env.NYLAS_API_KEY,
  apiUri: process.env.NYLAS_API_URI,
};

export const nylas = new Nylas({
  apiKey: config.apiKey,
  apiUri: config.apiUri,
});
