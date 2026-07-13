import { useAuthStore } from '../../store/authStore';
import Button from './Button';
import { auth } from '../../lib/firebase';
import LanguageSwitcher from '../LanguageSwitcher';
import { useLocale } from '../../hooks/useLocale';

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const { t, lang } = useLocale();

  async function handleLogout() {
    await auth.signOut();
  }

  return (
    <div
      dir={lang === 'he' ? 'rtl' : 'ltr'}
      className="bg-gradient-to-b from-primary-600/70 via-primary-600 to-primary-700 border-b border-primary-700 shadow-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8">
          <h2 className="text-lg font-extrabold tracking-tight text-primary-100">
            {t('appTitle')}{' '}
            <span className="text-primary-700 text-xs font-semibold mr-1 bg-primary-100/60 px-2 py-1 rounded-md">
              {t('adminConsole')}
            </span>
          </h2>
          <div className="mt-3 sm:mt-0">
            <LanguageSwitcher />
          </div>
        </div>
        <div className="flex items-center gap-5 justify-end">
          {user && (
            <div className="text-right">
              <p className="font-bold text-sm text-primary-100">
                {user.displayName}
              </p>
              <p className="text-primary-100 text-[11px] font-semibold">
                {t('assignedTeam')}: {user.team}
              </p>
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            className="text-primary-600 bg-primary-100 hover:bg-primary-50 border-primary-200 text-xs px-3.5"
          >
            {t('logout')}
          </Button>
        </div>
      </div>
    </div>
  );
}
