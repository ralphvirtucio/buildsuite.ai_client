export type TriggerStatus = 'processing' | 'completed' | 'failed';

// Mirrors kairo_brain/app/models/triggers.py: ChatTriggerRequest
export interface ChatTriggerPayload {
  message: string;
  session_id: string;
  user_id?: string;
  conversation_history?: Array<{ role: ChatRole; content: string }>;
  stream?: boolean;
  init?: boolean; // True if Kairo should initiate conversation
}

// Mirrors TriggerResponse from backend
export interface TriggerResponse {
  status: TriggerStatus;
  message: string;
  session_id?: string;
  result?: string;
  error?: string;
  timestamp: string; // ISO datetime
}

export interface ApiError {
  message?: string;
  statusCode?: number;
}

// Local UI types
export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  metadata?: {
    toolCalls?: Array<{ name: string; status: 'completed' | 'failed'; error?: string }>;
    agentCalls?: Array<{ name: string; status: 'completed' | 'failed'; error?: string }>;
  };
}

// SSE Event Types from kairo_brain streaming
export type SSEEventType = 'start' | 'tool' | 'agent' | 'delta' | 'final' | 'error';

export interface SSEEvent {
  type: SSEEventType;
  session_id?: string;
  name?: string;
  status?: 'completed' | 'failed';
  error?: string;
  text?: string;
}
