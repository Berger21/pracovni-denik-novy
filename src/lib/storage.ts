// Utility funkce pro server storage přes API
import { UlozenyDenik, TehnologovePoznaky, UpozorneniPravidlo, ZaznamStatistiky } from '@/types';

const STORAGE_KEYS = {
  DENIKY: 'pracovni_deniky',
  TECHNOLOG_POZNAMKY: 'technolog_poznamky',
  UPOZORNENI: 'upozorneni_pravidla',
  STATISTIKY: 'statistiky'
} as const;

// Cache pro rychlejší přístup
let denikyCache: UlozenyDenik[] | null = null;
let poznamkyCache: TehnologovePoznaky[] | null = null;

// Funkce pro práci s deníky - nyní přes API
export const ulozitDenik = async (denik: UlozenyDenik): Promise<void> => {
  try {
    const response = await fetch('/api/deniky', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(denik),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Aktualizovat cache
    if (denikyCache) {
      const index = denikyCache.findIndex(d => d.id === denik.id);
      if (index >= 0) {
        denikyCache[index] = denik;
      } else {
        denikyCache.push(denik);
      }
    }
  } catch (error) {
    console.error('Chyba při ukládání deníku na server:', error);
    // Fallback na localStorage
    try {
      const deniky = await nacistDeniky();
      const index = deniky.findIndex(d => d.id === denik.id);
      
      if (index >= 0) {
        deniky[index] = denik;
      } else {
        deniky.push(denik);
      }
      
      localStorage.setItem(STORAGE_KEYS.DENIKY, JSON.stringify(deniky));
    } catch (fallbackError) {
      console.error('Chyba při fallback ukládání deníku:', fallbackError);
      throw error;
    }
  }
};

export const nacistDeniky = async (): Promise<UlozenyDenik[]> => {
  try {
    // Pokud máme cache, použít ji
    if (denikyCache) {
      return denikyCache;
    }

    const response = await fetch('/api/deniky', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const deniky = await response.json();
      denikyCache = deniky; // Uložit do cache
      return deniky;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Chyba při načítání deníků ze serveru:', error);
    // Fallback na localStorage
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DENIKY);
      const deniky = data ? JSON.parse(data) : [];
      denikyCache = deniky;
      return deniky;
    } catch (fallbackError) {
      console.error('Chyba při fallback načítání deníků:', fallbackError);
      return [];
    }
  }
};

// Synchronní verze pro kompatibilitu s existujícím kódem
export const nacistDenikySync = (): UlozenyDenik[] => {
  if (denikyCache) {
    return denikyCache;
  }
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DENIKY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Chyba při sync načítání deníků:', error);
    return [];
  }
};

export const smazatDenik = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/deniky?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Aktualizovat cache
    if (denikyCache) {
      denikyCache = denikyCache.filter(d => d.id !== id);
    }
  } catch (error) {
    console.error('Chyba při mazání deníku na serveru:', error);
    // Fallback na localStorage
    try {
      const deniky = nacistDenikySync().filter(d => d.id !== id);
      localStorage.setItem(STORAGE_KEYS.DENIKY, JSON.stringify(deniky));
      denikyCache = deniky;
    } catch (fallbackError) {
      console.error('Chyba při fallback mazání deníku:', fallbackError);
      throw error;
    }
  }
};

