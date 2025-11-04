'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Paperclip, Send, Bot, Copy, Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSendChatMessageMutation } from './api';
import axiosInstance from '@/lib/axios';
import type { ApiError, ChatMessage } from './types';

function getOrCreateSessionId(): string {
  // Prefer persisted session to retain chat context across reloads
  const KEY = 'chat_session_id';
  const existing = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
  if (existing) return existing;
  // UUID for session_id per instruction
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  if (typeof window !== 'undefined') localStorage.setItem(KEY, id);
  return id;
}

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const sessionId = useMemo(() => getOrCreateSessionId(), []);
  // Hardcoded user for demo/presentation
  const userId = 'demo_user_00000000-0000-4000-8000-000000000000'; // TODO: replace with real auth user id
  const listRef = useRef<HTMLDivElement | null>(null);

  const sendMutation = useSendChatMessageMutation();

  // No auto-initialization - user must interact first
  // Welcome screen stays visible until user clicks a prompt or sends a message

  async function sendStream(payload: {
    message: string;
    session_id: string;
    user_id: string;
    conversation_history: Array<{ role: string; content: string }>;
    init?: boolean;
  }) {
    const base =
      axiosInstance.defaults.baseURL ||
      process.env.NEXT_PUBLIC_API_ENDPOINT_URL ||
      'http://localhost:8000/api/v1';
    const url = `${base}/triggers/chat`;

    // Ensure demo token exists
    const token = localStorage.getItem('token') || 'demo-development-token';
    localStorage.setItem('token', token);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...payload, stream: true }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('No stream available');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let assistantMessageId: string | null = null;
    const toolCalls: Array<{ name: string; status: 'completed' | 'failed'; error?: string }> = [];
    const agentCalls: Array<{ name: string; status: 'completed' | 'failed'; error?: string }> = [];

    // Create an assistant placeholder if not present
    const newMsgId = crypto.randomUUID?.() ?? `${Date.now()}-ap`;
    assistantMessageId = newMsgId;
    setMessages((prev) => {
      const hasPending = prev.some((m) => m.role === 'assistant' && m.content === '');
      return hasPending
        ? prev
        : [
            ...prev,
            {
              id: newMsgId,
              role: 'assistant',
              content: '',
              metadata: { toolCalls: [], agentCalls: [] },
            },
          ];
    });

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const sse = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        const lines = sse.split('\n');
        for (const line of lines) {
          const prefix = 'data: ';
          if (line.startsWith(prefix)) {
            const payloadStr = line.slice(prefix.length);
            if (!payloadStr) continue;
            try {
              const evt = JSON.parse(payloadStr) as {
                type: 'start' | 'tool' | 'agent' | 'delta' | 'final' | 'error';
                session_id?: string;
                name?: string;
                status?: 'completed' | 'failed';
                error?: string;
                text?: string;
              };

              if (evt.type === 'start') {
                console.log('Chat session started:', evt.session_id);
              } else if (evt.type === 'tool') {
                // Track tool call
                const toolCall = {
                  name: evt.name || 'unknown',
                  status: evt.status || 'completed',
                  error: evt.error,
                };
                toolCalls.push(toolCall);
                console.log(`Tool ${evt.name}: ${evt.status}`);
              } else if (evt.type === 'agent') {
                // Track agent call
                const agentCall = {
                  name: evt.name || 'unknown',
                  status: evt.status || 'completed',
                  error: evt.error,
                };
                agentCalls.push(agentCall);
                console.log(`Agent ${evt.name}: ${evt.status}`);
              } else if (evt.type === 'delta') {
                // Append text delta to assistant message
                const textChunk = evt.text || '';
                setMessages((prev) => {
                  const next = [...prev];
                  const idx = next.findIndex((m) => m.id === assistantMessageId);
                  if (idx !== -1) {
                    const existing = next[idx];
                    next[idx] = {
                      ...existing,
                      content: (existing.content || '') + textChunk,
                      metadata: { toolCalls: [...toolCalls], agentCalls: [...agentCalls] },
                    };
                  }
                  return next;
                });
              } else if (evt.type === 'final') {
                // Final message received
                console.log('Chat completed:', evt.text);
                setIsStreaming(false);
                // Update with final metadata
                setMessages((prev) => {
                  const next = [...prev];
                  const idx = next.findIndex((m) => m.id === assistantMessageId);
                  if (idx !== -1) {
                    next[idx] = {
                      ...next[idx],
                      metadata: { toolCalls: [...toolCalls], agentCalls: [...agentCalls] },
                    };
                  }
                  return next;
                });
                return;
              } else if (evt.type === 'error') {
                throw new Error(evt.error || 'Unknown error');
              }
            } catch (e) {
              console.error('SSE parse error', e);
              setIsStreaming(false);
              throw e;
            }
          }
        }
      }
    }
    setIsStreaming(false);
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper function to send a message programmatically
  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // append user message locally
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID?.() ?? `${Date.now()}-u`, role: 'user', content: text },
    ]);

    const payload = {
      message: text,
      session_id: sessionId,
      user_id: userId,
      conversation_history: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
    };

    // Prefer streaming; fallback to non-stream mutation if it fails
    setIsStreaming(true);
    sendStream(payload).catch((err) => {
      console.warn('Streaming failed, falling back to non-streaming', err);
      setIsStreaming(false);
      sendMutation.mutate(payload, {
        onSuccess: (data) => {
          const assistantText = data.result ?? data.message ?? 'No response';
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID?.() ?? `${Date.now()}-a`,
              role: 'assistant',
              content: assistantText,
            },
          ]);
        },
        onError: (err2: ApiError) => {
          const msg = err2?.message || 'Something went wrong';
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID?.() ?? `${Date.now()}-e`,
              role: 'system',
              content: `Error: ${msg}`,
            },
          ]);
        },
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    sendMessage(text);
    setInput('');
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isStreaming]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-8">
      <div className="mb-4 flex w-full items-center justify-end">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 flex-col w-full">
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-4">
            <div className="text-center space-y-6 max-w-2xl w-full">
              {/* Logo/Brand */}
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                <Bot className="h-8 w-8" />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  BuildSuite AI
                </h1>
                <p className="text-lg text-muted-foreground">
                  Your intelligent assistant for Alliance Contractors
                </p>
              </div>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => sendMessage('Show me recent leads from this week')}
                  className="p-4 text-left rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                  disabled={isStreaming}
                >
                  <div className="font-medium text-sm">📊 Show recent leads</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    View leads from this week
                  </div>
                </button>
                <button
                  onClick={() => sendMessage('Check my schedule for today')}
                  className="p-4 text-left rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                  disabled={isStreaming}
                >
                  <div className="font-medium text-sm">📅 Check my schedule</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    See upcoming appointments
                  </div>
                </button>
                <button
                  onClick={() => sendMessage('Get updates on active projects')}
                  className="p-4 text-left rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                  disabled={isStreaming}
                >
                  <div className="font-medium text-sm">💼 Get project updates</div>
                  <div className="text-xs text-muted-foreground mt-1">Latest project status</div>
                </button>
                <button
                  onClick={() => sendMessage('Help me draft a message to a client')}
                  className="p-4 text-left rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors"
                  disabled={isStreaming}
                >
                  <div className="font-medium text-sm">📧 Draft a message</div>
                  <div className="text-xs text-muted-foreground mt-1">Create email or text</div>
                </button>
              </div>

              {/* Powered by */}
              <p className="text-xs text-muted-foreground pt-4">Powered by Kairo AI</p>
            </div>
          </div>
        ) : (
          <div ref={listRef} className="flex-1 overflow-y-auto px-1 pb-4">
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`
                    ${m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                    animate-in slide-in-from-bottom-2 fade-in-0 duration-300
                  `}
                >
                  <div className="group relative max-w-[85%]">
                    <div
                      className={
                        m.role === 'user'
                          ? 'rounded-md bg-primary text-primary-foreground px-4 py-2'
                          : m.role === 'assistant'
                          ? 'rounded-md border bg-background px-4 py-2'
                          : 'rounded-md bg-muted text-muted-foreground px-4 py-2'
                      }
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>

                      {/* Timestamp */}
                      <div className="text-xs text-muted-foreground mt-1 opacity-60">
                        {new Date().toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>

                      {/* Tool and Agent Calls - Better Badges */}
                      {m.metadata &&
                      (m.metadata.toolCalls?.length || m.metadata.agentCalls?.length) ? (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <div className="flex flex-wrap gap-1.5">
                            {m.metadata.toolCalls?.map((tool, idx) => (
                              <span
                                key={`tool-${idx}`}
                                className={`
                                  inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                                  ${
                                    tool.status === 'completed'
                                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                  }
                                `}
                              >
                                <span className="text-xs">🔧</span>
                                <span>{tool.name}</span>
                                {tool.status === 'completed' ? '✓' : '✗'}
                              </span>
                            ))}
                            {m.metadata.agentCalls?.map((agent, idx) => (
                              <span
                                key={`agent-${idx}`}
                                className={`
                                  inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                                  ${
                                    agent.status === 'completed'
                                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                  }
                                `}
                              >
                                <span className="text-xs">🤖</span>
                                <span>{agent.name}</span>
                                {agent.status === 'completed' ? '✓' : '✗'}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Copy button - only show for assistant messages */}
                    {m.role === 'assistant' && m.content && (
                      <button
                        onClick={() => copyToClipboard(m.content, m.id)}
                        className="absolute -top-2 -right-2 p-1.5 rounded-md bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Copy message"
                      >
                        {copiedId === m.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(isStreaming || sendMutation.isPending) && (
                <div className="flex justify-start animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
                  <div className="max-w-[85%] rounded-md border bg-background px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">Kairo is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="sticky bottom-0 w-full pt-3 bg-gradient-to-t from-background via-background/95 to-transparent">
          <form
            className="mx-auto flex w-full max-w-2xl items-end gap-2 px-1"
            onSubmit={handleSubmit}
          >
            <Button type="button" variant="ghost" className="h-10 px-3" aria-label="Attach files">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              className="flex-1 border-0 bg-muted focus-visible:ring-1"
              placeholder="Type your message…"
              aria-label="Message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isStreaming || sendMutation.isPending}
            />
            <Button
              type="submit"
              className="h-10 px-3"
              aria-label="Send message"
              disabled={isStreaming || sendMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
