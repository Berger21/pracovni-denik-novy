'use client';

import { useState } from 'react';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';

interface NavigationProps {
  zobrazeniRezim: 'denik' | 'technolog' | 'statistiky' | 'calendar' | 'backup' | 'zobrazit-denik';
  onChangeRezim: (rezim: 'denik' | 'technolog' | 'statistiky' | 'calendar' | 'backup' | 'zobrazit-denik') => void;
  onTechnologClick: () => void;
  technologOveren: boolean;
  currentStep?: number;
  maxSteps?: number;
}

export default function Navigation({ 
  zobrazeniRezim, 
  onChangeRezim, 
  onTechnologClick,
  technologOveren,
  currentStep = 1,
  maxSteps = 4
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      id: 'denik',
      label: 'Pracovní deník',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'technolog',
      label: 'Technolog',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'statistiky',
      label: 'Statistiky',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'calendar',
      label: 'Kalendář',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'backup',
      label: 'Zálohy',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      )
    }
  ];

  const handleNavigationClick = (id: string) => {
    if (id === 'technolog') {
      onTechnologClick();
    } else {
      onChangeRezim(id as 'denik' | 'technolog' | 'statistiky' | 'calendar' | 'backup');
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="modern-card mb-6 p-4 sticky top-0 z-40 bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
      <div className="flex items-center justify-between">
        {/* Logo a název */}
        <div className="flex items-center gap-4">
          <Image
            src="/logo-new.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Pracovní deník
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Moderní aplikace pro vedení deníků
            </p>
          </div>
        </div>

        {/* Desktop navigace */}
        <div className="hidden md:flex items-center gap-4">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigationClick(item.id)}
              className={`modern-button flex items-center gap-2 ${
                zobrazeniRezim === item.id ? 'primary' : 'secondary'
              }`}
            >
              {item.icon}
              {item.label}
              {item.id === 'technolog' && technologOveren && (
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </button>
          ))}
          <ThemeToggle />
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden modern-button secondary p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Progress bar pro deník */}
      {zobrazeniRezim === 'denik' && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Krok {currentStep} z {maxSteps}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {Math.round((currentStep / maxSteps) * 100)}%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(currentStep / maxSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigationClick(item.id)}
              className={`modern-button w-full flex items-center gap-2 ${
                zobrazeniRezim === item.id ? 'primary' : 'secondary'
              }`}
            >
              {item.icon}
              {item.label}
              {item.id === 'technolog' && technologOveren && (
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </button>
          ))}
          <div className="pt-2">
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
