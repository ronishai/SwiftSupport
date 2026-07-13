import type { Ticket } from '@swift-support/shared';
import { useSettings } from '../hooks/useSettings';
import { useLocale } from '../hooks/useLocale';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface Props {
  tickets: Ticket[];
  onSelect: (ticket: Ticket) => void;
}

export default function TicketTable({ tickets, onSelect }: Props) {
  const { data: settings } = useSettings();
  const { lang, t } = useLocale();
  if (!tickets.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-text-secondary">{t('noOpenTickets')}</p>
      </div>
    );
  }

  const isRtl = lang === 'he';

  return (
    <div className="space-y-3.5" dir={isRtl ? 'rtl' : 'ltr'}>
      {tickets.map((ticket) => {
        const borderColors = {
          low: isRtl ? 'border-r-emerald-500' : 'border-l-emerald-500',
          medium: isRtl ? 'border-r-amber-500' : 'border-l-amber-500',
          high: isRtl ? 'border-r-orange-500' : 'border-l-orange-500',
          critical: isRtl ? 'border-r-rose-500' : 'border-l-rose-500',
        };

        const borderClass = isRtl
          ? `border-r-4 ${borderColors[ticket.priority]} rounded-r-none rounded-l-xl hover:border-r-5`
          : `border-l-4 ${borderColors[ticket.priority]} rounded-l-none rounded-r-xl hover:border-l-5`;

        const dateLocale = isRtl ? 'he-IL' : 'en-US';

        return (
          <div
            key={ticket.id}
            onClick={() => onSelect(ticket)}
            className={`bg-white border border-slate-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer ${borderClass}`}
          >
            <div className="grid grid-cols-2 md:grid-cols-7 gap-y-4 gap-x-2 md:gap-4 items-center">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('ticketNumber')}</p>
                <p className="font-mono text-sm font-bold text-slate-700">
                  #{ticket.id.slice(-6)}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('name')}</p>
                <p className="text-sm font-semibold text-slate-800">
                  {ticket.createdBy.name}
                </p>
              </div>

              <div className="col-span-2 md:col-span-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('category')}</p>
                <p className="text-sm font-medium text-slate-600 truncate">
                  {(settings?.categories?.find((c) => c.id === ticket.category)?.label[lang] ??
                    settings?.categories?.find((c) => c.id === ticket.category)?.label.en) || ticket.category}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('floorRoom')}</p>
                <p className="text-sm font-semibold text-slate-700">
                  {ticket.floor} / {ticket.room}
                </p>
              </div>

              <div className="flex flex-col items-start">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('status')}</p>
                <StatusBadge status={ticket.status} />
              </div>

              <div className="flex flex-col items-start">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('priority')}</p>
                <PriorityBadge priority={ticket.priority} />
              </div>

              <div className="col-span-2 md:col-span-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('date')}</p>
                <p className="text-sm text-slate-500 font-medium">
                  {new Date(ticket.createdAt).toLocaleDateString(dateLocale)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}