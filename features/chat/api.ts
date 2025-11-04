"use client";

import { useApiMutation } from '@/lib/axios';
import type { ChatTriggerPayload, TriggerResponse, ApiError } from './types';

export function useSendChatMessageMutation() {
  // Endpoint path matches FastAPI router: /api/v1/triggers/chat
  return useApiMutation<TriggerResponse, ApiError, ChatTriggerPayload>(
    '/triggers/chat',
  );
}

