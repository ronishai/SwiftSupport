import { useState } from 'react';
import api from '../lib/api';
import { useSettings } from '../hooks/useSettings';
import { useLocale } from '../hooks/useLocale';
import type { TeamId } from '@swift-support/shared';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function AdminCompleteProfile() {
  const [name, setName] = useState('');
  const [team, setTeam] = useState<TeamId | ''>('');
  const { data: settings } = useSettings();
  const { lang, t } = useLocale();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name) {
      setError(t('pleaseEnterName'));
      return;
    }
    if (!team) {
      setError(t('pleaseChooseTeam'));
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/set-team', { team, displayName: name });
      await (
        await import('../lib/firebase')
      ).auth.currentUser?.getIdToken(true);
      navigate('/admin/dashboard');
    } catch {
      setError(t('errorUpdatingProfile'));
    } finally {
      setLoading(false);
    }
  }

  const isRtl = lang === 'he';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 p-4"
    >
      <div className="w-full max-w-md mb-4 flex justify-end">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md relative">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-secondary-200/40 rounded-full blur-3xl pointer-events-none" />

        <Card className="w-full relative overflow-hidden border-t-4 border-t-primary-600 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-600 mb-4 border border-primary-100/50">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              {t('completeProfile')}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {t('completeProfileHelp')}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 mb-5 text-rose-700 text-sm font-medium flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <Input
              type="text"
              label={t('name')}
              placeholder={t('pleaseEnterName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                {t('chooseWorkTeam')}
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {(settings?.teams ?? []).map((t) => (
                  (
                    <label
                      key={t.id}
                      className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all duration-200 ${
                        team === t.id
                          ? 'border-primary-500 bg-primary-50/50 ring-2 ring-primary-500/10 text-primary-900'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-650'
                      }`}
                    >
                      <input
                        type="radio"
                        name="team"
                        value={t.id}
                        checked={team === t.id}
                        onChange={() => setTeam(t.id)}
                        className="w-4 h-4 accent-primary-600"
                      />
                      <span className="font-semibold text-sm text-slate-750">{t.label[lang] || t.label.en}</span>
                    </label>
                  )
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6"
              size="lg"
            >
              {loading ? t('submitting') : t('saveProfile')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

