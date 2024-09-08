import { NextRequest, NextResponse } from 'next/server';
import bringApi from 'bring-shopping';

export async function GET() {

  const bring = new bringApi({
    mail: 'kgrabiner75@gmail.com',
    password: 'ZM94qgTcYS$B#6C',
  });

  try {
    await bring.login();
    const translations = await bring.loadTranslations('fr-FR');
    const { lists } = await bring.loadLists();

    const listsWithItems = await Promise.all(lists.map(async list => {
      const items = await bring.getItems(list.listUuid);

      const translatatedToPurchaseItems = items.purchase.map((item) => {
        return {
          specification: item.specification,
          name: translations[item.name] || item.name,
        };
      });
      return { ...list, items: translatatedToPurchaseItems }
    }));

    return NextResponse.json({ lists: listsWithItems }, { status: 200 });

  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(`Error on Login: ${errorMessage}`);
    return NextResponse.json({ message: 'Network error', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const listUuid = searchParams.get('listUuid');
  const itemName = searchParams.get('itemName');

  if (!listUuid) {
    return NextResponse.json({ message: 'Invalid listUuid parameter' }, { status: 400 });
  }

  if (!itemName) {
    return NextResponse.json({ message: 'Invalid itemName parameter' }, { status: 400 });
  }

  const bring = new bringApi({
    mail: 'kgrabiner75@gmail.com',
    password: 'ZM94qgTcYS$B#6C',
  });

  try {
    await bring.login();
    const saved = await bring.saveItem(listUuid, itemName, '')

    return NextResponse.json({ saved }, { status: 200 });

  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(`Error on Login: ${errorMessage}`);
    return NextResponse.json({ message: 'Network error', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const listUuid = searchParams.get('listUuid');
  const itemName = searchParams.get('itemName');

  if (!listUuid) {
    return NextResponse.json({ message: 'Invalid listUuid parameter' }, { status: 400 });
  }

  if (!itemName) {
    return NextResponse.json({ message: 'Invalid itemName parameter' }, { status: 400 });
  }

  const bring = new bringApi({
    mail: 'kgrabiner75@gmail.com',
    password: 'ZM94qgTcYS$B#6C',
  });

  try {
    await bring.login();
    const deleled = await bring.moveToRecentList(listUuid, itemName);

    return NextResponse.json({ deleled }, { status: 200 });

  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error(`Error on Login: ${errorMessage}`);
    return NextResponse.json({ message: 'Network error', error: errorMessage }, { status: 500 });
  }
}