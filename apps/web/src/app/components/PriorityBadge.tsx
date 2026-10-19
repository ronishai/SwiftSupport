import type { Priority } from '@swift-support/shared';
import { useLocale } from '../hooks/useLocale';

const variantClasses: Record<Priority, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
};

const priorityTranslationKeys: Record<Priority, 'priorityLow' | 'priorityMedium' | 'priorityHigh' | 'priorityCritical'> = {
  low: 'priorityLow',
  medium: 'priorityMedium',
  high: 'priorityHigh',
  critical: 'priorityCritical',
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  const { t } = useLocale();
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${variantClasses[priority]}`}
    >
      {t(priorityTranslationKeys[priority])}
    </span>
  );
}
