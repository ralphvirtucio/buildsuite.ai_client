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
  format?: 'plain' | 'markdown';
  metadata?: Record<string, unknown>;
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
  format?: 'plain' | 'markdown';
  metadata?: {
    toolCalls?: Array<{ name: string; status: 'completed' | 'failed'; error?: string }>;
    agentCalls?: Array<{ name: string; status: 'completed' | 'failed'; error?: string }>;
    isResearchReport?: boolean;
  };
}

export interface ConversationSummary {
  id: string;
  session_id: string;
  user_id?: string | null;
  channel: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
  expires_at?: string | null;
   title?: string | null;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: ChatRole;
  content: string;
  agent_name?: string | null;
  metadata?: Record<string, unknown> | null;
  is_research_report?: boolean;
  format?: 'plain' | 'markdown';
  created_at: string;
}

export interface ConversationDetailResponse {
  conversation: ConversationSummary;
  messages: ConversationMessage[];
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
   format?: 'plain' | 'markdown';
   is_research_report?: boolean;
}
