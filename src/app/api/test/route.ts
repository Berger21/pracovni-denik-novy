// @ts-expect-error mssql module may have type issues
import sql from 'mssql';
import { NextRequest, NextResponse } from 'next/server';

const config = {
  user: process.env.DB_USER || 'TSGAV\\r.ovcacik',
  password: process.env.DB_PASSWORD || 'EE4wiege1988',
  server: process.env.DB_SERVER || '192.168.1.100',
  database: process.env.DB_DATABASE || 'ROZBOR',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

export async function GET(request: NextRequest) {
  try {
    console.log('Test endpoint was called');
    
    const { searchParams } = new URL(request.url);
    const sarze = searchParams.get('sarze');
    
    // Test environment variables
    const envInfo = {
      DB_USER: process.env.DB_USER ? 'SET' : 'NOT SET',
      DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
      DB_SERVER: process.env.DB_SERVER || 'NOT SET',
      DB_DATABASE: process.env.DB_DATABASE || 'NOT SET'
    };

    // Test databázového připojení pokud je požadován
    let dbTest = null;
    if (sarze === 'debug' || sarze === 'db') {
      console.log('TEST API: Spouštím test databázového připojení...');
      let pool;
      
      try {
        pool = await sql.connect(config);
        console.log('TEST API: ✅ Připojení k databázi úspěšné');
        
        const testResult = await pool.request().query(`
          SELECT TOP 3 
            [Šarže], 
            [Zakázka], 
            [Název zboží], 
            [Odběratel]
          FROM [ROZBOR].[dbo].[Šarže atesty pro kontrolu]
          WHERE [Šarže] IS NOT NULL
          ORDER BY [Datum vytvoření zakázky] DESC
        `);
        
        dbTest = {
          status: 'success',
          connected: true,
          recordCount: testResult.recordset.length,
          sampleData: testResult.recordset.slice(0, 2)
        };
        
      } catch (dbError) {
        console.error('TEST API: ❌ Chyba databáze:', dbError);
        dbTest = {
          status: 'error',
          connected: false,
          error: dbError instanceof Error ? dbError.message : String(dbError)
        };
      } finally {
        if (pool) {
          try {
            await pool.close();
          } catch (closeError) {
            console.error('TEST API: Chyba při zavírání připojení:', closeError);
          }
        }
      }
    }
    
    return NextResponse.json({
      message: 'Test endpoint works',
      receivedSarze: sarze,
      timestamp: new Date().toISOString(),
      environment: envInfo,
      nodeVersion: process.version,
      databaseTest: dbTest
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
