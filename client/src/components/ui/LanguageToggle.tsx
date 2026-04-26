import { Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  const nextLanguage = language === 'en' ? 'km' : 'en';

  return (
    <button
      className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface/80 px-3 py-2 text-sm font-semibold text-muted shadow-sm hover:text-text"
      onClick={() => setLanguage(nextLanguage)}
      type="button"
    >
      <Languages className="h-4 w-4" />
      <span>{t('language.toggle')}</span>
    </button>
  );
}