// Funkce pro poznámky technologa
// Funkce pro poznámky technologa - nyní přes API
export const ulozitTehnologovuPoznamku = async (poznamka: TehnologovePoznaky): Promise<void> => {
  try {
    const response = await fetch('/api/poznamky', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(poznamka),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Aktualizovat cache
    if (poznamkyCache) {
      const index = poznamkyCache.findIndex(p => p.id === poznamka.id);
      if (index >= 0) {
        poznamkyCache[index] = poznamka;
      } else {
        poznamkyCache.push(poznamka);
      }
    }
  } catch (error) {
    console.error('Chyba při ukládání poznámky na server:', error);
    // Fallback na localStorage
    try {
      const poznamky = nacistTehnologovePoznamkySync();
      const index = poznamky.findIndex(p => p.id === poznamka.id);
      
      if (index >= 0) {
        poznamky[index] = poznamka;
      } else {
        poznamky.push(poznamka);
      }
      
      localStorage.setItem(STORAGE_KEYS.TECHNOLOG_POZNAMKY, JSON.stringify(poznamky));
      poznamkyCache = poznamky;
    } catch (fallbackError) {
      console.error('Chyba při fallback ukládání poznámky:', fallbackError);
      throw error;
    }
  }
};

export const nacistTehnologovePoznamky = async (): Promise<TehnologovePoznaky[]> => {
  try {
    // Pokud máme cache, použít ji
    if (poznamkyCache) {
      return poznamkyCache;
    }

    const response = await fetch('/api/poznamky', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const poznamky = await response.json();
      poznamkyCache = poznamky; // Uložit do cache
      return poznamky;
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Chyba při načítání poznámek ze serveru:', error);
    // Fallback na localStorage
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TECHNOLOG_POZNAMKY);
      const poznamky = data ? JSON.parse(data) : [];
      poznamkyCache = poznamky;
      return poznamky;
    } catch (fallbackError) {
      console.error('Chyba při fallback načítání poznámek:', fallbackError);
      return [];
    }
  }
};

// Synchronní verze pro kompatibilitu s existujícím kódem
export const nacistTehnologovePoznamkySync = (): TehnologovePoznaky[] => {
  if (poznamkyCache) {
    return poznamkyCache;
  }
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TECHNOLOG_POZNAMKY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Chyba při sync načítání poznámek:', error);
    return [];
  }
};

export const najitPoznamkyProDatumASmenu = async (datum: string, smena: string, technologie: string): Promise<TehnologovePoznaky[]> => {
  try {
    const poznamky = await nacistTehnologovePoznamky();
    return poznamky.filter(p => 
      p.datum === datum && 
      p.smena === smena && 
      p.technologie === technologie
    );
  } catch (error) {
    console.error('Chyba při hledání poznámek:', error);
    return [];
  }
};

// Synchronní verze pro kompatibilitu s existujícím kódem (deprecated)
export const najitPoznamkyProDatumASmenuSync = (datum: string, smena: string, technologie: string): TehnologovePoznaky[] => {
  const poznamky = nacistTehnologovePoznamkySync();
  return poznamky.filter(p => 
    p.datum === datum && 
    p.smena === smena && 
    p.technologie === technologie
  );
};

export const smazatTehnologovuPoznamku = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/poznamky?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Aktualizovat cache
    if (poznamkyCache) {
      poznamkyCache = poznamkyCache.filter(p => p.id !== id);
    }
  } catch (error) {
    console.error('Chyba při mazání poznámky na serveru:', error);
    // Fallback na localStorage
    try {
      const poznamky = nacistTehnologovePoznamkySync().filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.TECHNOLOG_POZNAMKY, JSON.stringify(poznamky));
      poznamkyCache = poznamky;
    } catch (fallbackError) {
      console.error('Chyba při fallback mazání poznámky:', fallbackError);
      throw error;
    }
  }
};

// Funkce pro upozornění
export const ulozitUpozorneni = (upozorneni: UpozorneniPravidlo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.UPOZORNENI, JSON.stringify(upozorneni));
  } catch (error) {
    console.error('Chyba při ukládání upozornění:', error);
  }
};

export const nacistUpozorneni = (): UpozorneniPravidlo[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.UPOZORNENI);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Chyba při načítání upozornění:', error);
    return [];
  }
};

// Funkce pro statistiky
export const ulozitStatistiky = (statistiky: ZaznamStatistiky): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STATISTIKY, JSON.stringify(statistiky));
  } catch (error) {
    console.error('Chyba při ukládání statistik:', error);
  }
};

export const nacistStatistiky = (): ZaznamStatistiky | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATISTIKY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Chyba při načítání statistik:', error);
    return null;
  }
};

