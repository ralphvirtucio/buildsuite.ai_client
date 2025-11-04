import axios from 'axios';
import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Request interceptor
const DEMO_AUTH_FALLBACK = 'demo-development-token'; // TODO: replace when real auth is wired

axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const bearer = token || DEMO_AUTH_FALLBACK;
      if (bearer) {
        config.headers.Authorization = `Bearer ${bearer}`;
      }
    } catch {
      // no-op in SSR
      config.headers.Authorization = `Bearer ${DEMO_AUTH_FALLBACK}`;
    }
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
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      // Redirect to login or dispatch logout action
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
