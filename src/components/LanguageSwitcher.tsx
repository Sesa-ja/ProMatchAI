import { useState } from 'react';
import { Language } from '../App';
import { Languages, Check } from 'lucide-react';
import { languageNames } from '../utils/translations';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export default function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const languages: Language[] = ['en', 'ar', 'fr', 'de', 'uk', 'es', 'it', 'tr', 'fa', 'ru'];

  const handleLanguageSelect = (language: Language) => {
    onLanguageChange(language);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full border border-sky-100 bg-white p-2 shadow-[0_8px_20px_rgba(96,165,250,0.10)] transition-all hover:border-sky-200 hover:shadow-[0_10px_22px_rgba(96,165,250,0.14)]"
        aria-label="Change language"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[linear-gradient(135deg,#60a5fa_0%,#8b5cf6_100%)] text-white">
          <Languages className="w-3 h-3" />
        </span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 z-50 mt-2 max-h-80 w-52 overflow-y-auto rounded-2xl border border-sky-100 bg-white p-1.5 shadow-[0_18px_40px_rgba(148,163,184,0.22)]">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageSelect(lang)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                  currentLanguage === lang ? 'bg-sky-50' : 'hover:bg-slate-50'
                }`}
              >
                <span className={`text-sm ${currentLanguage === lang ? 'font-semibold text-sky-700' : 'text-slate-700'}`}>
                  {languageNames[lang]}
                </span>
                {currentLanguage === lang && (
                  <Check className="w-4 h-4 text-sky-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
