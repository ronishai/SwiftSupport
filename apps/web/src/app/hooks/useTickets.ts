import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function useTickets(extraFilters: Record<string, string> = {}) {
  const user = useAuthStore((state) => state.user);

  const filters = {
    ...extraFilters,
    teamInCharge: user?.team ?? '',
  };

  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => api.get('/tickets', { params: filters }).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/tickets/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote: string }) =>
      api.patch(`/tickets/${id}/note`, { adminNote }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, teamId }: { id: string; teamId: string }) =>
      api.patch(`/tickets/${id}/change-team`, { teamId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}

export function useAssignTo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      uid,
    }: {
      id: string;
      uid: { uid: string; displayName: string; email: string };
    }) => api.patch(`/tickets/${id}/assign`, uid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });
}
