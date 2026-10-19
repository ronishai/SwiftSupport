import { useMemo, useState } from 'react';
import api from '../lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useSettings } from '../hooks/useSettings';
import { useLocale } from '../hooks/useLocale';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

export default function SettingsManager() {
  const { data: settings, isLoading } = useSettings();
  const queryClient = useQueryClient();
  const { t, lang } = useLocale();

  const [categoryId, setCategoryId] = useState('');
  const [categoryLabelEn, setCategoryLabelEn] = useState('');
  const [categoryLabelHe, setCategoryLabelHe] = useState('');
  const [categoryTeams, setCategoryTeams] = useState<string[]>([]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  const [teamId, setTeamId] = useState('');
  const [teamLabelEn, setTeamLabelEn] = useState('');
  const [teamLabelHe, setTeamLabelHe] = useState('');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = settings?.categories ?? [];
  const teams = settings?.teams ?? [];
  const availableTeams = teams.map((team) => ({
    id: team.id,
    label: team.label[lang] || team.label.en,
  }));

  const categoryMap = useMemo(
    () => new Set(categories.map((category) => category.id.toLowerCase())),
    [categories],
  );
  const teamMap = useMemo(
    () => new Set(teams.map((team) => team.id.toLowerCase())),
    [teams],
  );

  function startEditCategory(cat: (typeof categories)[0]) {
    setEditingCategoryId(cat.id);
    setCategoryId(cat.id);
    setCategoryLabelEn(cat.label.en);
    setCategoryLabelHe(cat.label.he);
    setCategoryTeams(cat.teams || []);
  }

  function cancelEditCategory() {
    setEditingCategoryId(null);
    setCategoryId('');
    setCategoryLabelEn('');
    setCategoryLabelHe('');
    setCategoryTeams([]);
  }

  function startEditTeam(t: (typeof teams)[0]) {
    setEditingTeamId(t.id);
    setTeamId(t.id);
    setTeamLabelEn(t.label.en);
    setTeamLabelHe(t.label.he);
  }

  function cancelEditTeam() {
    setEditingTeamId(null);
    setTeamId('');
    setTeamLabelEn('');
    setTeamLabelHe('');
  }

  async function createCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setError('');

    const id = editingCategoryId ? editingCategoryId : categoryId.trim();

    if (!id) {
      setError(t('invalidId'));
      return;
    }

    if (!editingCategoryId && categoryMap.has(id.toLowerCase())) {
      setError(t('duplicateKey'));
      return;
    }

    setSaving(true);

    try {
      let nextCategories;
      if (editingCategoryId) {
        nextCategories = categories.map((cat) =>
          cat.id === editingCategoryId
            ? {
                ...cat,
                label: { en: categoryLabelEn || id, he: categoryLabelHe || id },
                teams: categoryTeams,
              }
            : cat,
        );
      } else {
        nextCategories = [
          ...categories,
          {
            id,
            label: {
              en: categoryLabelEn || id,
              he: categoryLabelHe || id,
            },
            teams: categoryTeams,
          },
        ];
      }

      const nextCategoryResponsibleTeams = {
        ...(settings?.categoryResponsibleTeams ?? {}),
        [id]: categoryTeams,
      };

      await api.patch('/settings', {
        categories: nextCategories,
        categoryResponsibleTeams: nextCategoryResponsibleTeams,
      });
      await queryClient.refetchQueries({
        queryKey: ['settings', 'admin-view'],
      });
      setMessage(t('addSettingsSuccess'));
      cancelEditCategory();
    } catch {
      setError(t('createAdminFailure'));
    } finally {
      setSaving(false);
    }
  }

  async function createTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setError('');

    const id = editingTeamId ? editingTeamId : teamId.trim();

    if (!id) {
      setError(t('invalidId'));
      return;
    }
    if (!editingTeamId && teamMap.has(id.toLowerCase())) {
      setError(t('duplicateKey'));
      return;
    }

    setSaving(true);

    try {
      let nextTeams;
      if (editingTeamId) {
        nextTeams = teams.map((team) =>
          team.id === editingTeamId
            ? {
                ...team,
                label: { en: teamLabelEn || id, he: teamLabelHe || id },
              }
            : team,
        );
      } else {
        nextTeams = [
          ...teams,
          {
            id,
            label: {
              en: teamLabelEn || id,
              he: teamLabelHe || id,
            },
          },
        ];
      }

      await api.patch('/settings', {
        teams: nextTeams,
      });
      await queryClient.refetchQueries({
        queryKey: ['settings', 'admin-view'],
      });
      setMessage(t('addSettingsSuccess'));
      cancelEditTeam();
    } catch {
      setError(t('createAdminFailure'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(idToDelete: string) {
    if (!window.confirm(t('confirmDeleteCategory'))) return;

    setMessage('');
    setError('');
    setSaving(true);
    try {
      const nextCategories = categories.filter((cat) => cat.id !== idToDelete);
      const nextCategoryResponsibleTeams = {
        ...(settings?.categoryResponsibleTeams ?? {}),
      };
      delete nextCategoryResponsibleTeams[idToDelete];

      await api.patch('/settings', {
        categories: nextCategories,
        categoryResponsibleTeams: nextCategoryResponsibleTeams,
      });
      await queryClient.refetchQueries({
        queryKey: ['settings', 'admin-view'],
      });
      setMessage(t('addSettingsSuccess'));
    } catch {
      setError(t('createAdminFailure'));
    } finally {
      setSaving(false);
    }
  }

  async function deleteTeam(idToDelete: string) {
    if (!window.confirm(t('confirmDeleteTeam'))) return;

    setMessage('');
    setError('');
    setSaving(true);
    try {
      const nextTeams = teams.filter((t) => t.id !== idToDelete);

      const nextCategories = categories.map((cat) => ({
        ...cat,
        teams: (cat.teams || []).filter((tId) => tId !== idToDelete),
      }));

      const nextCategoryResponsibleTeams = {
        ...(settings?.categoryResponsibleTeams ?? {}),
      };
      Object.keys(nextCategoryResponsibleTeams).forEach((catId) => {
        nextCategoryResponsibleTeams[catId] = (
          nextCategoryResponsibleTeams[catId] || []
        ).filter((tId) => tId !== idToDelete);
      });

      await api.patch('/settings', {
        teams: nextTeams,
        categories: nextCategories,
        categoryResponsibleTeams: nextCategoryResponsibleTeams,
      });
      await queryClient.refetchQueries({
        queryKey: ['settings', 'admin-view'],
      });
      setMessage(t('addSettingsSuccess'));
    } catch {
      setError(t('createAdminFailure'));
    } finally {
      setSaving(false);
    }
  }

  const isRtl = lang === 'he';

  return (
    <Card className="p-6 border border-slate-200 rounded-3xl shadow-xl bg-white">
      <div className={`mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>
        <h3 className="text-xl font-bold text-slate-900">
          {t('settingsTitle')}
        </h3>
        <p className="text-sm text-slate-500">{t('settingsSubtitle')}</p>
      </div>

      {error && (
        <div
          className={`mb-4 rounded-xl bg-rose-50 border border-rose-100 p-4 text-rose-700 text-sm ${isRtl ? 'text-right' : 'text-left'}`}
        >
          {error}
        </div>
      )}
      {message && (
        <div
          className={`mb-4 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 text-sm ${isRtl ? 'text-right' : 'text-left'}`}
        >
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={isRtl ? 'text-right' : 'text-left'}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h4 className="text-lg font-semibold text-slate-900">
              {editingCategoryId ? t('updateCategory') : t('addCategory')}
            </h4>
            {editingCategoryId && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={cancelEditCategory}
              >
                {t('cancel')}
              </Button>
            )}
          </div>
          <form className="space-y-4" onSubmit={createCategory}>
            <Input
              label={t('categoryKey')}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!!editingCategoryId}
              required
            />
            <Input
              label={t('englishLabel')}
              value={categoryLabelEn}
              onChange={(e) => setCategoryLabelEn(e.target.value)}
              required
            />
            <Input
              label={t('hebrewLabel')}
              value={categoryLabelHe}
              onChange={(e) => setCategoryLabelHe(e.target.value)}
              required
            />

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                {t('assignTeam')}
              </p>
              <div className="grid grid-cols-1 gap-2">
                {availableTeams.map((team) => (
                  <label
                    key={team.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-slate-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={categoryTeams.includes(team.id)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setCategoryTeams((prev) => [...prev, team.id]);
                        } else {
                          setCategoryTeams((prev) =>
                            prev.filter((id) => id !== team.id),
                          );
                        }
                      }}
                      className="accent-primary-600"
                    />
                    <span className="text-sm text-slate-700">{team.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={saving} className="w-full mt-2">
              {saving
                ? t('submitting')
                : editingCategoryId
                  ? t('updateCategory')
                  : t('addCategory')}
            </Button>
          </form>
        </section>

        <section className={isRtl ? 'text-right' : 'text-left'}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h4 className="text-lg font-semibold text-slate-900">
              {editingTeamId ? t('updateTeam') : t('addTeam')}
            </h4>
            {editingTeamId && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={cancelEditTeam}
              >
                {t('cancel')}
              </Button>
            )}
          </div>
          <form className="space-y-4" onSubmit={createTeam}>
            <Input
              label={t('teamKey')}
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              disabled={!!editingTeamId}
              required
            />
            <Input
              label={t('englishLabel')}
              value={teamLabelEn}
              onChange={(e) => setTeamLabelEn(e.target.value)}
              required
            />
            <Input
              label={t('hebrewLabel')}
              value={teamLabelHe}
              onChange={(e) => setTeamLabelHe(e.target.value)}
              required
            />
            <Button type="submit" disabled={saving} className="w-full mt-2">
              {saving
                ? t('submitting')
                : editingTeamId
                  ? t('updateTeam')
                  : t('addTeam')}
            </Button>
          </form>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div
          className={`rounded-3xl border border-slate-200 bg-slate-50 p-5 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          <h5 className="mb-4 text-base font-semibold text-slate-900">
            {t('category')}
          </h5>
          {isLoading ? (
            <p className="text-sm text-slate-400">{t('loading')}</p>
          ) : (
            <ul className="space-y-3 text-sm text-slate-700">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="rounded-2xl border border-slate-200 bg-white p-3 flex justify-between items-center gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {category.label[lang] || category.label.en}
                    </div>
                    <div className="text-slate-500 text-xs mt-1 truncate">
                      {category.id}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors duration-150"
                      onClick={(e) => {
                        e.preventDefault();
                        startEditCategory(category);
                      }}
                    >
                      {t('edit')}
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium rounded-xl text-xs transition-colors duration-150"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteCategory(category.id);
                      }}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className={`rounded-3xl border border-slate-200 bg-slate-50 p-5 ${isRtl ? 'text-right' : 'text-left'}`}
        >
          <h5 className="mb-4 text-base font-semibold text-slate-900">
            {t('createTeam')}
          </h5>
          {isLoading ? (
            <p className="text-sm text-slate-400">{t('loading')}</p>
          ) : (
            <ul className="space-y-3 text-sm text-slate-700">
              {teams.map((team) => (
                <li
                  key={team.id}
                  className="rounded-2xl border border-slate-200 bg-white p-3 flex justify-between items-center gap-4"
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {team.label[lang] || team.label.en}
                    </div>
                    <div className="text-slate-500 text-xs mt-1 truncate">
                      {team.id}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors duration-150"
                      onClick={(e) => {
                        e.preventDefault();
                        startEditTeam(team);
                      }}
                    >
                      {t('edit')}
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium rounded-xl text-xs transition-colors duration-150"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteTeam(team.id);
                      }}
                    >
                      {t('delete')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
