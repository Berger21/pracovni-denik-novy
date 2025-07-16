import { NextRequest, NextResponse } from 'next/server';
import { denikyDb } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filterDatum = searchParams.get('datum');
    const filterSmena = searchParams.get('smena');
    const filterTechnologie = searchParams.get('technologie');

    const filters = {
      ...(filterDatum && { datum: filterDatum }),
      ...(filterSmena && { smena: filterSmena }),
      ...(filterTechnologie && { technologie: filterTechnologie })
    };
    
    const deniky = await denikyDb.getAll(Object.keys(filters).length > 0 ? filters : undefined);
    
    // Parse the JSON data from each record  
    const parsedDeniky = deniky.map((record: { data?: string } | unknown) => {
      try {
        if (record && typeof record === 'object' && 'data' in record) {
          const typedRecord = record as { data?: string };
          if (typeof typedRecord.data === 'string') {
            return JSON.parse(typedRecord.data);
          }
          return typedRecord.data || record;
        }
        return record; // If data is already parsed or record is the data itself
      } catch (error) {
        console.error('Chyba při parsování deníku:', error);
        return null;
      }
    }).filter((denik: unknown) => denik !== null);

    return NextResponse.json(parsedDeniky);
  } catch (error) {
    console.error('Chyba při načítání deníků:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání deníků' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const denik = await request.json();
    
    if (!denik.id || !denik.zakladniUdaje) {
      return NextResponse.json(
        { error: 'Neplatná struktura deníku' },
        { status: 400 }
      );
    }

    // Kontrola, jestli deník už existuje
    const existing = await denikyDb.getById(denik.id);
    
    if (existing) {
      // Aktualizace existujícího deníku
      await denikyDb.update(denik.id, denik);
    } else {
      // Vložení nového deníku
      await denikyDb.create(denik);
    }

    return NextResponse.json({ success: true, id: denik.id });
  } catch (error) {
    console.error('Chyba při ukládání deníku:', error);
    return NextResponse.json(
      { error: 'Chyba při ukládání deníku' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID deníku je povinné' },
        { status: 400 }
      );
    }

    await denikyDb.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chyba při mazání deníku:', error);
    return NextResponse.json(
      { error: 'Chyba při mazání deníku' },
      { status: 500 }
    );
  }
}
