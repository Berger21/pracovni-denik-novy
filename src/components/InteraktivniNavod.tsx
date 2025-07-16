'use client';

import { useState } from 'react';

interface InteraktivniNavodProps {
  onClose: () => void;
}

interface NavodKrok {
  id: number;
  nazev: string;
  popis: string;
  obrazek?: string;
  tipy?: string[];
  pozornost?: string;
}

const NAVOD_KROKY: NavodKrok[] = [
  {
    id: 1,
    nazev: "🏠 Hlavní obrazovka a začátek práce",
    popis: "Po spuštění aplikace se dostanete na hlavní obrazovku, kde můžete vytvořit nový pracovní deník nebo zobrazit již vytvořené. Aplikace je navržena pro snadné a intuitivní použití během směny.",
    tipy: [
      "Vyberte technologii z rozbalovacího menu (SOLO500, IPSEN, VAKUUM, P.K)",
      "Nastavte správné datum - aplikace automaticky nabídne dnešní datum",
      "Směny se mění podle dne v týdnu (všední dny: ranní/odpolední/noční, víkend: denní/noční)",
      "Data z databáze šarží se načítají automaticky při zadání čísla zakázky",
      "Použijte vyhledávací pole pro rychlé nalezení konkrétní šarže"
    ],
    pozornost: "Vždy zkontrolujte správnost vybraného data a směny před vytvořením deníku! Chybně zadané údaje mohou ovlivnit celý pracovní tok."
  },
  {
    id: 2,
    nazev: "📝 Vytvoření a správa pracovních záznamů",
    popis: "Hlavní část aplikace pro dokumentaci vaší práce. Zde zapisujete všechny pracovní úkoly, které během směny provádíte. Každý záznam obsahuje kompletní informace o zakázce.",
    tipy: [
      "Vyplňte číslo zakázky - šarže a odběratel se doplní automaticky z databáze",
      "Časy zadávejte přesně ve formátu HH:MM (např. 08:30, 14:45)",
      "Popis činnosti buďte konkrétní - pomůže to při kontrole a plánování",
      "Poznámky jsou volitelné, ale doporučujeme je vyplnit pro lepší dokumentaci",
      "Můžete přidávat neomezeně záznamů během směny",
      "Každý záznam se automaticky ukládá po přidání"
    ],
    pozornost: "Všechny záznamy se automaticky ukládají do místního úložiště prohlížeče. Pravidelně zálohujte data!"
  },
  {
    id: 3,
    nazev: "📅 Kalendářní pohled a historie",
    popis: "Kalendářní pohled vám umožňuje prohlížet již vytvořené deníky podle data. Každý den s deníky je barevně odlišen podle hlavní použité technologie. Můžete rychle najít konkrétní deník a zobrazit jeho detail.",
    tipy: [
      "Filtrujte deníky podle technologie nebo směny pro rychlejší orientaci",
      "Kliknutím na konkrétní den zobrazíte všechny deníky pro tento den",
      "Barevné označení: SOLO500 (modrá), IPSEN (zelená), VAKUUM (fialová), P.K (oranžová)",
      "V detailu deníku vidíte všechny pracovní záznamy i poznámky",
      "Můžete přejít přímo na konkrétní deník pro úpravy"
    ],
    pozornost: "V detailu deníku nyní uvidíte také poznámky technologa, vedoucího směny i statická upozornění pro lepší přehled."
  },
  {
    id: 4,
    nazev: "📊 Statistiky a analýzy výkonu",
    popis: "Sekce statistik poskytuje komplexní přehled o vaší práci. Můžete sledovat produktivitu, nejčastější zakázky, rozložení práce podle směn a další užitečné metriky pro optimalizaci pracovních procesů.",
    tipy: [
      "Statistiky se aktualizují automaticky s každým novým záznamem",
      "Filtrujte podle konkrétního data pro detailnější analýzu",
      "Grafy zobrazují rozdělení práce mezi technologie a směny",
      "Sledujte trendy v produktivitě a identifikujte nejčastější zakázky",
      "Exportujte statistiky pro reporty vedení"
    ],
    pozornost: "Statistiky jsou založeny pouze na lokálně uložených datech. Pro komplexní reporting kombinujte s exporty PDF."
  },
  {
    id: 5,
    nazev: "🔧 Rozhraní pro technologa - rozšířené funkce",
    popis: "Technologové mají přístup k rozšířeným funkcím včetně správy poznámek pro směny, editace a mazání existujících deníků a správy záloh. Toto rozhraní umožňuje komplexní správu všech aspektů aplikace.",
    tipy: [
      "Poznámky technologa se automaticky zobrazují ve všech relevantních denících",
      "Můžete vytvářet poznámky pro konkrétní směny a technologie",
      "Editace deníků umožňuje opravu chyb nebo doplnění informací",
      "Funkce zálohování poskytuje export a import všech dat",
      "Přístup je chráněn heslem pro bezpečnost"
    ],
    pozornost: "Změny v denících jsou trvalé - před mazáním nebo rozsáhlými úpravami si vždy data zazálohujte!"
  },
  {
    id: 6,
    nazev: "🎨 Personalizace - tmavý a světlý režim",
    popis: "Aplikace podporuje tmavý i světlý režim pro maximální pohodlí práce v různých světelných podmínkách. Můžete si vybrat režim, který vám nejvíce vyhovuje.",
    tipy: [
      "Přepínejte mezi režimy tlačítkem 🌙/☀️ v pravém horním rohu",
      "Nastavení se automaticky ukládá a obnoví při příštím spuštění",
      "Tmavý režim šetří baterii na zařízeních s OLED displeji",
      "Světlý režim je vhodnější pro práci při denním světle",
      "Režim lze změnit kdykoli během práce"
    ]
  },
  {
    id: 7,
    nazev: "💾 Export do PDF - profesionální dokumentace",
    popis: "Každý dokončený deník můžete exportovat do PDF pro archivaci, tisk nebo předání nadřízeným. PDF obsahuje všechny důležité informace ve standardizovaném formátu.",
    tipy: [
      "PDF obsahuje kompletní záznamy, poznámky technologa i podpisy",
      "Exportované soubory mají jednotný profesionální formát",
      "Vhodné pro předání směnovým vedoucím nebo archivaci",
      "PDF se generuje okamžitě po kliknutí na tlačítko",
      "Soubory jsou pojmenovány podle data a směny pro snadnou identifikaci"
    ],
    pozornost: "PDF se generuje v aktuálním stavu deníku - ujistěte se, že jsou všechna data správně vyplněna před exportem."
  },
  {
    id: 8,
    nazev: "🔄 Zálohování a obnovení dat",
    popis: "Pravidelné zálohování je klíčové pro ochranu vašich dat. Aplikace ukládá veškeré informace lokálně v prohlížeči, proto je důležité vytvářet zálohy na externích úložištích.",
    tipy: [
      "Exportujte zálohu před důležitými změnami nebo na konci týdne",
      "Zálohy obsahují všechny deníky, poznámky, nastavení i statistiky",
      "Importovat můžete pouze zálohy vytvořené touto aplikací",
      "Doporučujeme ukládat zálohy na síťové disky nebo cloud",
      "Testujte obnovu dat z záloh pravidelně"
    ],
    pozornost: "Vymazání dat prohlížeče, přeinstalace systému nebo selhání disku může způsobit ztrátu všech deníků! Zálohujte pravidelně."
  },
  {
    id: 9,
    nazev: "🔒 Bezpečnost a správa přístupů",
    popis: "Aplikace obsahuje různé úrovně přístupů. Běžní uživatelé mohou vytvářet a prohlížet deníky, zatímco technologové mají rozšířené oprávnění pro správu systému.",
    tipy: [
      "Technologické rozhraní je chráněno heslem",
      "Nikdy nesdílejte heslo s neautorizovanými osobami",
      "Data jsou ukládána pouze lokálně ve vašem prohlížeči",
      "Při práci na sdílených počítačích se vždy odhlaste",
      "Pravidelně měňte přístupová hesla"
    ],
    pozornost: "Za bezpečnost dat odpovídá každý uživatel. Chraňte své přístupové údaje a pravidelně zálohujte!"
  },
  {
    id: 10,
    nazev: "🛠️ Troubleshooting a řešení problémů",
    popis: "Pokud narazíte na problémy, zde najdete nejčastější řešení. Většinu problémů lze vyřešit jednoduchými kroky bez ztráty dat.",
    tipy: [
      "Při problémech s načítáním obnovte stránku (F5 nebo Ctrl+R)",
      "Pokud se nezobrazují data, zkontrolujte připojení k internetu",
      "Při pomalém běhu aplikace vyčistěte cache prohlížeče",
      "Pro čištění dat použijte funkci v nastavení prohlížeče",
      "Při závažných problémech obnovte aplikaci z nejnovější zálohy"
    ],
    pozornost: "Před řešením problémů si vždy vytvořte zálohu aktuálních dat!"
  }
];

