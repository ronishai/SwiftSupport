import type { TicketStatus } from '@swift-support/shared';
import { useLocale } from '../hooks/useLocale';

const variantClasses: Record<TicketStatus, string> = {
  new: 'bg-rose-50 text-rose-700 border-rose-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  pending: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const statusTranslationKeys: Record<TicketStatus, 'statusNew' | 'statusInProgress' | 'statusPending' | 'statusClosed'> = {
  new: 'statusNew',
  'in-progress': 'statusInProgress',
  pending: 'statusPending',
  closed: 'statusClosed',
};

export default function StatusBadge({ status }: { status: TicketStatus }) {
  const { t } = useLocale();
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${variantClasses[status]}`}
    >
      {t(statusTranslationKeys[status])}
    </span>
  );
}
