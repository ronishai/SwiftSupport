import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from './ui/LoadingSpinner';

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const isHydrating = useAuthStore((state) => state.isHydrating);

  useEffect(() => {
    let mounted = true;
    if (!user || isHydrating || loading) {
      return;
    }

    if (user) setIsAdmin(true)

    user
      .getIdTokenResult()
      .then((tokenResult) => {
        if (mounted) {
          setIsAdmin(tokenResult.claims.role === 'admin');
          const adminMissingTeam =
            tokenResult.claims.role === 'admin' && !tokenResult.claims.team;
          const windowObj = window as Window & {
            __admin_missing_team?: boolean;
          };
          windowObj.__admin_missing_team = adminMissingTeam;
        }
      })
      .catch(() => {
        if (mounted) setIsAdmin(false);
      });

    return () => {
      mounted = false;
    };
  }, [user, isHydrating, loading]);

  const windowObj = window as Window & { __admin_missing_team?: boolean };
  if (loading || isHydrating || isAdmin === null) return <LoadingSpinner />;
  if (!user || !isAdmin) return <Navigate to="/admin" replace />;
  if (windowObj.__admin_missing_team)
    return <Navigate to="/admin/complete-profile" replace />;
  return <>{children}</>;
}
