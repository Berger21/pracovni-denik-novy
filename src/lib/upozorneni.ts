import { UpozorneniPravidlo } from '@/types';

export function generovatStatickaUpozorneni(
  datum: string,
  smena: string,
  upozorneniPravidla: UpozorneniPravidlo[] = [],
  technologie?: string
): string[] {
  const upozorneni: string[] = [];
  const date = new Date(datum);
  const denVTydnu = date.getDay();

  // Každou středu - 6S pro všechny směny (ve všech směnách)
  if (denVTydnu === 3) {
    upozorneni.push('🧹 STŘEDA - PROVEDENÍ 6S PRO VŠECHNY SMĚNY');
  }

  // Každá odpolední směna má poznámku o nabíječce
  if (smena === 'odpolední') {
    upozorneni.push('🔋 DÁT VELKÝ VZV NA NABÍJEČKU - DO RÁNA MUSÍ BÝT NABITÝ');
  }

  // Přidání dalších upozornění z pravidel
  upozorneniPravidla.filter(p => p.aktivni).forEach(pravidlo => {
    let zobrazit = false;
    switch (pravidlo.typ) {
      case 'den_v_tydnu':
        zobrazit = denVTydnu === pravidlo.podminka;
        break;
      case 'smena':
        zobrazit = smena === pravidlo.podminka;
        break;
      case 'technologie':
        zobrazit = technologie === pravidlo.podminka;
        break;
      case 'datum':
        zobrazit = datum === pravidlo.podminka;
        break;
    }
    if (zobrazit) {
      upozorneni.push(`⚠️ ${pravidlo.zprava}`);
    }
  });

  return upozorneni;
}
