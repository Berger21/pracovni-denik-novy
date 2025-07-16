// Typy pro aplikaci Pracovní deníky

// Typ pro data z databáze šarží
export interface SarzeData {
  sarze: string;
  zakazka: string;
  nazev_zbozi: string;
  odberatel: string;
}

export interface PracovniZaznam {
  id: number;
  datum: string;
  cas_od: string;
  cas_do: string;
  sarze: string; // Nové pole pro šarži
  cislo_zakazky: string;
  popis_zakazky: string;
  odberatel: string; // Nové pole pro odběratele
  pec: string;
  cinnost: string;
  poznamky: string;
}

export interface ZakladniUdaje {
  technologie: 'SOLO500' | 'IPSEN' | 'VAKUUM' | 'P.K' | '';
  smena: 'ranní' | 'odpolední' | 'noční' | 'denní' | '';
  vedouci_smeny: string;
  obsluha_linky: string;
  datum: string;
  cas_od: string;
  cas_do: string;
  poznamky_vedouciho?: string; // Nová kolonka pro poznámky vedoucího směny
  poznamka: string;
}

export interface SmenaInfo {
  nazev: 'ranní' | 'odpolední' | 'noční' | 'denní';
  cas_od: string;
  cas_do: string;
}

export type TypSmeny = 'ranní' | 'odpolední' | 'noční' | 'denní';
export type TypTechnologie = 'SOLO500' | 'IPSEN' | 'VAKUUM' | 'P.K';

export interface Instrukce {
  technologie: string;
  smena: string;
  obsah: string;
}

export interface PodpisData {
  predal: string;
  prevzal: string;
}

export interface TehnologovePoznaky {
  id: string;
  datum: string;
  smena: TypSmeny;
  technologie: TypTechnologie;
  poznamka: string;
  vytvoren: string;
  autor: string; // Jméno technologa
}

export interface UlozenyDenik {
  id: string;
  zakladniUdaje: ZakladniUdaje;
  zaznamy: PracovniZaznam[];
  instrukce: Instrukce[];
  potvrzeni: {
    smenu_predal: string;
    smenu_prevzal: string;
  };
  podpisy: PodpisData;
  vytvoren: string;
}

export interface ZaznamStatistiky {
  celkovyPocet: number;
  celkovyCas: number;
  smeny: Record<TypSmeny, number>;
  denni: Record<string, number>;
  zakazky: Record<string, number>;
  technologie: Record<TypTechnologie, number>;
  posledniAktivita: string;
}

export interface UpozorneniPravidlo {
  id: string;
  nazev: string;
  typ: 'datum' | 'den_v_tydnu' | 'smena' | 'technologie';
  podminka: string | number | TypSmeny | TypTechnologie;
  zprava: string;
  aktivni: boolean;
  vytvoren: string;
}
