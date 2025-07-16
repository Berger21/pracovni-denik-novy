import path from 'path';
import { promises as fs } from 'fs';
import { UlozenyDenik, TehnologovePoznaky } from '@/types';

// Cesta k databázovým souborům
const dbDir = path.join(process.cwd(), 'data');
const denikyPath = path.join(dbDir, 'deniky.json');
const poznamkyPath = path.join(dbDir, 'poznamky.json');

// Vytvoření složky data pokud neexistuje
const ensureDataDir = async () => {
  try {
    await fs.mkdir(dbDir, { recursive: true });
  } catch {
    // Složka již existuje
  }
};

// Pomocné funkce pro čtení a zápis JSON souborů
const readJsonFile = async (filePath: string): Promise<unknown[]> => {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    // Soubor neexistuje nebo je prázdný
    return [];
  }
};

const writeJsonFile = async (filePath: string, data: unknown[]): Promise<void> => {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// API pro deníky
export const denikyDb = {
  async getAll(filters?: { datum?: string; smena?: string; technologie?: string }): Promise<UlozenyDenik[]> {
    const deniky = await readJsonFile(denikyPath) as UlozenyDenik[];
    
    if (!filters) return deniky;
    
    return deniky.filter((denik: UlozenyDenik) => {
      if (filters.datum && denik.zakladniUdaje.datum !== filters.datum) return false;
      if (filters.smena && denik.zakladniUdaje.smena !== filters.smena) return false;
      if (filters.technologie && denik.zakladniUdaje.technologie !== filters.technologie) return false;
      return true;
    });
  },

  async getById(id: string): Promise<UlozenyDenik | undefined> {
    const deniky = await readJsonFile(denikyPath) as UlozenyDenik[];
    return deniky.find((denik: UlozenyDenik) => denik.id === id);
  },

  async create(denik: UlozenyDenik): Promise<UlozenyDenik> {
    const deniky = await readJsonFile(denikyPath) as UlozenyDenik[];
    const newDenik = {
      ...denik,
      vytvoren: new Date().toISOString()
    };
    deniky.push(newDenik);
    await writeJsonFile(denikyPath, deniky);
    return newDenik;
  },

  async update(id: string, updates: Partial<UlozenyDenik>): Promise<UlozenyDenik | null> {
    const deniky = await readJsonFile(denikyPath) as UlozenyDenik[];
    const index = deniky.findIndex((denik: UlozenyDenik) => denik.id === id);
    
    if (index === -1) return null;
    
    deniky[index] = {
      ...deniky[index],
      ...updates
    };
    
    await writeJsonFile(denikyPath, deniky);
    return deniky[index];
  },

  async delete(id: string): Promise<boolean> {
    const deniky = await readJsonFile(denikyPath) as UlozenyDenik[];
    const filteredDeniky = deniky.filter((denik: UlozenyDenik) => denik.id !== id);
    await writeJsonFile(denikyPath, filteredDeniky);
    return true;
  }
};

// API pro poznámky
export const poznamkyDb = {
  async getAll(): Promise<TehnologovePoznaky[]> {
    return await readJsonFile(poznamkyPath) as TehnologovePoznaky[];
  },

  async getById(id: string): Promise<TehnologovePoznaky | undefined> {
    const poznamky = await readJsonFile(poznamkyPath) as TehnologovePoznaky[];
    return poznamky.find((poznamka: TehnologovePoznaky) => poznamka.id === id);
  },

  async create(poznamka: TehnologovePoznaky): Promise<TehnologovePoznaky> {
    const poznamky = await readJsonFile(poznamkyPath) as TehnologovePoznaky[];
    const newPoznamka = {
      ...poznamka,
      vytvoren: new Date().toISOString()
    };
    poznamky.push(newPoznamka);
    await writeJsonFile(poznamkyPath, poznamky);
    return newPoznamka;
  },

  async update(id: string, updates: Partial<TehnologovePoznaky>): Promise<TehnologovePoznaky | null> {
    const poznamky = await readJsonFile(poznamkyPath) as TehnologovePoznaky[];
    const index = poznamky.findIndex((poznamka: TehnologovePoznaky) => poznamka.id === id);
    
    if (index === -1) return null;
    
    poznamky[index] = {
      ...poznamky[index],
      ...updates
    };
    
    await writeJsonFile(poznamkyPath, poznamky);
    return poznamky[index];
  },

  async delete(id: string): Promise<boolean> {
    const poznamky = await readJsonFile(poznamkyPath) as TehnologovePoznaky[];
    const filteredPoznamky = poznamky.filter((poznamka: TehnologovePoznaky) => poznamka.id !== id);
    await writeJsonFile(poznamkyPath, filteredPoznamky);
    return true;
  }
};

// Backwards compatibility - export main function
export async function getDatabase() {
  return {
    deniky: denikyDb,
    poznamky: poznamkyDb
  };
}
