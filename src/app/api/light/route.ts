import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const room = searchParams.get('room');

  if (!state) {
    return NextResponse.json({ message: 'Invalid state parameter' }, { status: 400 });
  }

  if (!room) {
    return NextResponse.json({ message: 'Invalid room parameter' }, { status: 400 });
  }

  const id = room2id(room);

  const baseUrl = process.env.BASE_URL_DOMO;
  const username = process.env.USERNAME_DOMO;
  const password = process.env.PASSWORD_DOMO;

  if (!baseUrl || !username || !password) {
    return NextResponse.json({ message: 'Missing environment variables' }, { status: 500 });
  }

  const url = new URL('/action.php', baseUrl);
  url.searchParams.append('engine', `id-${id}`);
  url.searchParams.append('action', 'CHANGE_STATE');
  url.searchParams.append('code', `${id === 7 ? -1 : id}`);
  url.searchParams.append('state', state);

  const headers = new Headers();
  headers.set('Authorization', 'Basic ' + btoa(username + ':' + password));

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: headers,
    });

    if (response.ok) {
      const data = await response.text();
      return NextResponse.json({ message: `Light turned ${state}`, data }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Error toggling the light', error: response.statusText }, { status: response.status });
    }
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Network error', error: errorMessage }, { status: 500 });
  }
}

const room2id = (room: string) => {
  switch (room) {
  case 'bureau':
    return 6;
  case 'chambre':
    return 1;
  case 'cuisine':
    return 3;
  case 'salle de bain':
    return 4;
  case 'toilettes':
    return 5;
  case 'salon':
    return 2;
  case 'all':
    return 7;
  default:
    return 0;
  }
};