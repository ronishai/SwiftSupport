import { useState, useEffect } from 'react';
import type { Ticket, TeamId } from '@swift-support/shared';
import { useSettings } from '../hooks/useSettings';
import { useLocale } from '../hooks/useLocale';
import {
  useUpdateStatus,
  useUpdateNote,
  useUpdateTeam,
  useAssignTo,
} from '../hooks/useTickets';
import api from '../lib/api';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
}

interface Props {
  ticket: Ticket;
  onClose: () => void;
}

export default function TicketModal({ ticket, onClose }: Props) {
  const [note, setNote] = useState(ticket.adminNote ?? '');
  const [selectedAdminUid, setSelectedAdminUid] = useState('');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(ticket.status);
  const [currentTeam, setCurrentTeam] = useState(ticket.teamInCharge);
  const [currentAssignedTo, setCurrentAssignedTo] = useState(ticket.assignedTo);

  const updateStatus = useUpdateStatus();
  const updateNote = useUpdateNote();
  const updateTeam = useUpdateTeam();
  const assignTo = useAssignTo();

  useEffect(() => {
    setCurrentStatus(ticket.status);
    setCurrentTeam(ticket.teamInCharge);
    setCurrentAssignedTo(ticket.assignedTo);
    setNote(ticket.adminNote);
  }, [ticket]);

  useEffect(() => {
    async function fetchAdmins() {
      try {
        setLoadingAdmins(true);
        const response = await api.get('/users');
        setAdmins(response.data);
      } catch {
        setAdmins([]);
      } finally {
        setLoadingAdmins(false);
      }
    }
    fetchAdmins();
  }, []);

  const { data: settings } = useSettings();
  const { lang, t } = useLocale();

  const categoryLabels = Object.fromEntries((settings?.categories ?? []).map((c) => [c.id, c.label[lang] || c.label.en]));
  const teamLabels = Object.fromEntries((settings?.teams ?? []).map((t) => [t.id, t.label[lang] || t.label.en]));

  const isRtl = lang === 'he';

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`bg-white p-6 md:p-8 rounded-2xl w-full max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100 ${isRtl ? 'text-right' : 'text-left'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <button
        onClick={onClose}
        className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} text-slate-400 hover:text-slate-600 transition-all duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100`}
        aria-label="Close modal"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <div className="mb-6">
        <p className="text-[10px] md:text-xs font-mono font-bold text-slate-400 mb-1">
          {t('ticketNumber')} #{ticket.id}
        </p>
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-3">
          {categoryLabels[ticket.category] || ticket.category}
        </h2>
        <div className="flex gap-2 flex-wrap">
          <StatusBadge status={currentStatus} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 bg-slate-50 border border-slate-100 rounded-2xl p-5 my-6 text-sm text-slate-600">
        <div>
          <span className="font-semibold text-slate-400 block text-xs mb-0.5">
            {t('customerName')}
          </span>
          <span className="font-bold text-slate-800">
            {ticket.createdBy.name}
          </span>
        </div>
        <div>
          <span className="font-semibold text-slate-400 block text-xs mb-0.5">
            {t('emailAddress')}
          </span>
          <span className="font-semibold text-slate-800 break-all">
            {ticket.createdBy.email}
          </span>
        </div>
        <div>
          <span className="font-semibold text-slate-400 block text-xs mb-0.5">
            {t('phoneNumber')}
          </span>
          <span className="font-bold text-slate-800 font-mono" dir="ltr">
            {ticket.createdBy.phone}
          </span>
        </div>
        <div>
          <span className="font-semibold text-slate-400 block text-xs mb-0.5">
            {t('locationFloorRoom')}
          </span>
          <span className="font-bold text-slate-800">
            {ticket.floor} / {ticket.room}
          </span>
        </div>
        <div>
          <span className="font-semibold text-slate-400 block text-xs mb-0.5">
            {t('assignedTeam')}
          </span>
            <span className="font-bold text-primary-700">
            {teamLabels[ticket.teamInCharge] || ticket.teamInCharge}
          </span>
        </div>
        {currentAssignedTo && (
          <div>
            <span className="font-semibold text-slate-400 block text-xs mb-0.5">
              {t('assignedAgent')}
            </span>
            <span className="font-bold text-primary-700">
              {currentAssignedTo.displayName}
            </span>
          </div>
        )}
      </div>

      <div className="my-6">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          {t('ticketDescriptionTitle')}
        </p>
        <p className="text-sm font-semibold text-slate-800 bg-white border border-slate-200/80 rounded-2xl p-5 leading-relaxed whitespace-pre-line shadow-xs">
          {ticket.description}
        </p>
      </div>

      <div className="space-y-6 pt-4 border-t border-slate-100">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            {t('updateStatus')}
          </p>
          <div className="flex gap-2 flex-wrap">
            {(['new', 'in-progress', 'pending', 'closed'] as const).map((s) => {
              const activeClasses = {
                new: 'bg-rose-50 text-rose-700 border-rose-200 ring-2 ring-rose-500/10 font-bold',
                'in-progress':
                  'bg-blue-50 text-blue-700 border-blue-200 ring-2 ring-blue-500/10 font-bold',
                pending:
                  'bg-indigo-50 text-indigo-700 border-indigo-200 ring-2 ring-indigo-500/10 font-bold',
                closed:
                  'bg-emerald-50 text-emerald-700 border-emerald-200 ring-2 ring-emerald-500/10 font-bold',
              };
              const statusKeys = {
                new: 'statusNew',
                'in-progress': 'statusInProgress',
                pending: 'statusPending',
                closed: 'statusClosed',
              } as const;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setCurrentStatus(s);
                    updateStatus.mutate({ id: ticket.id, status: s });
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 border ${
                    currentStatus === s
                      ? activeClasses[s]
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/50 font-medium'
                  }`}
                >
                  {t(statusKeys[s])}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            {t('changeTeam')}
          </p>
          <div className="flex gap-2 flex-wrap">
            {(settings?.teams ?? []).map((team) => {
              const label = team.label[lang] || team.label.en;
              return (
                <button
                  key={team.id}
                  onClick={() => {
                    setCurrentTeam(team.id as TeamId);
                    updateTeam.mutate({ id: ticket.id, teamId: team.id });
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all duration-200 border ${
                    currentTeam === team.id
                      ? 'bg-secondary-50 text-secondary-700 border-secondary-200 ring-2 ring-secondary-500/10 font-bold'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/50 font-medium'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            {t('assignManager')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedAdminUid}
              onChange={(e) => setSelectedAdminUid(e.target.value)}
              className="flex-grow w-full border border-slate-200 rounded-lg px-3.5 py-2 text-sm bg-white focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 cursor-pointer"
              disabled={loadingAdmins}
            >
              <option value="">
                {loadingAdmins ? t('loadingAdmins') : t('chooseAdminFromList')}
              </option>
              {admins.map((admin) => (
                <option key={admin.uid} value={admin.uid}>
                  {admin.displayName}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const selected = admins.find((a) => a.uid === selectedAdminUid);
                if (selected) {
                  setCurrentAssignedTo(selected);
                  assignTo.mutate({
                    id: ticket.id,
                    uid: {
                      uid: selected.uid,
                      displayName: selected.displayName,
                      email: selected.email,
                    },
                  });
                }
              }}
              disabled={!selectedAdminUid}
              className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg px-5 py-2 text-sm shadow-xs active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:scale-100 flex items-center justify-center cursor-pointer"
            >
              {t('assignManager')}
            </button>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            {t('adminNotes')}
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-200 resize-none min-h-[80px]"
            placeholder={t('adminNotePlaceholder')}
          />
          <button
            onClick={() => {
              setNote(note);
              updateNote.mutate({ id: ticket.id, adminNote: note });
            }}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg px-4 py-2 text-sm shadow-xs active:scale-[0.98] transition-all duration-200 mt-2 flex items-center justify-center cursor-pointer"
          >
            {t('saveNote')}
          </button>
          {ticket.adminNote && (
            <div className="text-xs text-slate-500 mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex flex-col gap-1.5">
              <span className="font-bold text-slate-400">
                {t('currentNote')}
              </span>
              <p className="font-semibold text-slate-700 whitespace-pre-line">
                {ticket.adminNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
