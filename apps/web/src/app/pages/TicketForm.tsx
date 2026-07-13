import { useState } from 'react';
import api from '../lib/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import { useLocale } from '../hooks/useLocale';
import { useSettings } from '../hooks/useSettings';
import LanguageSwitcher from '../components/LanguageSwitcher';
import type { Priority } from '@swift-support/shared';

const PRIORITIES: Record<Priority, { en: string; he: string }> = {
  low: { en: 'Low', he: 'נמוכה' },
  medium: { en: 'Medium', he: 'בינונית' },
  high: { en: 'High', he: 'גבוהה' },
  critical: { en: 'Critical', he: 'קריטית' },
};

export default function TicketForm() {
  const { data: settings } = useSettings();
  const { lang, t } = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [assignedTeam, setAssignedTeam] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = settings?.categories ?? [];
  const teams = settings?.teams ?? [];

  const getTeamForCategory = (cat: string) => {
    if (!cat) return '';
    const candidates = settings?.categoryResponsibleTeams?.[cat] ?? [];
    return candidates[0] ?? teams[0]?.id ?? '';
  };

  const currentTeam = category ? getTeamForCategory(category) : '';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) {
      setError(t('pleaseChooseCategory'));
      return;
    }

    setError('');
    setLoading(true);
    try {
      const response = await api.post('/tickets', {
        name,
        email,
        phone,
        floor,
        room,
        priority,
        category,
        description,
      });
      setAssignedTeam(currentTeam);
      setSubmitted(response.data.id);
    } catch {
      setError(t('errorCreate'));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div
        dir={lang === 'he' ? 'rtl' : 'ltr'}
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-500/50 p-4"
      >
        <div className="w-full max-w-md mb-4 flex justify-end">
          <LanguageSwitcher />
        </div>
        <Card className="w-full max-w-md text-center shadow-xl border-t-4 border-t-emerald-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />

          <div className="mb-6 relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/50 mb-4 animate-scaleUp">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {t('ticketCreated')}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {t('keepTicketNumber')}
            </p>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 mb-6 text-right">
              <p className="text-xs text-emerald-600 font-semibold mb-1">
                {t('ticketRoutedTo')}
              </p>
              <p className="text-base font-bold text-emerald-900">
                {assignedTeam}
              </p>
            </div>

            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-5 mb-2">
              <p className="text-xs text-slate-400 font-medium mb-1.5">
                {t('ticketNumber')}:
              </p>
              <p className="text-xl font-mono font-extrabold text-primary-650 tracking-wider">
                {submitted}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {t('keepTicketNumber')}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div
      dir={lang === 'he' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-500/50 p-4 py-8 md:py-16 flex flex-col items-center justify-center"
    >
      <div className="w-full max-w-2xl mb-4 flex justify-end">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-2xl">
        <Card className="w-full relative overflow-hidden border-t-4 border-t-primary-600 shadow-xl">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary-100/30 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-600 mb-3 border border-primary-100/55">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1.5">
              {t('openTicketTitle')}
            </h1>
            <p className="text-sm font-medium text-slate-500">
              {t('openTicketSubtitle')}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 mb-6 text-rose-700 text-sm font-medium flex items-center gap-2 animate-fadeIn">
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
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <Input
              type="text"
              label={t('name')}
              placeholder={t('name')}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="email"
                label={t('email')}
                placeholder="example@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="tel"
                label={t('phone')}
                placeholder="050-1234567"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                label={t('floor')}
                placeholder="3"
                required
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
              <Input
                type="text"
                label={t('room')}
                placeholder="101"
                required
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Select
                  label={t('category')}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">{t('selectCategory')}</option>
                  {categories.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label[lang] || option.label.en}
                    </option>
                  ))}
                </Select>
                {currentTeam && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs bg-emerald-50/50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-100/50">
                    <span className="font-semibold">{t('ticketRoutedTo')}</span>
                    <span className="font-bold underline">
                      {teams.find((team) => team.id === currentTeam)?.label[
                        lang
                      ] ?? currentTeam}
                    </span>
                  </div>
                )}
              </div>
              <Select
                label={t('priority')}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {Object.entries(PRIORITIES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label[lang as 'en' | 'he']}
                  </option>
                ))}
              </Select>
            </div>

            <Textarea
              label={t('description')}
              placeholder={t('description')}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-4"
              size="lg"
            >
              {loading ? t('submitting') : t('submitTicket')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
