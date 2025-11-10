import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import type { SessionData } from './types';

/**
 * Hook to fetch and validate session data from backend
 *
 * @param sessionId - Session identifier from cookie/localStorage
 * @returns React Query result with session data
 *
 * @example
 * ```tsx
 * const { data: session, isLoading } = useSession(sessionId);
 * if (session?.companyName) {
 *   console.log(`Welcome, ${session.companyName}!`);
 * }
 * ```
 */
export function useSession() {
  return useQuery<SessionData>({
    queryKey: ['session'],
    queryFn: async () => {
      // Call Next.js API route which reads cookie server-side
      const res = await fetch('/api/session', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to load session');
      }
      return (await res.json()) as SessionData;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
