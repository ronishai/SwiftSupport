import { useState } from 'react';
import { auth } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import type { AppUser } from '@swift-support/shared';
import type { TeamId } from '@swift-support/shared';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { useLocale } from '../hooks/useLocale';
import LanguageSwitcher from '../components/LanguageSwitcher';

function AdminLogin() {
  const { lang, t } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const idTokenResult = await credential.user.getIdTokenResult(true);
      const tokenTeam = idTokenResult.claims.team as string | undefined;
      if (!idTokenResult.claims.role || idTokenResult.claims.role !== 'admin') {
        setError(t('noAdminAccess'));
        return;
      }
      if (!tokenTeam) {
        setError(t('noTeamAssigned'));
        return;
      }
      const user: AppUser = {
        uid: credential.user.uid,
        displayName: credential.user.displayName ?? '',
        email: credential.user.email ?? '',
        role: 'admin',
        team: tokenTeam as TeamId,
      };
      setUser(user);
      navigate('/admin/dashboard');
    } catch {
      setError(t('invalidCredentials'));
    } finally {
      setLoading(false);
    }
  }

  async function onResetPassword() {
    if (!email) {
      setError(t('pleaseEnterEmailReset'));
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch {
      setError(t('userNotFound'));
    }
  }

  return (
    <div
      dir={lang === 'he' ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-500/50 p-4"
    >
       <div className="w-full max-w-md mb-4 flex justify-end">
                <LanguageSwitcher />
              </div>
      <div className="w-full max-w-md relative">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-secondary-200/40 rounded-full blur-3xl pointer-events-none" />

        <Card className="w-full relative overflow-hidden border-t-4 border-t-primary-600 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary-600 mb-4 border border-primary-100/50">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              {t('loginTitle')}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {t('loginSubtitle')}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 mb-5 text-rose-700 text-sm font-medium flex items-center gap-2 animate-fadeIn">
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
          {resetSent && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 mb-5 text-emerald-700 text-sm font-medium flex items-center gap-2 animate-fadeIn">
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
              <span>{t('resetEmailSent')}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <Input
              type="email"
              label={t('email')}
              placeholder="admin@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              type="password"
              label={t('password')}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2"
              size="lg"
            >
              {loading ? t('signingIn') : t('signIn')}
            </Button>
          </form>

          <button
            type="button"
            onClick={onResetPassword}
            className="mt-6 block w-full text-sm text-primary-600 hover:text-primary-700 text-center font-semibold transition-colors"
          >
            {t('forgotPassword')}
          </button>
        </Card>
      </div>
    </div>
  );
}

export default AdminLogin;
