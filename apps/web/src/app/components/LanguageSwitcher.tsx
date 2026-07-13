import { useLocale } from '../hooks/useLocale';
import Button from './ui/Button';

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLocale();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-100 font-semibold">
        {t('language')}:
      </span>
      <Button
        type="button"
        variant={lang === 'en' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setLang('en')}
      >
        {t('english')}
      </Button>
      <Button
        type="button"
        variant={lang === 'he' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setLang('he')}
      >
        {t('hebrew')}
      </Button>
    </div>
  );
}