// Funkce pro nalezení předchozího deníku podle směny
export const najitPredchadzajuciDenik = (aktualneTechnologie: string, aktualnyDatum: string, aktualnaSmena?: string): UlozenyDenik | null => {
  try {
    const deniky = nacistDenikySync();
    
    // Filtrovanie deníkov pre danú technológiu
    const denikePodlaTechnologie = deniky.filter(d => d.zakladniUdaje.technologie === aktualneTechnologie);
    
    if (denikePodlaTechnologie.length === 0) {
      return null;
    }
    
    // Zoradenej podľa dátumu a času zostupne (najnovší prvý)
    const zoradenieDenikov = denikePodlaTechnologie.sort((a, b) => {
      const dateA = new Date(a.zakladniUdaje.datum);
      const dateB = new Date(b.zakladniUdaje.datum);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      
      // Ak je rovnaký dátum, zoradiť podľa času začiatku směny
      const timeA = a.zakladniUdaje.cas_od;
      const timeB = b.zakladniUdaje.cas_od;
      return timeB.localeCompare(timeA);
    });
    
    // Ak je zadaná konkrétna směna, hľadaj predchádzajúcu
    if (aktualnyDatum && aktualnaSmena) {
      const aktualnyDate = new Date(aktualnyDatum);
      const dayOfWeek = aktualnyDate.getDay(); // 0 = neděle, 1 = pondělí, ..., 6 = sobota
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Definice směn a jejich chronologické pořadí
      const smenyVsedni = ['ranní', 'odpolední', 'noční'];
      const smenyVikend = ['denní', 'noční'];
      
      const aktualneSmeny = isWeekend ? smenyVikend : smenyVsedni;
      const aktualnePoradie = aktualneSmeny.indexOf(aktualnaSmena);
      
      if (aktualnePoradie === -1) {
        console.warn(`Neznámá směna: ${aktualnaSmena}`);
        return zoradenieDenikov[0] || null;
      }
      
      // Najskôr hľadaj predchádzajúcu směnu v ten istý deň
      const dennikyVRovnakyDen = zoradenieDenikov.filter(d => {
        const denikDate = new Date(d.zakladniUdaje.datum);
        return denikDate.getTime() === aktualnyDate.getTime();
      });
      
      // Hľadaj predchádzajúcu směnu v tom istom dni
      for (const denik of dennikyVRovnakyDen) {
        const denikPoradie = aktualneSmeny.indexOf(denik.zakladniUdaje.smena);
        if (denikPoradie !== -1 && denikPoradie < aktualnePoradie) {
          return denik;
        }
      }
      
      // Ak nenájdem v ten istý deň, hľadaj poslednú směnu z predchádzajúceho dňa
      const predchadzajuciDen = new Date(aktualnyDate);
      predchadzajuciDen.setDate(predchadzajuciDen.getDate() - 1);
      const predchadzajuciDayOfWeek = predchadzajuciDen.getDay();
      const predchadzajuciIsWeekend = predchadzajuciDayOfWeek === 0 || predchadzajuciDayOfWeek === 6;
      
      // Ak aktuálna směna je prvá v dni, hľadaj poslednú z predchádzajúceho dňa
      if (aktualnePoradie === 0) {
        // Poslednú směnu predchádzajúceho dňa
        const poslednaSmenaVcera = predchadzajuciIsWeekend ? 'noční' : 'noční';
        
        const denikyVcera = zoradenieDenikov.filter(d => {
          const denikDate = new Date(d.zakladniUdaje.datum);
          return denikDate.getTime() === predchadzajuciDen.getTime() && d.zakladniUdaje.smena === poslednaSmenaVcera;
        });
        
        if (denikyVcera.length > 0) {
          return denikyVcera[0];
        }
        
        // Ak nie je nočná, skúsime všetky směny z predchádzajúceho dňa
        const vsetkyDenikyVcera = zoradenieDenikov.filter(d => {
          const denikDate = new Date(d.zakladniUdaje.datum);
          return denikDate.getTime() === predchadzajuciDen.getTime();
        });
        
        if (vsetkyDenikyVcera.length > 0) {
          // Zoradíme podľa času a vrátime posledný
          const predchadzajuceSmeny = predchadzajuciIsWeekend ? smenyVikend : smenyVsedni;
          
          vsetkyDenikyVcera.sort((a, b) => {
            const indexA = predchadzajuceSmeny.indexOf(a.zakladniUdaje.smena);
            const indexB = predchadzajuceSmeny.indexOf(b.zakladniUdaje.smena);
            return indexB - indexA; // Od najvyššieho k najnižšiemu
          });
          
          return vsetkyDenikyVcera[0];
        }
      }
      
      // Fallback - najnovší deník pred aktuálním dátumom
      const predchadzajuci = zoradenieDenikov.find(d => {
        const denikDate = new Date(d.zakladniUdaje.datum);
        return denikDate.getTime() < aktualnyDate.getTime();
      });
      
      return predchadzajuci || null;
    }
    
    // Ak je len dátum bez směny, vrátiť posledný pred týmto dátumom
    if (aktualnyDatum) {
      const aktualnyDate = new Date(aktualnyDatum);
      const predchadzajuci = zoradenieDenikov.find(d => {
        const denikDate = new Date(d.zakladniUdaje.datum);
        return denikDate.getTime() < aktualnyDate.getTime();
      });
      return predchadzajuci || null;
    }
    
    // Inak vrátiť najnovší
    return zoradenieDenikov[0] || null;
  } catch (error) {
    console.error('Chyba při hledání předchozího deníku:', error);
    return null;
  }
};

