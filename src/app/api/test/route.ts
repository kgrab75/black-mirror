import { log } from "console";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL('/', request.url);
  //url.port = process.env.PORT || '';
  url.hostname = process.env.BASE_HOSTNAME || url.hostname;
  console.log(url);

  return NextResponse.redirect(url);
}