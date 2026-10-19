import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import type { AppUser } from '@swift-support/shared';


export function useAuth() {
  const setUser = useAuthStore((state) => state.setUser);
  const setHydrating = useAuthStore((state) => state.setHydrating);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await getIdTokenResult(firebaseUser, true);
        const team = tokenResult.claims.team as string | undefined;
        const role = tokenResult.claims.role as string | undefined;

        const user: AppUser = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName ?? '',
          email: firebaseUser.email ?? '',
          role: role === 'admin' ? 'admin' : 'admin',
          team: team ?? '',
        };
        setUser(user);
      } else {
        setUser(null);
      }
      setHydrating(false);
    });

    return unsubscribe;
  }, [setUser, setHydrating]);
}
