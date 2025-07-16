import { NextRequest, NextResponse } from 'next/server';
import { poznamkyDb } from '@/lib/database';

export async function GET() {
  try {
    const poznamky = await poznamkyDb.getAll();
    
    // Parse the JSON data from each record
    const parsedPoznamky = poznamky.map((record: unknown) => {
      try {
        if (typeof record === 'object' && record !== null && 'data' in record) {
          const recordObj = record as { data: string };
          if (typeof recordObj.data === 'string') {
            return JSON.parse(recordObj.data);
          }
          return recordObj.data || record;
        }
        return record; // If record is the data itself
      } catch (error) {
        console.error('Chyba při parsování poznámky:', error);
        return null;
      }
    }).filter((poznamka: unknown) => poznamka !== null);

    return NextResponse.json(parsedPoznamky);
  } catch (error) {
    console.error('Chyba při načítání poznámek:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání poznámek' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const poznamka = await request.json();
    
    if (!poznamka.id || !poznamka.poznamka) {
      return NextResponse.json(
        { error: 'Neplatná struktura poznámky' },
        { status: 400 }
      );
    }

    // Kontrola, jestli poznámka už existuje
    const existing = await poznamkyDb.getById(poznamka.id);
    
    if (existing) {
      // Aktualizace existující poznámky
      await poznamkyDb.update(poznamka.id, poznamka);
    } else {
      // Vložení nové poznámky
      await poznamkyDb.create(poznamka);
    }

    return NextResponse.json({ success: true, id: poznamka.id });
  } catch (error) {
    console.error('Chyba při ukládání poznámky:', error);
    return NextResponse.json(
      { error: 'Chyba při ukládání poznámky' },
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
        { error: 'ID poznámky je povinné' },
        { status: 400 }
      );
    }

    await poznamkyDb.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chyba při mazání poznámky:', error);
    return NextResponse.json(
      { error: 'Chyba při mazání poznámky' },
      { status: 500 }
    );
  }
}
