import { useSettings } from '../hooks/useSettings';
import { useLocale } from '../hooks/useLocale';

interface Props {
  filters: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export default function FilterPanel({ filters, onChange }: Props) {
  const selectClass =
    'w-full sm:w-[160px] px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-sm shadow-xs focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 truncate cursor-pointer';

  const { data: settings } = useSettings();
  const { lang, t } = useLocale();

  return (
    <div
      className="grid grid-cols-2 md:flex md:flex-wrap gap-3 w-full"
      dir={lang === 'he' ? 'rtl' : 'ltr'}
    >
      <select
        className={selectClass}
        value={filters.status || ''}
        onChange={(e) => onChange('status', e.target.value)}
      >
        <option value="">{t('allStatuses')}</option>
        <option value="new">{t('statusNew')}</option>
        <option value="in-progress">{t('statusInProgress')}</option>
        <option value="pending">{t('statusPending')}</option>
        <option value="closed">{t('statusClosed')}</option>
      </select>
      <select
        className={selectClass}
        value={filters.priority || ''}
        onChange={(e) => onChange('priority', e.target.value)}
      >
        <option value="">{t('allPriorities')}</option>
        <option value="low">{t('priorityLow')}</option>
        <option value="medium">{t('priorityMedium')}</option>
        <option value="high">{t('priorityHigh')}</option>
        <option value="critical">{t('priorityCritical')}</option>
      </select>
      <select
        className={selectClass}
        value={filters.category || ''}
        onChange={(e) => onChange('category', e.target.value)}
      >
        <option value="">{t('allCategories')}</option>
        {settings?.categories?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label[lang] || c.label.en}
          </option>
        ))}
      </select>
      <input
        type="text"
        className={selectClass}
        value={filters.floor || ''}
        onChange={(e) => onChange('floor', e.target.value)}
        placeholder={t('allFloors')}
      />
    </div>
  );
}
