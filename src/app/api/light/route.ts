import { NextRequest, NextResponse } from 'next/server';

type LightTarget =
  | { kind: 'legacyDomo'; id: number }
  | { kind: 'shellyGen3'; host: string; switchId: number };

const normalizeRoom = (room: string) =>
  room
    .trim()
    .toLowerCase()
    // enlève les accents pour matcher "salle de bain" / "salle de bains" etc
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

// 🔧 Mapping “pièce -> cible”
// Ajoute ici les futures pièces Shelly.
const ROOM_TARGETS: Record<string, LightTarget> = {
  // Shelly Gen3
  'bureau': { kind: 'shellyGen3', host: process.env.SHELLY_BUREAU_HOST ?? '192.168.1.52', switchId: 0 },
  'salle de bain': { kind: 'shellyGen3', host: process.env.SHELLY_SALLE_DE_BAIN_HOST ?? '192.168.1.54', switchId: 0 },

  // Legacy (action.php)
  'chambre': { kind: 'legacyDomo', id: 1 },
  'salon': { kind: 'legacyDomo', id: 2 },
  'cuisine': { kind: 'legacyDomo', id: 3 },
  'toilettes': { kind: 'legacyDomo', id: 5 },

  // "all" est géré à part plus bas
};

const ROOM_ALIASES: Record<string, string> = {
  // quelques alias pratiques (optionnel)
  'sdb': 'salle de bain',
  'salle de bains': 'salle de bain',
  'wc': 'toilettes',
};

const getTargetForRoom = (roomRaw: string): LightTarget | null => {
  const room = normalizeRoom(roomRaw);
  const canonical = ROOM_ALIASES[room] ?? room;
  return ROOM_TARGETS[canonical] ?? null;
};

const basicAuthHeaderValue = (username: string, password: string) =>
  'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

async function setLegacyDomoLight(state: 'on' | 'off', id: number) {
  const baseUrl = process.env.BASE_URL_DOMO;
  const username = process.env.USERNAME_DOMO;
  const password = process.env.PASSWORD_DOMO;

  if (!baseUrl || !username || !password) {
    throw new Error('Missing BASE_URL_DOMO / USERNAME_DOMO / PASSWORD_DOMO env vars');
  }

  const url = new URL('/action.php', baseUrl);
  url.searchParams.append('engine', `id-${id}`);
  url.searchParams.append('action', 'CHANGE_STATE');
  url.searchParams.append('code', `${id === 7 ? -1 : id}`);
  url.searchParams.append('state', state);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Authorization: basicAuthHeaderValue(username, password) },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Legacy domo error (${res.status}) ${res.statusText} - ${text}`);
  }
  return text;
}

async function setShellyGen3Switch(state: 'on' | 'off', host: string, switchId: number) {
  const on = state === 'on';
  const url = `http://${host}/rpc/Switch.Set?id=${switchId}&on=${on}`;

  const res = await fetch(url, { method: 'GET' });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Shelly error (${res.status}) ${res.statusText} - ${text}`);
  }

  // Shelly renvoie du JSON en texte : on tente de parser, sinon on renvoie brut
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const room = searchParams.get('room');

  if (state !== 'on' && state !== 'off') {
    return NextResponse.json({ message: 'Invalid state parameter (expected on|off)' }, { status: 400 });
  }
  if (!room) {
    return NextResponse.json({ message: 'Invalid room parameter' }, { status: 400 });
  }

  // Cas spécial "all"
  if (normalizeRoom(room) === 'all') {
    const results: Record<string, unknown> = {};

    // 1) Legacy: ton "all" historique (id=7)
    try {
      results.legacy_all = await setLegacyDomoLight(state, 7);
    } catch (e) {
      results.legacy_all_error = e instanceof Error ? e.message : String(e);
    }

    // 2) Shelly: on applique à tous les Shelly déclarés dans ROOM_TARGETS
    const shellyRooms = Object.entries(ROOM_TARGETS)
      .filter(([, t]) => t.kind === 'shellyGen3')
      .map(([roomName, t]) => ({ roomName, t: t as Extract<LightTarget, { kind: 'shellyGen3' }> }));

    await Promise.all(
      shellyRooms.map(async ({ roomName, t }) => {
        try {
          results[`shelly_${roomName}`] = await setShellyGen3Switch(state, t.host, t.switchId);
        } catch (e) {
          results[`shelly_${roomName}_error`] = e instanceof Error ? e.message : String(e);
        }
      })
    );

    return NextResponse.json({ message: `Lights turned ${state}`, results }, { status: 200 });
  }

  const target = getTargetForRoom(room);
  if (!target) {
    return NextResponse.json(
      { message: `Unknown room: ${room}` },
      { status: 404 }
    );
  }

  try {
    if (target.kind === 'legacyDomo') {
      const data = await setLegacyDomoLight(state, target.id);
      return NextResponse.json({ message: `Light turned ${state}`, provider: 'legacyDomo', data }, { status: 200 });
    }

    if (target.kind === 'shellyGen3') {
      const data = await setShellyGen3Switch(state, target.host, target.switchId);
      return NextResponse.json({ message: `Light turned ${state}`, provider: 'shellyGen3', data }, { status: 200 });
    }

    return NextResponse.json({ message: 'Unsupported target' }, { status: 500 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error toggling the light', error: errorMessage }, { status: 500 });
  }
}
