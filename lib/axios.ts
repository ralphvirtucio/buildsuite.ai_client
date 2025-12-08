import axios from 'axios';
import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';

const API_BASE_FALLBACK = 'http://localhost:8000/api/v1';

export const resolveApiBaseUrl = () => {
  const base = process.env.NEXT_PUBLIC_API_ENDPOINT_URL || API_BASE_FALLBACK;

  // Avoid mixed-content by upgrading to https when the page is served over https
  if (
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    base.startsWith('http://')
  ) {
    return base.replace(/^http:\/\//, 'https://');
  }

  return base;
};

const axiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * useApiMutation
 * Scaffold for a TanStack Query mutation powered by the shared axios instance.
 *
 * TODOs:
 * - Define `Vars` payload shape (what you send to the server)
 * - Define `Data` response shape (what you expect back)
 * - Define `Err` error shape (API error contract)
 * - Replace `endpoint` with your real API path
 * - Add auth headers/interceptors if needed
 */
export function useApiMutation<
  Data = unknown, // TODO: replace with concrete response type
  Err = unknown, // TODO: replace with concrete error type
  Vars = unknown, // TODO: replace with concrete variables/payload type
>(
  endpoint: string, // e.g. '/chat/send' — TODO: replace per call site
  options?: UseMutationOptions<Data, Err, Vars>,
): UseMutationResult<Data, Err, Vars> {
  return useMutation<Data, Err, Vars>({
    mutationKey: [endpoint], // TODO: refine mutation key if needed
    mutationFn: async (variables: Vars) => {
      // TODO: choose HTTP method and payload mapping if different from POST JSON body
      const res = await axiosInstance.post(endpoint, variables);
      // TODO: transform/validate the response if necessary
      return res.data as Data;
    },
    ...options,
  });
}

/**
 * Example specialized mutation scaffold (optional):
 *
 * export function useSendChatMessageMutation(
 *   options?: UseMutationOptions<SendMessageResponse, ApiError, SendMessagePayload>,
 * ) {
 *   return useApiMutation<SendMessageResponse, ApiError, SendMessagePayload>(
 *     '/chat', // TODO: replace with your endpoint
 *     options,
 *   );
 * }
 */

axiosInstance.interceptors.request.use(
  (config) => {
    // Ensure cookies (session_id) are sent on API calls
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // console.log(error.response?.status);
    // Let callers handle 401; no automatic redirect to keep tabs/UI stable
    return Promise.reject(error);
  },
);

export default axiosInstance;
