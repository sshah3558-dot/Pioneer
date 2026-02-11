'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/fetcher';
import { MeResponse } from '@/types/api';

export function useCurrentUser() {
  const query = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiFetch<MeResponse>('/api/users/me'),
  });

  return {
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
