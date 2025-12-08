'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance, { resolveApiBaseUrl } from '@/lib/axios';
import type {
  Document,
  DocumentUploadRequest,
  DocumentUploadResponse,
  DocumentListResponse,
  ApiError,
  DocumentStatus,
  DocumentVectorStatus,
} from './types';

// Upload document
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation<DocumentUploadResponse, ApiError, DocumentUploadRequest>({
    mutationFn: async (payload) => {
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('user_id', payload.user_id);
      if (payload.session_id) {
        formData.append('session_id', payload.session_id);
      }

      const res = await axiosInstance.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate documents list to refetch
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useDocumentStatus(
  documentId: string | null,
  userId: string | null,
  enabled: boolean,
) {
  return useQuery<{ id: string; status: DocumentStatus; vector_status?: DocumentVectorStatus; error?: string | null }, ApiError>({
    queryKey: ['document-status', documentId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/documents/${documentId}/status`, {
        params: { user_id: userId },
      });
      return res.data;
    },
    enabled: enabled && !!documentId && !!userId,
    refetchInterval: (data) => {
      const terminal = data?.status === 'ready' || data?.status === 'failed';
      return terminal ? false : 2000;
    },
  });
}

// List documents
export function useDocuments(userId: string, enabled: boolean = true) {
  return useQuery<DocumentListResponse, ApiError>({
    queryKey: ['documents', userId],
    queryFn: async () => {
      const res = await axiosInstance.get('/documents', {
        params: { user_id: userId, page_size: 50 },
      });
      return res.data;
    },
    enabled: enabled && !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Delete document
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { id: string; user_id: string }>({
    mutationFn: async ({ id, user_id }) => {
      await axiosInstance.delete(`/documents/${id}`, {
        params: { user_id },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

// Download document
export async function downloadDocument(doc: Document) {
  const endpoint = `/documents/${doc.id}/download`;
  try {
    const res = await axiosInstance.get(endpoint);
    const url = typeof res.data === 'object' && res.data?.url ? res.data.url : null;

    if (url) {
      window.open(url, '_blank');
      return;
    }
  } catch (error) {
    // TODO: surface toast or UI error state if needed.
    console.error('Failed to get presigned URL for download', error);
  }

  // Fallback: hit the endpoint directly (may stream the file).
  const base = resolveApiBaseUrl().replace(/\/+$/, '');
  const fullUrl = `${base}${endpoint}`;
  window.open(fullUrl, '_blank');
}
