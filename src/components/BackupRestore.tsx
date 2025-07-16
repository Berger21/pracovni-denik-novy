'use client';

import { useState, useEffect } from 'react';
import { nacistDeniky, nacistUpozorneni, nacistTehnologovePoznamky } from '@/lib/storage';
import { UlozenyDenik, UpozorneniPravidlo, TehnologovePoznaky } from '@/types';

interface BackupRestoreProps {
  onClose: () => void;
}

interface BackupData {
  version: string;
  timestamp: string;
  deniky: UlozenyDenik[];
  upozorneni: UpozorneniPravidlo[];
  poznamky: TehnologovePoznaky[];
}

export default function BackupRestore({ onClose }: BackupRestoreProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [storageInfo, setStorageInfo] = useState({
    deniky: 0,
    upozorneni: 0,
    poznamky: 0,
    sizeKB: 0
  });

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const exportData = async () => {
    setIsExporting(true);
    
    try {
      // Získáme všechna data
      const deniky = await nacistDeniky();
      const upozorneni = nacistUpozorneni();
      const poznamky = await nacistTehnologovePoznamky();
      
      const backupData: BackupData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        deniky,
        upozorneni,
        poznamky
      };
      
      // Vytvoříme soubor ke stažení
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `pracovni-denik-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      showMessage('✅ Backup byl úspěšně exportován!', 'success');
      
    } catch (error) {
      console.error('Chyba při exportu:', error);
      showMessage('❌ Nastala chyba při exportu dat.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);
      
      // Validace struktury
      if (!backupData.version || !backupData.timestamp || !backupData.deniky) {
        throw new Error('Neplatná struktura backup souboru');
      }
      
      // Zobrazíme potvrzovací dialog
      const confirmMessage = `
        Chcete importovat backup z ${new Date(backupData.timestamp).toLocaleString('cs-CZ')}?
        
        Obsahuje:
        - ${backupData.deniky.length} pracovních deníků
        - ${backupData.upozorneni?.length || 0} upozornění
        - ${backupData.poznamky?.length || 0} poznámek technologa
        
        POZOR: Tato operace přepíše všechna současná data!
      `;
      
      if (!confirm(confirmMessage)) {
        setIsImporting(false);
        return;
      }
      
      // Uložíme data do localStorage
      localStorage.setItem('pracovni_deniky', JSON.stringify(backupData.deniky));
      localStorage.setItem('upozorneni_pravidla', JSON.stringify(backupData.upozorneni || []));
      localStorage.setItem('technolog_poznamky', JSON.stringify(backupData.poznamky || []));
      
      showMessage('✅ Data byla úspěšně importována! Stránka se obnoví.', 'success');
      
      // Obnovíme stránku po krátké pauze
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Chyba při importu:', error);
      showMessage('❌ Nastala chyba při importu dat. Zkontrolujte formát souboru.', 'error');
    } finally {
      setIsImporting(false);
    }
    
    // Vyčistíme input
    event.target.value = '';
  };

  const clearAllData = () => {
    const confirmMessage = `
      POZOR: Chcete smazat všechna data?
      
      Tato operace smaže:
      - Všechny pracovní deníky
      - Všechna upozornění
      - Všechny poznámky technologa
      - Všechny statistiky
      
      Tato operace je NEVRATNÁ!
    `;
    
    if (!confirm(confirmMessage)) return;
    
    if (!confirm('Opravdu chcete smazat všechna data? Tato operace je nevratná!')) return;
    
    try {
      localStorage.removeItem('pracovni_deniky');
      localStorage.removeItem('upozorneni_pravidla');
      localStorage.removeItem('technolog_poznamky');
      localStorage.removeItem('statistiky');
      
      showMessage('✅ Všechna data byla smazána. Stránka se obnoví.', 'success');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Chyba při mazání dat:', error);
      showMessage('❌ Nastala chyba při mazání dat.', 'error');
    }
  };

  const getStorageInfo = async () => {
    const deniky = await nacistDeniky();
    const upozorneni = nacistUpozorneni();
    const poznamky = await nacistTehnologovePoznamky();
    
    // Odhad velikosti dat
    const dataSize = JSON.stringify({
      deniky,
      upozorneni,
      poznamky
    }).length;
    
    return {
      deniky: deniky.length,
      upozorneni: upozorneni.length,
      poznamky: poznamky.length,
      sizeKB: Math.round(dataSize / 1024)
    };
  };

  useEffect(() => {
    const loadStorageInfo = async () => {
      try {
        const info = await getStorageInfo();
        setStorageInfo(info);
      } catch (error) {
        console.error('Chyba při načítání storage info:', error);
      }
    };
    
    loadStorageInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 fade-in">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              💾 Backup a obnova
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Zálohování a obnovení dat aplikace
            </p>
          </div>
          <button onClick={onClose} className="modern-button secondary mt-4 sm:mt-0">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Zavřít
          </button>
        </div>

        {/* Zprávy */}
        {message && (
          <div className={`modern-card p-4 mb-6 ${
            messageType === 'success' ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700' :
            messageType === 'error' ? 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700' :
            'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
          }`}>
            <p className={`font-medium ${
              messageType === 'success' ? 'text-green-800 dark:text-green-200' :
              messageType === 'error' ? 'text-red-800 dark:text-red-200' :
              'text-blue-800 dark:text-blue-200'
            }`}>
              {message}
            </p>
          </div>
        )}

        {/* Přehled dat */}
        <div className="modern-card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">📊 Přehled dat</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {storageInfo.deniky}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pracovní deníky</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {storageInfo.upozorneni}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Upozornění</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {storageInfo.poznamky}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Poznámky</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {storageInfo.sizeKB} KB
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Velikost dat</div>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="modern-card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">📤 Export dat</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Exportuje všechna data do JSON souboru, který můžete uložit jako zálohu.
          </p>
          <button
            onClick={exportData}
            disabled={isExporting}
            className="modern-button success"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exportuji...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportovat data
              </>
            )}
          </button>
        </div>

        {/* Import */}
        <div className="modern-card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">📥 Import dat</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Importuje data z JSON souboru. <strong>Pozor:</strong> Tato operace přepíše všechna současná data!
          </p>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".json"
              onChange={importData}
              disabled={isImporting}
              className="modern-input"
            />
            {isImporting && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                <span>Importuji data...</span>
              </div>
            )}
          </div>
        </div>

        {/* Smazání dat */}
        <div className="modern-card p-6 border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900">
          <h3 className="text-lg font-semibold mb-4 text-red-800 dark:text-red-200">
            🗑️ Smazání všech dat
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-4">
            <strong>Nebezpečná operace!</strong> Smaže všechna data v aplikaci. Tato operace je nevratná.
          </p>
          <button
            onClick={clearAllData}
            className="modern-button danger"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Smazat všechna data
          </button>
        </div>

        {/* Informace o backup */}
        <div className="modern-card p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">ℹ️ Informace o zálohování</h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Export:</strong> Vytvoří JSON soubor obsahující všechna data aplikace. 
              Soubor můžete uložit na své zařízení jako zálohu.
            </p>
            <p>
              <strong>Import:</strong> Obnoví data z JSON souboru. Všechna současná data budou nahrazena.
            </p>
            <p>
              <strong>Formát:</strong> Data jsou uložena v JSON formátu s verzí pro zajištění kompatibility.
            </p>
            <p>
              <strong>Bezpečnost:</strong> Všechna data jsou uložena pouze lokálně ve vašem prohlížeči.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
