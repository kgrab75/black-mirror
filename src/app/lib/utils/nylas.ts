import Nylas from "nylas";
import { getEnvVariable } from "@/app/lib/utils";
import { NextRequest } from "next/server";

export const config = {
  clientId: getEnvVariable('NYLAS_CLIENT_ID'),
  callbackUri: (request: NextRequest) => {
    const url = new URL('/api/nylas/oauth/exchange', request.url);
    url.hostname = process.env.BASE_HOSTNAME || url.hostname;
    return url.toString();
  },
  apiKey: getEnvVariable('NYLAS_API_KEY'),
  apiUri: getEnvVariable('NYLAS_API_URI'),
};

export const nylas = new Nylas({
  apiKey: config.apiKey,
  apiUri: config.apiUri,
});

