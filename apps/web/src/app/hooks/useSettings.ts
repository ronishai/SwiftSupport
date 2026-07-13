import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { AppSettings } from '@swift-support/shared';

export function useSettings() {
  return useQuery<AppSettings, unknown, AppSettings>({
    queryKey: ['settings', 'admin-view'],
    queryFn: async () => {
      const response = await api.get('/settings');
      return response.data as AppSettings;
    },
    staleTime: 0,
  });
}
