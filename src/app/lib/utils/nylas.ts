import Nylas from "nylas";
import { getEnvVariable } from "@/app/lib/utils";

export const config = {
  clientId: process.env.NYLAS_CLIENT_ID,
  callbackUri: () => {
    const url = new URL('/api/nylas/oauth/exchange', process.env.BASE_URL);
    return url.toString();
  },
  apiKey: getEnvVariable('NYLAS_API_KEY'),
  apiUri: getEnvVariable('NYLAS_API_URI'),
};

export const nylas = new Nylas({
  apiKey: config.apiKey,
  apiUri: config.apiUri,
});

