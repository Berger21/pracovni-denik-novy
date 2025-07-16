// @ts-expect-error mssql module may have type issues
import sql from 'mssql';
import { NextRequest, NextResponse } from 'next/server';

// Zkusíme více konfigurací pro Windows autentizaci
const baseConfig = {
  server: process.env.DB_SERVER || '192.168.1.100',
  database: process.env.DB_DATABASE || 'ROZBOR',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000,
    useUTC: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Primární konfigurace - plný doménový uživatel
const config = {
  ...baseConfig,
  user: process.env.DB_USER || 'TSGAV\\r.ovcacik',
  password: process.env.DB_PASSWORD || 'EE4wiege1988'
};

// Alternativní konfigurace - pouze uživatel s doménou
const configAlt = {
  ...baseConfig,
  user: 'r.ovcacik',
  password: process.env.DB_PASSWORD || 'EE4wiege1988',
  domain: 'TSGAV'
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sarze = searchParams.get('sarze');
    
    console.log('API: Požadavek na šarži:', sarze);
    console.log('API: Konfigurace DB:', {
      server: config.server,
      database: config.database,
      user: config.user,
      userLength: config.user?.length,
      userBytes: Buffer.from(config.user || '').toString('hex')
    });
    
    if (!sarze) {
      console.log('API: Chybí parametr šarže');
      return NextResponse.json({ 
        error: 'Parametr šarže je povinný' 
      }, { status: 400 });
    }

    // Mock data pro testování - vrátit testovací data pro některé šarže
    if (sarze.toLowerCase() === 'test123' || sarze.toLowerCase() === 'test') {
      console.log('API: Vracím mock data pro testovací šarži');
      return NextResponse.json({
        sarze: sarze,
        zakazka: 'VZ-2025-100-005941/001',
        nazev_zbozi: 'Testovací výrobek - součást motoru',
        odberatel: 'ŠKODA AUTO a.s.',
        technologie: 'VAKUUM',
        kod_zbozi: 'VYR-TEST-001'
      });
    }

    // Pokud není testovací šarže, zkusíme databázi
    console.log('API: Připojuji se k databázi...');
    let pool;
    
    try {
      // Zkusíme hlavní konfiguraci
      console.log('API: Zkouším hlavní konfiguraci s doménovým uživatelem...');
      try {
        pool = await sql.connect(config);
        console.log('API: Připojení k databázi úspěšné (hlavní konfigurace)');
      } catch (primaryError) {
        console.log('API: Hlavní konfigurace selhala, zkouším alternativní...');
        console.error('API: Chyba hlavní konfigurace:', primaryError);
        
        // Zkusíme alternativní konfiguraci
        pool = await sql.connect(configAlt);
        console.log('API: Připojení k databázi úspěšné (alternativní konfigurace)');
      }
      
      const result = await pool.request()
        .input('sarze', sql.NVarChar, sarze)
        .query(`
          SELECT TOP 1 
            [Šarže] as sarze,
            [Zakázka] as zakazka,
            [Název zboží] as nazev_zbozi,
            [Odběratel] as odberatel,
            [Název zboží z pol VZ] as nazev_zbozi_vz,
            [Technologie] as technologie,
            [Kód zboží] as kod_zbozi
          FROM [ROZBOR].[dbo].[Šarže atesty pro kontrolu]
          WHERE [Šarže] = @sarze OR [Šarže] LIKE '%' + @sarze + '%'
        `);
      
      console.log('API: Výsledek dotazu:', result.recordset.length, 'záznamů');
      console.log('API: První záznam:', result.recordset[0]);

      if (result.recordset.length === 0) {
        console.log('API: Šarže nebyla nalezena v databázi');
        return NextResponse.json({ 
          error: 'Šarže nebyla nalezena' 
        }, { status: 404 });
      }

      const data = result.recordset[0];
      console.log('API: Odesílám data:', data);
      
      // Použijeme název zboží z VZ pokud je k dispozici, jinak standardní název
      const nazev_zbozi = data.nazev_zbozi_vz || data.nazev_zbozi || '';
      
      return NextResponse.json({
        sarze: data.sarze,
        zakazka: data.zakazka,
        nazev_zbozi: nazev_zbozi,
        odberatel: data.odberatel,
        technologie: data.technologie,
        kod_zbozi: data.kod_zbozi
      });

    } catch (dbError) {
      console.error('API: Chyba databáze:', dbError);
      
      // Pokud databáze nefunguje, vrátíme mock data pro jakoukoliv šarži
      console.log('API: Databáze nedostupná, vracím mock data');
      return NextResponse.json({
        sarze: sarze,
        zakazka: 'DB_ERROR_VZ001',
        nazev_zbozi: 'Databáze nedostupná - mock data',
        odberatel: 'Mock odběratel (DB error)'
      });
    } finally {
      if (pool) {
        try {
          await pool.close();
          console.log('API: Databázové připojení uzavřeno');
        } catch (closeError) {
          console.error('API: Chyba při zavírání připojení:', closeError);
        }
      }
    }

  } catch (error) {
    console.error('API: Obecná chyba:', error);
    return NextResponse.json({ 
      error: 'Chyba při načítání dat z databáze',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
