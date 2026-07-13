import { useEffect, useRef, useState } from 'react';
import { useTickets } from '../hooks/useTickets';
import { useAuthStore } from '../store/authStore';
import FilterPanel from '../components/FilterPanel';
import TicketTable from '../components/TicketTable';
import TicketModal from '../components/TicketModal';
import CreateAdminModal from '../components/CreateAdminModal';
import SettingsManager from '../components/SettingsManager';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import type { Ticket } from '@swift-support/shared';
import { useLocale } from '../hooks/useLocale';

export default function AdminDashboard() {
  const { lang, t } = useLocale();
  const [activeTab, setActiveTab] = useState<'tickets' | 'settings'>('tickets');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, isError, isFetching } = useTickets(filters);
  const user = useAuthStore((state) => state.user);
  const createAdminDialogRef = useRef<HTMLDialogElement>(null);
  const ticketModalRef = useRef<HTMLDialogElement>(null);

  const displayedTickets = (data ?? []).filter((ticket: Ticket) => {
    if (filters.status === 'closed') {
      return ticket.status === 'closed';
    }
    return ticket.status !== 'closed';
  });

  function onFilterChange(key: string, value: string) {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  }

  useEffect(() => {
    if (selected) {
      ticketModalRef.current?.showModal();
    } else {
      ticketModalRef.current?.close();
    }
  }, [selected]);

  const isRtl = lang === 'he';

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-DEFAULT" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-neutral-100">
          <p className="text-error text-lg font-medium">
            {t('errorLoadingTickets')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-primary-600 font-medium hover:underline"
          >
            {t('refreshPage')}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-DEFAULT" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="mt-4 text-text-secondary font-medium">{t('loadingTickets')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-500/50 antialiased"
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4 pb-6 border-b border-primary-500/20">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1.5">
              {t('hello')} {user?.displayName}{' '}
              <span className="text-primary-600 font-semibold text-lg md:text-xl block sm:inline-block sm:mx-2">
                {t('fromTeam')} {user?.team}
              </span>
            </h2>
            <p className="text-sm font-semibold text-slate-500 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-500 inline-block animate-pulse"></span>
              {isRtl ? (
                <span>
                  {t('thereAre')} {displayedTickets.length ?? 0} {t('ticketsCountText')}{' '}
                  {filters.status === 'closed' ? t('closed') : t('open')}{' '}
                </span>
              ) : (
                <span>
                  {t('thereAre')} {displayedTickets.length ?? 0}{' '}
                  {filters.status === 'closed' ? t('closed') : t('open')} {t('ticketsCountText')}{' '}
                </span>
              )}
            </p>
          </div>

          <div className="flex-shrink-0">
            <Button
              onClick={() => {
                setIsModalOpen(true);
                createAdminDialogRef.current?.showModal();
              }}
              variant="secondary"
              size="md"
              className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-200"
            >
              <svg
                className="w-4 h-4 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>{t('createAdmin')}</span>
            </Button>
          </div>
        </div>

        <div className="flex border-b border-primary-500/20 mb-8 gap-4">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === 'tickets'
                ? 'border-primary-650 text-primary-650'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            {t('openTickets')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-primary-650 text-primary-650'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            {t('settingsTitle')}
          </button>
        </div>

        <div className="flex flex-col gap-6 w-full">
          <dialog
            ref={createAdminDialogRef}
            className="bg-transparent backdrop:backdrop-blur-sm backdrop:bg-slate-900/40 p-4 w-full max-w-lg md:max-w-2xl rounded-2xl focus:outline-none"
            closedby="closerequest"
          >
            <CreateAdminModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                createAdminDialogRef.current?.close();
              }}
            />
          </dialog>

          {activeTab === 'tickets' ? (
            <>
              <div className="w-full">
                <FilterPanel filters={filters} onChange={onFilterChange} />
              </div>

              <div
                className={`mt-2 w-full transition-opacity duration-200 ${isFetching ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <TicketTable
                  tickets={displayedTickets ?? []}
                  onSelect={setSelected}
                />
              </div>
            </>
          ) : (
            <div className="w-full">
              <SettingsManager />
            </div>
          )}

          {selected && (
            <dialog
              ref={ticketModalRef}
              className="bg-transparent backdrop:backdrop-blur-sm backdrop:bg-slate-900/40 p-4 w-full max-w-lg md:max-w-2xl rounded-2xl focus:outline-none"
              onClose={() => setSelected(null)}
            >
              <TicketModal
                ticket={selected}
                onClose={() => {
                  setSelected(null);
                }}
              />
            </dialog>
          )}
        </div>
      </div>
    </div>
  );
}
