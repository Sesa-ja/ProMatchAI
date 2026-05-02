import { Languages, Sparkles } from 'lucide-react';
import { Language } from '../App';

interface TranslationIndicatorProps {
  language: Language;
  variant?: 'inline' | 'badge';
}

const languageNames: Record<Language, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  de: 'Deutsch',
  uk: 'Українська',
  es: 'Español',
};

export default function TranslationIndicator({ language, variant = 'inline' }: TranslationIndicatorProps) {
  if (language === 'en') {
    // Don't show indicator for English (default language)
    return null;
  }

  if (variant === 'badge') {
    return (
      <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs border border-blue-200">
        <Sparkles className="w-3 h-3" />
        <Languages className="w-3 h-3" />
        <span>Translated by AI</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
      <div className="flex items-center gap-1 text-blue-600">
        <Sparkles className="w-3.5 h-3.5" />
        <Languages className="w-3.5 h-3.5" />
      </div>
      <span>Content translated to <strong>{languageNames[language]}</strong> by AI</span>
    </div>
  );
}