// Funkce pro nalezení rozpracovaného deníku (ještě nedokončeného)
export const najitRozpracovanyDenik = (technologie: string, datum: string): UlozenyDenik | null => {
  try {
    const deniky = nacistDenikySync();
    
    // Filtrujeme podle technologie a data
    const denykyProDaneTechnologieADatum = deniky.filter(d => 
      d.zakladniUdaje.technologie === technologie && 
      d.zakladniUdaje.datum === datum
    );
    
    // Hledáme rozpracovaný deník (bez dokončených podpisů)
    const rozpracovanyDenik = denykyProDaneTechnologieADatum.find(d => 
      !d.potvrzeni.smenu_predal || !d.potvrzeni.smenu_prevzal
    );
    
    return rozpracovanyDenik || null;
  } catch (error) {
    console.error('Chyba při hledání rozpracovaného deníku:', error);
    return null;
  }
};

// Funkce pro získání vedoucího směny z předchozí směny
export const najitVedoucihoZPredchoziSmeny = (technologie: string, aktualniDatum: string, aktualnaSmena: string): string => {
  try {
    console.log(`🔍 Hledám vedoucího pro: ${technologie}, ${aktualniDatum}, ${aktualnaSmena}`);
    
    // Najdeme předchozí deník pro danou technologii
    const predchoziDenik = najitPredchadzajuciDenik(technologie, aktualniDatum, aktualnaSmena);
    
    if (!predchoziDenik) {
      console.log('❌ Předchozí deník nebyl nalezen pro automatické doplnění vedoucího směny');
      return '';
    }
    
    console.log(`📋 Nalezen předchozí deník: ${predchoziDenik.zakladniUdaje.datum} ${predchoziDenik.zakladniUdaje.smena}`);
    
    // Pokud má předchozí deník dokončené potvrzení, vezměme "směnu převzal" jako vedoucího aktuální směny
    if (predchoziDenik.potvrzeni.smenu_prevzal && predchoziDenik.potvrzeni.smenu_prevzal.trim()) {
      console.log(`✅ Automaticky doplněn vedoucí směny: ${predchoziDenik.potvrzeni.smenu_prevzal} (z "směnu převzal")`);
      return predchoziDenik.potvrzeni.smenu_prevzal.trim();
    }
    
    // Pokud není dokončený, zkusíme vzít vedoucího směny z předchozího deníku
    if (predchoziDenik.zakladniUdaje.vedouci_smeny && predchoziDenik.zakladniUdaje.vedouci_smeny.trim()) {
      console.log(`⚠️ Automaticky doplněn vedoucí směny: ${predchoziDenik.zakladniUdaje.vedouci_smeny} (z vedoucího předchozího deníku)`);
      return predchoziDenik.zakladniUdaje.vedouci_smeny.trim();
    }
    
    console.log('❌ Předchozí deník nemá vyplněného vedoucího směny');
    return '';
  } catch (error) {
    console.error('🚨 Chyba při hledání vedoucího z předchozí směny:', error);
    return '';
  }
};

// Utility funkce
export const generovatId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDatumCas = (datum: Date = new Date()): string => {
  return datum.toISOString();
};