export default function InteraktivniNavod({ onClose }: InteraktivniNavodProps) {
  const [aktivniKrok, setAktivniKrok] = useState(1);
  const [ukonceno, setUkonceno] = useState(false);

  const aktualizaciKrok = NAVOD_KROKY.find(k => k.id === aktivniKrok);

  const dalsiKrok = () => {
    if (aktivniKrok < NAVOD_KROKY.length) {
      setAktivniKrok(aktivniKrok + 1);
    } else {
      setUkonceno(true);
    }
  };

  const predchoziKrok = () => {
    if (aktivniKrok > 1) {
      setAktivniKrok(aktivniKrok - 1);
    }
  };

  const skocitNaKrok = (krok: number) => {
    setAktivniKrok(krok);
    setUkonceno(false);
  };

  if (ukonceno) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Skvělá práce!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Prošli jste úspěšně celým návodem. Nyní jste připraveni efektivně používat aplikaci Pracovní deníky.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setUkonceno(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Projít znovu
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ✅ Začít používat
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Boční navigace */}
        <div className="w-1/3 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            📚 Obsah návodu
          </h3>
          <div className="space-y-2">
            {NAVOD_KROKY.map((krok) => (
              <button
                key={krok.id}
                onClick={() => skocitNaKrok(krok.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  aktivniKrok === krok.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded mr-2">
                    {krok.id}
                  </span>
                  <span className="text-sm font-medium truncate">
                    {krok.nazev}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hlavní obsah */}
        <div className="flex-1 p-6 overflow-y-auto">
          {aktualizaciKrok && (
            <>
              {/* Hlavička */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-3">
                      Krok {aktualizaciKrok.id} z {NAVOD_KROKY.length}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(aktualizaciKrok.id / NAVOD_KROKY.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {aktualizaciKrok.nazev}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Obsah kroku */}
              <div className="space-y-6">
                {/* Vizuální miniatura celkové aplikace */}
                {aktivniKrok === 1 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg p-4 mb-4">
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      🖥️ Přehled aplikace
                    </h4>
                    <div className="bg-white dark:bg-gray-800 rounded border p-3 text-xs">
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded text-center cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors">
                          <div className="w-full h-8 bg-blue-200 dark:bg-blue-700 rounded mb-1"></div>
                          <span className="text-blue-700 dark:text-blue-300 font-medium">Hlavní panel</span>
                        </div>
                        <div className="bg-green-100 dark:bg-green-800 p-2 rounded text-center cursor-pointer hover:bg-green-200 dark:hover:bg-green-700 transition-colors">
                          <div className="w-full h-8 bg-green-200 dark:bg-green-700 rounded mb-1"></div>
                          <span className="text-green-700 dark:text-green-300 font-medium">Kalendář</span>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-800 p-2 rounded text-center cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors">
                          <div className="w-full h-8 bg-purple-200 dark:bg-purple-700 rounded mb-1"></div>
                          <span className="text-purple-700 dark:text-purple-300 font-medium">Technolog</span>
                        </div>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        💡 Kliknutím na kterýkoliv panel získáte rychlý přístup k funkcím
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  {aktualizaciKrok.popis}
                </p>

                {/* Tipy */}
                {aktualizaciKrok.tipy && aktualizaciKrok.tipy.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                    <h4 className="text-green-800 dark:text-green-200 font-semibold mb-3 flex items-center">
                      💡 Užitečné tipy:
                    </h4>
                    <ul className="space-y-2">
                      {aktualizaciKrok.tipy.map((tip, index) => (
                        <li key={index} className="text-green-700 dark:text-green-300 flex items-start">
                          <span className="text-green-500 mr-2 mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Upozornění */}
                {aktualizaciKrok.pozornost && (
                  <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
                    <h4 className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2 flex items-center">
                      ⚠️ Důležité upozornění:
                    </h4>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      {aktualizaciKrok.pozornost}
                    </p>
                  </div>
                )}

                {/* Demo pro konkrétní kroky */}
                {aktivniKrok === 1 && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <h4 className="text-gray-800 dark:text-gray-200 font-semibold mb-4">
                      📱 Ukázka hlavní obrazovky:
                    </h4>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded border shadow-sm">
                      <div className="border-b pb-3 mb-3">
                        <h5 className="font-semibold text-blue-600">1. Základní nastavení</h5>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technologie</label>
                          <select className="w-full px-3 py-2 border rounded text-sm bg-white dark:bg-gray-700" disabled>
                            <option>SOLO500</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Směna</label>
                          <select className="w-full px-3 py-2 border rounded text-sm bg-white dark:bg-gray-700" disabled>
                            <option>ranní (06:00-14:00)</option>
                          </select>
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 p-2 bg-blue-50 dark:bg-blue-900 rounded">
                        💡 Tip: Směny se automaticky mění podle dne v týdnu
                      </div>
                    </div>
                  </div>
                )}

                {aktivniKrok === 2 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                      <h4 className="text-blue-800 dark:text-blue-200 font-semibold mb-3">
                        📋 Ukázka formuláře pro pracovní záznam:
                      </h4>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded border space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Čas od</label>
                            <input type="time" className="mt-1 w-full px-3 py-2 border rounded text-sm" value="08:00" readOnly />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Čas do</label>
                            <input type="time" className="mt-1 w-full px-3 py-2 border rounded text-sm" value="16:00" readOnly />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Číslo zakázky</label>
                          <input type="text" className="mt-1 w-full px-3 py-2 border rounded text-sm" value="12345" readOnly />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Šarže</label>
                            <input type="text" className="mt-1 w-full px-3 py-2 border rounded text-sm bg-yellow-50" value="ABC123" readOnly />
                            <span className="text-xs text-green-600">✓ Automaticky doplněno</span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Odběratel</label>
                            <input type="text" className="mt-1 w-full px-3 py-2 border rounded text-sm bg-yellow-50" value="Zákazník s.r.o." readOnly />
                            <span className="text-xs text-green-600">✓ Automaticky doplněno</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          ℹ️ Toto je pouze ukázka - skutečný formulář najdete na hlavní stránce
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                      <h4 className="text-green-800 dark:text-green-200 font-semibold mb-3">
                        ⚡ Automatické doplňování dat:
                      </h4>
                      <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                        <div className="flex items-center">
                          <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                          Po zadání čísla zakázky se automaticky načte šarže
                        </div>
                        <div className="flex items-center">
                          <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                          Odběratel se doplní podle databáze
                        </div>
                        <div className="flex items-center">
                          <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                          Popis zakázky se načte automaticky
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {aktivniKrok === 3 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                      <h4 className="text-blue-800 dark:text-blue-200 font-semibold mb-3">
                        🎨 Barevné označení technologií:
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-800 p-2 rounded">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">SOLO500</span>
                        </div>
                        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-800 p-2 rounded">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span className="text-sm text-green-700 dark:text-green-300 font-medium">IPSEN</span>
                        </div>
                        <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-800 p-2 rounded">
                          <div className="w-4 h-4 bg-purple-500 rounded"></div>
                          <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">VAKUUM</span>
                        </div>
                        <div className="flex items-center gap-2 bg-orange-100 dark:bg-orange-800 p-2 rounded">
                          <div className="w-4 h-4 bg-orange-500 rounded"></div>
                          <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">P.K</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
                      <h4 className="text-yellow-800 dark:text-yellow-200 font-semibold mb-3">
                        📋 Ukázka detailu deníku s poznámkami:
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded">
                          <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">🔧 Poznámky technologa:</p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">Zkontrolovat teplotu pece před spuštěním...</p>
                        </div>
                        <div className="bg-yellow-100 dark:bg-yellow-800 p-3 rounded">
                          <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">📝 Poznámky vedoucího:</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">Urgentní zakázka, priorita číslo 1</p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-800 p-3 rounded">
                          <p className="text-xs font-semibold text-purple-800 dark:text-purple-200">⚠️ Důležitá upozornění:</p>
                          <p className="text-sm text-purple-700 dark:text-purple-300">🧹 STŘEDA - PROVEDENÍ 6S PRO VŠECHNY SMĚNY</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {aktivniKrok === 4 && (
                  <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900 rounded-lg p-4">
                      <h4 className="text-indigo-800 dark:text-indigo-200 font-semibold mb-3">
                        📅 Ukázka kalendářního zobrazení:
                      </h4>
                      <div className="bg-white dark:bg-gray-800 rounded border p-4">
                        <div className="grid grid-cols-7 gap-1 mb-4">
                          <div className="text-center text-xs font-medium text-gray-500 p-1">Po</div>
                          <div className="text-center text-xs font-medium text-gray-500 p-1">Út</div>
                          <div className="text-center text-xs font-medium text-gray-500 p-1">St</div>
                          <div className="text-center text-xs font-medium text-gray-500 p-1">Čt</div>
                          <div className="text-center text-xs font-medium text-gray-500 p-1">Pá</div>
                          <div className="text-center text-xs font-medium text-gray-500 p-1">So</div>
                          <div className="text-center text-xs font-medium text-gray-500 p-1">Ne</div>
                          
                          <div className="text-center text-xs p-2 text-gray-400">1</div>
                          <div className="text-center text-xs p-2 text-gray-400">2</div>
                          <div className="text-center text-xs p-2 bg-blue-100 dark:bg-blue-800 rounded cursor-pointer">
                            <div className="text-blue-700 dark:text-blue-300 font-medium">3</div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                          </div>
                          <div className="text-center text-xs p-2 bg-green-100 dark:bg-green-800 rounded cursor-pointer">
                            <div className="text-green-700 dark:text-green-300 font-medium">4</div>
                            <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                          </div>
                          <div className="text-center text-xs p-2 text-gray-700 dark:text-gray-300">5</div>
                          <div className="text-center text-xs p-2 text-gray-400">6</div>
                          <div className="text-center text-xs p-2 text-gray-400">7</div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span>Deník s poznámkami technologa</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span>Kompletní deník se všemi údaji</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {aktivniKrok === 5 && (
                  <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
                    <h4 className="text-purple-800 dark:text-purple-200 font-semibold mb-3">
                      🔧 Ukázka technologického rozhraní:
                    </h4>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded border space-y-3">
                      <div className="flex border-b">
                        <button className="px-3 py-2 text-sm bg-blue-100 text-blue-700 border-b-2 border-blue-500">📝 Správa poznámek</button>
                        <button className="px-3 py-2 text-sm text-gray-500">📚 Správa deníků</button>
                        <button className="px-3 py-2 text-sm text-gray-500">💾 Zálohy</button>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        <p>• Vytváření poznámek pro konkrétní směny</p>
                        <p>• Editace a mazání existujících deníků</p>
                        <p>• Export a import záloh</p>
                        <p>• Pokročilé filtry a vyhledávání</p>
                      </div>
                    </div>
                  </div>
                )}

                {aktivniKrok === 6 && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
                      <h4 className="text-orange-800 dark:text-orange-200 font-semibold mb-3">
                        🎨 Možnosti personalizace:
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Režim zobrazení</span>
                            <div className="flex gap-1">
                              <button className="w-8 h-8 bg-white border-2 border-blue-500 rounded text-xs">☀️</button>
                              <button className="w-8 h-8 bg-gray-800 border-2 border-gray-400 rounded text-xs">🌙</button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Světlý nebo tmavý vzhled</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Jazyk rozhraní</span>
                            <select className="text-xs border rounded px-2 py-1">
                              <option>🇨🇿 Čeština</option>
                              <option>🇬🇧 English</option>
                            </select>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Volba jazyka aplikace</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Automatické ukládání</span>
                            <div className="w-10 h-6 bg-green-500 rounded-full p-1">
                              <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Data se ukládají průběžně</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {aktivniKrok === 5 && (
                  <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
                    <h4 className="text-purple-800 dark:text-purple-200 font-semibold mb-3">
                      🔧 Ukázka technologického rozhraní:
                    </h4>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded border space-y-3">
                      <div className="flex border-b">
                        <button className="px-3 py-2 text-sm bg-blue-100 text-blue-700 border-b-2 border-blue-500">📝 Správa poznámek</button>
                        <button className="px-3 py-2 text-sm text-gray-500">📚 Správa deníků</button>
                        <button className="px-3 py-2 text-sm text-gray-500">💾 Zálohy</button>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        <p>• Vytváření poznámek pro konkrétní směny</p>
                        <p>• Editace a mazání existujících deníků</p>
                        <p>• Export a import záloh</p>
                        <p>• Pokročilé filtry a vyhledávání</p>
                      </div>
                    </div>
                  </div>
                )}

                {aktivniKrok === 7 && (
                  <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                    <h4 className="text-green-800 dark:text-green-200 font-semibold mb-3">
                      📄 Ukázka exportovaného PDF:
                    </h4>
                    <div className="bg-white p-4 rounded border shadow-sm">
                      <div className="text-center border-b pb-2 mb-3">
                        <h5 className="font-bold text-gray-800">PRACOVNÍ DENÍK</h5>
                        <p className="text-sm text-gray-600">SOLO500 - Ranní směna</p>
                      </div>
                      <div className="text-xs space-y-1 text-gray-700">
                        <p><strong>Datum:</strong> 14.07.2025</p>
                        <p><strong>Vedoucí směny:</strong> Jan Novák</p>
                        <p><strong>Obsluha:</strong> Petr Svoboda, Marie Dvořáková</p>
                      </div>
                      <div className="mt-3 p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600">📊 Tabulka pracovních záznamů</p>
                        <p className="text-xs text-gray-600">🔧 Poznámky technologa</p>
                        <p className="text-xs text-gray-600">✅ Potvrzení předání směny</p>
                      </div>
                    </div>
                  </div>
                )}

                {aktivniKrok === 8 && (
                  <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4">
                    <h4 className="text-red-800 dark:text-red-200 font-semibold mb-3">
                      🔄 Důležitost zálohování:
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <div className="flex items-center mb-2">
                          <span className="text-green-500 mr-2">✅</span>
                          <span className="text-sm font-medium">Pravidelné zálohování</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Týdenní export všech dat</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-500 mr-2">⚠️</span>
                          <span className="text-sm font-medium">Testování obnovy</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Měsíční ověření funkčnosti záloh</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <div className="flex items-center mb-2">
                          <span className="text-red-500 mr-2">❌</span>
                          <span className="text-sm font-medium">Rizika ztráty dat</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Vymazání cache, selhání PC, přeinstalace systému</p>
                      </div>
                    </div>
                  </div>
                )}

                {(aktivniKrok === 9 || aktivniKrok === 10) && (
                  <div className="bg-indigo-50 dark:bg-indigo-900 rounded-lg p-4">
                    <h4 className="text-indigo-800 dark:text-indigo-200 font-semibold mb-3">
                      {aktivniKrok === 9 ? "🔒 Bezpečnostní pravidla:" : "🛠️ Časté problémy a řešení:"}
                    </h4>
                    {aktivniKrok === 9 ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start">
                          <span className="text-green-500 mr-2 mt-0.5">🔐</span>
                          <span>Nikdy nesdílejte přístupová hesla</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-blue-500 mr-2 mt-0.5">💾</span>
                          <span>Data jsou uložena pouze lokálně</span>
                        </div>
                        <div className="flex items-start">
                          <span className="text-yellow-500 mr-2 mt-0.5">🚪</span>
                          <span>Vždy se odhlaste na sdílených PC</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded">
                          <p className="font-medium text-sm">❓ Problém: Nezobrazují se data</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">💡 Řešení: Obnovte stránku (F5) a zkontrolujte internet</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded">
                          <p className="font-medium text-sm">❓ Problém: Pomalý běh aplikace</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">💡 Řešení: Vyčistěte cache prohlížeče</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded">
                          <p className="font-medium text-sm">❓ Problém: Ztracená data</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">💡 Řešení: Obnovte z nejnovější zálohy</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigace */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={predchoziKrok}
                  disabled={aktivniKrok === 1}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Předchozí
                </button>
                
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Krok {aktivniKrok} z {NAVOD_KROKY.length}
                </span>
                
                <button
                  onClick={dalsiKrok}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {aktivniKrok === NAVOD_KROKY.length ? 'Dokončit' : 'Další →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
