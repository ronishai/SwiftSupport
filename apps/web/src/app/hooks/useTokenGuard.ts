import { useEffect, useState } from 'react';
import api from '../lib/api';

type GuardState = 'checking' | 'valid' | 'invalid';

export const useTokenGuard = () => {
  const [guardState, setGuardState] = useState<GuardState>('checking');

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get('token');

        if (!token) { 
            setGuardState('invalid');
            return;
        }

        api.post('/auth/validate-token', { token })
          .then(() => setGuardState('valid'))
          .catch(() => setGuardState('invalid'));
      }, []);

  return guardState;
};