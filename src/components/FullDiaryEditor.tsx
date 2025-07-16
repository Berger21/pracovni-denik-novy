'use client';

import { useState, useEffect } from 'react';
import { UlozenyDenik, ZakladniUdaje, PracovniZaznam, TypSmeny, TypTechnologie, TehnologovePoznaky } from '@/types';
import { ulozitDenik, najitPoznamkyProDatumASmenuSync } from '@/lib/storage';

interface FullDiaryEditorProps {
  existingDenik: UlozenyDenik;
  onSave: () => void;
  onClose: () => void;
}

const SMENY = ['ranní', 'odpolední', 'noční', 'denní'] as const;
const TECHNOLOGIE = ['SOLO500', 'IPSEN', 'VAKUUM', 'P.K'] as const;

const PECE: Record<string, string[]> = {
  'SOLO500': ['SOLO500 pec 1', 'SOLO500 pec 2'],
  'IPSEN': ['TQF1', 'TQF2', 'HSH'],
  'VAKUUM': ['SWDP1', 'SWDP2', 'TAV861', 'TAV980', 'NTC', 'NIT'],
  'P.K': ['P.K pec 1', 'P.K pec 2']
};

export default function FullDiaryEditor({ existingDenik, onSave, onClose }: FullDiaryEditorProps) {
  const [editovanyDenik, setEditovanyDenik] = useState<UlozenyDenik>(existingDenik);
  const [novyZaznam, setNovyZaznam] = useState<PracovniZaznam>({
    id: Date.now(),
    datum: new Date().toISOString(),
    sarze: '',
    cislo_zakazky: '',
    popis_zakazky: '',
    odberatel: '',
    pec: '',
    cinnost: '',
    poznamky: '',
    cas_od: '',
    cas_do: ''
  });
  const [editovanyIndex, setEditovanyIndex] = useState<number | null>(null);
  const [technologovePoznamky, setTechnologovePoznamky] = useState<TehnologovePoznaky[]>([]);

  // Načtení poznámek technologa
  useEffect(() => {
    const poznamky = najitPoznamkyProDatumASmenuSync(
      editovanyDenik.zakladniUdaje.datum,
      editovanyDenik.zakladniUdaje.smena as TypSmeny,
      editovanyDenik.zakladniUdaje.technologie as TypTechnologie
    );
    setTechnologovePoznamky(poznamky);
  }, [editovanyDenik.zakladniUdaje.datum, editovanyDenik.zakladniUdaje.smena, editovanyDenik.zakladniUdaje.technologie]);

  const handleZakladniUdajeChange = (field: keyof ZakladniUdaje, value: string) => {
    setEditovanyDenik(prev => ({
      ...prev,
      zakladniUdaje: {
        ...prev.zakladniUdaje,
        [field]: value
      }
    }));
  };

  const handlePotvrzeniChange = (field: 'smenu_predal' | 'smenu_prevzal', value: string) => {
    setEditovanyDenik(prev => ({
      ...prev,
      potvrzeni: {
        ...prev.potvrzeni,
        [field]: value
      }
    }));
  };

  const pridatZaznam = () => {
    if (!novyZaznam.sarze || !novyZaznam.cislo_zakazky || !novyZaznam.popis_zakazky || !novyZaznam.pec) {
      alert('Vyplňte povinná pole (šarže, zakázka, popis, pec)');
      return;
    }

    const zaznam: PracovniZaznam = {
      ...novyZaznam
    };

    setEditovanyDenik(prev => ({
      ...prev,
      zaznamy: [...prev.zaznamy, zaznam]
    }));

    // Reset formuláře
    setNovyZaznam({
      id: Date.now(),
      datum: new Date().toISOString(),
      sarze: '',
      cislo_zakazky: '',
      popis_zakazky: '',
      odberatel: '',
      pec: '',
      cinnost: '',
      poznamky: '',
      cas_od: '',
      cas_do: ''
    });
  };

  const editovatZaznam = (index: number) => {
    setNovyZaznam(editovanyDenik.zaznamy[index]);
    setEditovanyIndex(index);
  };

  const ulozitEditovanyZaznam = () => {
    if (editovanyIndex !== null) {
      const novyZaznamy = [...editovanyDenik.zaznamy];
      novyZaznamy[editovanyIndex] = novyZaznam;
      
      setEditovanyDenik(prev => ({
        ...prev,
        zaznamy: novyZaznamy
      }));
      
      setEditovanyIndex(null);
      setNovyZaznam({
        id: Date.now(),
        datum: new Date().toISOString(),
        sarze: '',
        cislo_zakazky: '',
        popis_zakazky: '',
        odberatel: '',
        pec: '',
        cinnost: '',
        poznamky: '',
        cas_od: '',
        cas_do: ''
      });
    }
  };

  const smazatZaznam = (index: number) => {
    if (confirm('Opravdu chcete smazat tento záznam?')) {
      const novyZaznamy = editovanyDenik.zaznamy.filter((_, i) => i !== index);
      setEditovanyDenik(prev => ({
        ...prev,
        zaznamy: novyZaznamy
      }));
    }
  };

  const handleSave = async () => {
    try {
      await ulozitDenik(editovanyDenik);
      onSave();
    } catch (error) {
      console.error('Chyba při ukládání:', error);
      alert('Chyba při ukládání deníku');
    }
  };

  const formatDatum = (datum: string) => {
    return new Date(datum).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              ✏️ Kompletní editace pracovního deníku
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Základní údaje */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Základní údaje</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                <input
                  type="date"
                  value={editovanyDenik.zakladniUdaje.datum}
                  onChange={(e) => handleZakladniUdajeChange('datum', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technologie</label>
                <select
                  value={editovanyDenik.zakladniUdaje.technologie}
                  onChange={(e) => handleZakladniUdajeChange('technologie', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TECHNOLOGIE.map(tech => (
                    <option key={tech} value={tech}>{tech}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Směna</label>
                <select
                  value={editovanyDenik.zakladniUdaje.smena}
                  onChange={(e) => handleZakladniUdajeChange('smena', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SMENY.map(smena => (
                    <option key={smena} value={smena}>{smena}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vedoucí směny</label>
                <input
                  type="text"
                  value={editovanyDenik.zakladniUdaje.vedouci_smeny}
                  onChange={(e) => handleZakladniUdajeChange('vedouci_smeny', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Čas od</label>
                <input
                  type="time"
                  value={editovanyDenik.zakladniUdaje.cas_od}
                  onChange={(e) => handleZakladniUdajeChange('cas_od', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Čas do</label>
                <input
                  type="time"
                  value={editovanyDenik.zakladniUdaje.cas_do}
                  onChange={(e) => handleZakladniUdajeChange('cas_do', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Obsluha linky</label>
                <textarea
                  value={editovanyDenik.zakladniUdaje.obsluha_linky}
                  onChange={(e) => handleZakladniUdajeChange('obsluha_linky', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Poznámky vedoucího</label>
                <textarea
                  value={editovanyDenik.zakladniUdaje.poznamky_vedouciho || ''}
                  onChange={(e) => handleZakladniUdajeChange('poznamky_vedouciho', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Poznámky technologa */}
          {technologovePoznamky.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">🔧 Poznámky od technologa:</h3>
              {technologovePoznamky.map((poznamka) => (
                <div key={poznamka.id} className="text-blue-700 mb-2 p-2 bg-white rounded border-l-2 border-blue-300">
                  <div className="font-medium text-sm text-blue-600 mb-1">
                    {poznamka.autor} - {formatDatum(poznamka.datum)}
                  </div>
                  <div className="whitespace-pre-wrap">{poznamka.poznamka}</div>
                </div>
              ))}
            </div>
          )}

          {/* Formulář pro nový/editovaný záznam */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editovanyIndex !== null ? '✏️ Editace záznamu' : '➕ Nový záznam práce'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Šarže *</label>
                <input
                  type="text"
                  value={novyZaznam.sarze}
                  onChange={(e) => setNovyZaznam({...novyZaznam, sarze: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Výrobní zakázka *</label>
                <input
                  type="text"
                  value={novyZaznam.cislo_zakazky}
                  onChange={(e) => setNovyZaznam({...novyZaznam, cislo_zakazky: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Název zboží *</label>
                <input
                  type="text"
                  value={novyZaznam.popis_zakazky}
                  onChange={(e) => setNovyZaznam({...novyZaznam, popis_zakazky: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Odběratel</label>
                <input
                  type="text"
                  value={novyZaznam.odberatel}
                  onChange={(e) => setNovyZaznam({...novyZaznam, odberatel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pec *</label>
                <select
                  value={novyZaznam.pec}
                  onChange={(e) => setNovyZaznam({...novyZaznam, pec: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Vyberte pec</option>
                  {editovanyDenik.zakladniUdaje.technologie && PECE[editovanyDenik.zakladniUdaje.technologie] && 
                    PECE[editovanyDenik.zakladniUdaje.technologie].map(pec => (
                      <option key={pec} value={pec}>{pec}</option>
                    ))
                  }
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Činnost</label>
                <input
                  type="text"
                  value={novyZaznam.cinnost}
                  onChange={(e) => setNovyZaznam({...novyZaznam, cinnost: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Čas od</label>
                <input
                  type="time"
                  value={novyZaznam.cas_od}
                  onChange={(e) => setNovyZaznam({...novyZaznam, cas_od: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Čas do</label>
                <input
                  type="time"
                  value={novyZaznam.cas_do}
                  onChange={(e) => setNovyZaznam({...novyZaznam, cas_do: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Poznámky</label>
              <textarea
                value={novyZaznam.poznamky}
                onChange={(e) => setNovyZaznam({...novyZaznam, poznamky: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              {editovanyIndex !== null ? (
                <>
                  <button
                    onClick={ulozitEditovanyZaznam}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    ✅ Uložit změny
                  </button>
                  <button
                    onClick={() => {
                      setEditovanyIndex(null);
                      setNovyZaznam({
                        id: Date.now(),
                        datum: new Date().toISOString(),
                        sarze: '',
                        cislo_zakazky: '',
                        popis_zakazky: '',
                        odberatel: '',
                        pec: '',
                        cinnost: '',
                        poznamky: '',
                        cas_od: '',
                        cas_do: ''
                      });
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    ❌ Zrušit editaci
                  </button>
                </>
              ) : (
                <button
                  onClick={pridatZaznam}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  ➕ Přidat záznam
                </button>
              )}
            </div>
          </div>

          {/* Seznam záznamů */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📋 Záznamy práce ({editovanyDenik.zaznamy.length})
            </h3>
            
            {editovanyDenik.zaznamy.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Zatím nejsou žádné záznamy práce</p>
            ) : (
              <div className="space-y-3">
                {editovanyDenik.zaznamy.map((zaznam, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {zaznam.sarze} - {zaznam.popis_zakazky}
                        </h4>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="mr-4">📦 {zaznam.cislo_zakazky}</span>
                          <span className="mr-4">🔥 {zaznam.pec}</span>
                          {zaznam.cas_od && zaznam.cas_do && (
                            <span>⏰ {zaznam.cas_od} - {zaznam.cas_do}</span>
                          )}
                        </div>
                        {zaznam.poznamky && (
                          <p className="text-sm text-gray-600 mt-1">{zaznam.poznamky}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editovatZaznam(index)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => smazatZaznam(index)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Potvrzení předání/převzetí */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">✅ Potvrzení předání/převzetí</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Směnu předal</label>
                <input
                  type="text"
                  value={editovanyDenik.potvrzeni.smenu_predal}
                  onChange={(e) => handlePotvrzeniChange('smenu_predal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Směnu převzal</label>
                <input
                  type="text"
                  value={editovanyDenik.potvrzeni.smenu_prevzal}
                  onChange={(e) => handlePotvrzeniChange('smenu_prevzal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Akční tlačítka */}
          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ❌ Zrušit
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              💾 Uložit změny
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
