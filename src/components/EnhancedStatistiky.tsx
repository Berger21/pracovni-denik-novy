'use client';

import { useState, useEffect, useCallback } from 'react';
import { UlozenyDenik, ZaznamStatistiky, TypSmeny, TypTechnologie } from '@/types';
import { nacistDeniky, nacistStatistiky } from '@/lib/storage';

interface StatistikyProps {
  onClose: () => void;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export default function EnhancedStatistiky({ onClose }: StatistikyProps) {
  const [deniky, setDeniky] = useState<UlozenyDenik[]>([]);
  const [filter, setFilter] = useState({
    datumOd: '',
    datumDo: '',
    technologie: '' as TypTechnologie | '',
    smena: '' as TypSmeny | ''
  });
  const [aktivniGraf, setAktivniGraf] = useState<'smeny' | 'technologie' | 'denni'>('smeny');

  useEffect(() => {
    nactiData();
  }, []);

  const nactiData = async () => {
    try {
      const nacteneDeniky = await nacistDeniky();
      setDeniky(nacteneDeniky);
      
      // Načteme statistiky přímo z localStorage, ale neukládáme je do state
      nacistStatistiky();
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
      setDeniky([]);
    }
  };

  const vypocitejStatistiky = useCallback(() => {
    const filtrovaeDeniky = deniky.filter(d => {
      const datum = new Date(d.zakladniUdaje.datum);
      const datumOd = filter.datumOd ? new Date(filter.datumOd) : null;
      const datumDo = filter.datumDo ? new Date(filter.datumDo) : null;
      
      return (!datumOd || datum >= datumOd) &&
             (!datumDo || datum <= datumDo) &&
             (!filter.technologie || d.zakladniUdaje.technologie === filter.technologie) &&
             (!filter.smena || d.zakladniUdaje.smena === filter.smena);
    });

    const stats: ZaznamStatistiky = {
      celkovyPocet: filtrovaeDeniky.length,
      celkovyCas: 0,
      smeny: { 'ranní': 0, 'odpolední': 0, 'noční': 0, 'denní': 0 },
      denni: {},
      zakazky: {},
      technologie: { 'SOLO500': 0, 'IPSEN': 0, 'VAKUUM': 0, 'P.K': 0 },
      posledniAktivita: filtrovaeDeniky.length > 0 ? filtrovaeDeniky[0].vytvoren : ''
    };

    filtrovaeDeniky.forEach(denik => {
      // Počítání směn
      if (denik.zakladniUdaje.smena) {
        stats.smeny[denik.zakladniUdaje.smena]++;
      }
      
      // Počítání technologií
      if (denik.zakladniUdaje.technologie) {
        stats.technologie[denik.zakladniUdaje.technologie]++;
      }
      
      // Počítání podle dnů
      const den = new Date(denik.zakladniUdaje.datum).toLocaleDateString('cs-CZ');
      stats.denni[den] = (stats.denni[den] || 0) + 1;
      
      // Počítání zakázek
      denik.zaznamy.forEach(zaznam => {
        if (zaznam.cislo_zakazky) {
          stats.zakazky[zaznam.cislo_zakazky] = (stats.zakazky[zaznam.cislo_zakazky] || 0) + 1;
        }
      });
    });

    return stats;
  }, [deniky, filter]);

  const statistikyData = vypocitejStatistiky();

  const getChartData = (typ: 'smeny' | 'technologie' | 'denni'): ChartData[] => {
    const colors = {
      smeny: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      technologie: ['#8b5cf6', '#06b6d4', '#84cc16', '#f97316'],
      denni: ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6']
    };

    switch (typ) {
      case 'smeny':
        return Object.entries(statistikyData.smeny).map(([key, value], index) => ({
          name: key,
          value,
          color: colors.smeny[index] || '#6b7280'
        }));
      case 'technologie':
        return Object.entries(statistikyData.technologie).map(([key, value], index) => ({
          name: key,
          value,
          color: colors.technologie[index] || '#6b7280'
        }));
      case 'denni':
        return Object.entries(statistikyData.denni)
          .slice(-7) // Posledních 7 dnů
          .map(([key, value], index) => ({
            name: key,
            value,
            color: colors.denni[index] || '#6b7280'
          }));
      default:
        return [];
    }
  };

  const SimpleChart = ({ data }: { data: ChartData[] }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-20 text-sm text-gray-600 dark:text-gray-400 truncate">
              {item.name}
            </div>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
            <div className="w-8 text-sm font-semibold text-gray-900 dark:text-white">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const exportStatistiky = () => {
    const csvData = [
      ['Typ', 'Název', 'Počet'],
      ...Object.entries(statistikyData.smeny).map(([key, value]) => ['Směna', key, value]),
      ...Object.entries(statistikyData.technologie).map(([key, value]) => ['Technologie', key, value]),
      ...Object.entries(statistikyData.denni).map(([key, value]) => ['Den', key, value])
    ];

    const csvContent = csvData.map(row => row.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `statistiky_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 fade-in">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              📊 Statistiky a analýzy
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Přehled pracovních deníků a aktivit
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={exportStatistiky}
              className="modern-button secondary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button onClick={onClose} className="modern-button secondary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Zavřít
            </button>
          </div>
        </div>

        {/* Filtry */}
        <div className="modern-card p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">🔍 Filtry</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Datum od</label>
              <input
                type="date"
                value={filter.datumOd}
                onChange={(e) => setFilter({...filter, datumOd: e.target.value})}
                className="modern-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Datum do</label>
              <input
                type="date"
                value={filter.datumDo}
                onChange={(e) => setFilter({...filter, datumDo: e.target.value})}
                className="modern-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Technologie</label>
              <select
                value={filter.technologie}
                onChange={(e) => setFilter({...filter, technologie: e.target.value as TypTechnologie | ''})}
                className="modern-select"
              >
                <option value="">Všechny</option>
                <option value="SOLO500">SOLO500</option>
                <option value="IPSEN">IPSEN</option>
                <option value="VAKUUM">VAKUUM</option>
                <option value="P.K">P.K</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Směna</label>
              <select
                value={filter.smena}
                onChange={(e) => setFilter({...filter, smena: e.target.value as TypSmeny | ''})}
                className="modern-select"
              >
                <option value="">Všechny</option>
                <option value="ranní">Ranní</option>
                <option value="odpolední">Odpolední</option>
                <option value="noční">Noční</option>
                <option value="denní">Denní</option>
              </select>
            </div>
          </div>
        </div>

        {/* Přehledové karty */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="modern-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Celkem deníků</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistikyData.celkovyPocet}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="modern-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktivní technologie</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.values(statistikyData.technologie).filter(v => v > 0).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="modern-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Zakázky</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.keys(statistikyData.zakazky).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="modern-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktivní dny</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.keys(statistikyData.denni).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Grafy */}
        <div className="modern-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h3 className="text-lg font-semibold">📈 Analýzy</h3>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <button
                onClick={() => setAktivniGraf('smeny')}
                className={`modern-button ${aktivniGraf === 'smeny' ? 'primary' : 'secondary'}`}
              >
                Směny
              </button>
              <button
                onClick={() => setAktivniGraf('technologie')}
                className={`modern-button ${aktivniGraf === 'technologie' ? 'primary' : 'secondary'}`}
              >
                Technologie
              </button>
              <button
                onClick={() => setAktivniGraf('denni')}
                className={`modern-button ${aktivniGraf === 'denni' ? 'primary' : 'secondary'}`}
              >
                Posledních 7 dnů
              </button>
            </div>
          </div>

          <div className="h-80">
            <SimpleChart data={getChartData(aktivniGraf)} />
          </div>
        </div>

        {/* Nejčastější zakázky */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="modern-card p-6">
            <h3 className="text-lg font-semibold mb-4">🔧 Nejčastější zakázky</h3>
            <div className="space-y-3">
              {Object.entries(statistikyData.zakazky)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([zakazka, pocet], index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-medium text-gray-900 dark:text-white">{zakazka}</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      {pocet}×
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="modern-card p-6">
            <h3 className="text-lg font-semibold mb-4">📅 Nejaktivnější dny</h3>
            <div className="space-y-3">
              {Object.entries(statistikyData.denni)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([den, pocet], index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="font-medium text-gray-900 dark:text-white">{den}</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                      {pocet} deníků
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
