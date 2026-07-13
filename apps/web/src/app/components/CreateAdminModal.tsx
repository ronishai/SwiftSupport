import { useState } from 'react';
import Card from './ui/Card';
import Input from './ui/Input';
import Button from './ui/Button';
import api from '../lib/api';
import { useSettings } from '../hooks/useSettings';
import { useLocale } from '../hooks/useLocale';
import type { TeamOption } from '@swift-support/shared';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function CreateAdminModal({ isOpen, onClose }: Props) {
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminTeam, setNewAdminTeam] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const { data: settings } = useSettings();
  const { t, lang } = useLocale();

  const teams = settings?.teams ?? [];

  async function createAdminUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!newAdminEmail || !newAdminPassword || !newAdminName) {
      setCreateError(t('pleaseEnterName'));
      return;
    }
    if (!newAdminTeam) {
      setCreateError(t('pleaseChooseTeam'));
      return;
    }

    setCreatingAdmin(true);

    try {
      await api.post('/users/create-admin', {
        email: newAdminEmail,
        password: newAdminPassword,
        displayName: newAdminName,
        team: newAdminTeam,
      });
      setCreateSuccess(t('createAdminSuccess'));
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      setNewAdminTeam('');
    } catch {
      setCreateError(t('createAdminFailure'));
    } finally {
      setCreatingAdmin(false);
    }
  }

  return (
    <Card className="relative overflow-hidden shadow-2xl border border-slate-100 max-w-lg md:max-w-2xl mx-auto w-full">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition-all duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
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

      <h3 className="text-xl font-extrabold text-slate-900 mb-6 mt-2">
        {t('createAdmin')}
      </h3>

      {createError && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 mb-5 text-rose-700 text-sm font-medium flex items-center gap-2">
          <svg
            className="w-5 h-5 flex-shrink-0 text-rose-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{createError}</span>
        </div>
      )}
      {createSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 mb-5 text-emerald-700 text-sm font-medium flex items-center gap-2">
          <svg
            className="w-5 h-5 flex-shrink-0 text-emerald-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{createSuccess}</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={createAdminUser}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="text"
            label={t('adminName')}
            placeholder={t('adminName')}
            required
            value={newAdminName}
            onChange={(e) => setNewAdminName(e.target.value)}
          />
          <Input
            type="email"
            label={t('email')}
            placeholder="admin@example.com"
            required
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
          />
        </div>

        <Input
          type="password"
          label={t('adminPassword')}
          placeholder="••••••••"
          required
          value={newAdminPassword}
          onChange={(e) => setNewAdminPassword(e.target.value)}
        />

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            {t('assignTeam')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {teams.map((team: TeamOption) => (
              <label
                key={team.id}
                className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all duration-200 ${
                  newAdminTeam === team.id
                    ? 'border-primary-500 bg-primary-50/50 ring-2 ring-primary-500/10'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <input
                  type="radio"
                  name="newAdminTeam"
                  value={team.id}
                  checked={newAdminTeam === team.id}
                  onChange={() => setNewAdminTeam(team.id)}
                  className="w-4 h-4 accent-primary-600"
                />
                <span className="text-sm font-semibold text-slate-700">
                  {team.label[lang] || team.label.en}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={creatingAdmin}
          className="w-full mt-6"
          size="lg"
        >
          {creatingAdmin ? t('submitting') : t('createAdmin')}
        </Button>
      </form>
    </Card>
  );
}

export default CreateAdminModal;
