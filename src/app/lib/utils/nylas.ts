import Nylas from "nylas";
import { getEnvVariable } from "@/app/lib/utils";

export const config = {
  clientId: getEnvVariable('NYLAS_CLIENT_ID'),
  callbackUri: "http://localhost:3000/api/nylas/oauth/exchange",
  apiKey: getEnvVariable('NYLAS_API_KEY'),
  apiUri: getEnvVariable('NYLAS_API_URI'),
};

export const nylas = new Nylas({
  apiKey: config.apiKey,
  apiUri: config.apiUri,
});

