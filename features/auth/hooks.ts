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
export function useSession(sessionId: string | null) {
  return useQuery<SessionData>({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      if (!sessionId) {
        throw new Error('No session ID provided');
      }

      const response = await axiosInstance.get(`/auth/validate_session`, {
        params: { session_id: sessionId },
      });

      return response.data;
    },
    enabled: !!sessionId, // Only run if sessionId exists
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Only retry once on failure
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}
