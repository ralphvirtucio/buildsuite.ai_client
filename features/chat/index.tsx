'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Paperclip, Send, Bot, Copy, Check } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSendChatMessageMutation } from './api';
import { useSession } from '../auth/hooks';
import { StarterPrompts } from './components/starter-prompts';
import { WelcomeMessage } from './components/welcome-message';
import axiosInstance from '@/lib/axios';
import type { ApiError, ChatMessage } from './types';
import { v4 as uuidv4 } from 'uuid';

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

// Removed welcome message generation; chat starts clean without auto assistant text.

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('Kairo is thinking...');
  const sessionId = useMemo(() => getOrCreateSessionId(), []);
  // Hardcoded user for demo/presentation
  const userId = uuidv4(); // TODO: replace with real auth user id
  const listRef = useRef<HTMLDivElement | null>(null);
  // No auto-injected welcome; messages start empty until user interacts

  // Fetch session data from backend for personalization
  const { data: sessionData, isLoading: sessionLoading } = useSession();

  const sendMutation = useSendChatMessageMutation();

  // Removed auto-welcome effect to avoid pre-filling assistant message

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
                type: 'start' | 'thinking' | 'tool' | 'agent' | 'delta' | 'final' | 'error';
                session_id?: string;
                name?: string;
                status?: 'completed' | 'failed';
                error?: string;
                text?: string;
                message?: string;
              };

              if (evt.type === 'start') {
                console.log('Chat session started:', evt.session_id);
                setProgressMessage('Kairo is thinking...');
              } else if (evt.type === 'thinking') {
                // Show thinking status with custom message
                const thinkingMsg = evt.message || 'Kairo is analyzing...';
                setProgressMessage(thinkingMsg);
                console.log('Kairo thinking:', thinkingMsg);
              } else if (evt.type === 'tool') {
                // Track tool call and update progress message
                const toolCall = {
                  name: evt.name || 'unknown',
                  status: evt.status || 'completed',
                  error: evt.error,
                };
                toolCalls.push(toolCall);

                // Update progress message with friendly text
                if (evt.message) {
                  setProgressMessage(evt.message);
                }
                console.log(`Tool ${evt.name}: ${evt.status}`);
              } else if (evt.type === 'agent') {
                // Track agent call and update progress message
                const agentCall = {
                  name: evt.name || 'unknown',
                  status: evt.status || 'completed',
                  error: evt.error,
                };
                agentCalls.push(agentCall);

                // Update progress message with friendly text
                if (evt.message) {
                  setProgressMessage(evt.message);
                }
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
                setProgressMessage('Kairo is thinking...'); // Reset for next message
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
              setProgressMessage('Kairo is thinking...'); // Reset on error
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
          // Update existing empty assistant message if it exists, otherwise add new one
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            // If last message is an empty assistant placeholder, update it
            if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.content) {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...lastMsg,
                content: assistantText,
              };
              return updated;
            }
            // Otherwise add new message
            return [
              ...prev,
              {
                id: crypto.randomUUID?.() ?? `${Date.now()}-a`,
                role: 'assistant',
                content: assistantText,
              },
            ];
          });
        },
        onError: (err2: ApiError) => {
          const msg = err2?.message || 'Something went wrong';
          // Remove empty placeholder if it exists, then add error message
          setMessages((prev) => {
            const filtered = prev.filter((m) => !(m.role === 'assistant' && !m.content));
            return [
              ...filtered,
              {
                id: crypto.randomUUID?.() ?? `${Date.now()}-e`,
                role: 'system',
                content: `Error: ${msg}`,
              },
            ];
          });
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
    <div className="mx-auto flex h-screen w-full max-w-3xl flex-col px-4 py-8">
      <div className="mb-4 flex w-full items-center justify-end">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 flex-col w-full overflow-hidden">
        {messages.length === 0 && sessionLoading ? (
          /* Loading state - waiting for session data */
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                <Bot className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">BuildSuite AI</h1>
                <p className="text-muted-foreground text-sm">Connecting...</p>
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={listRef}
            className="flex-1 overflow-y-scroll overflow-x-hidden px-1 pb-4 custom-scrollbar"
          >
            <div className="space-y-4">
              {/* Welcome Message - Shows only when no messages exist */}
              {messages.length === 0 && <WelcomeMessage />}

              {messages
                .filter((m) => {
                  // Always filter out empty assistant messages - typing indicator shows instead
                  if (m.role === 'assistant' && !m.content) {
                    return false;
                  }
                  return true;
                })
                .map((m) => (
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
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {m.content}
                        </div>

                        {/* Timestamp */}
                        <div
                          className={`text-xs mt-1 opacity-70 ${
                            m.role === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                          }`}
                        >
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
                      <button
                        onClick={() => copyToClipboard(m.content, m.id)}
                        className="absolute -top-2 -right-2 p-1.5 rounded-md bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Copy message"
                      >
                        {copiedId === m.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
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
                      <span className="text-sm text-muted-foreground">{progressMessage}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Starter Prompts - Visible above input */}
        <StarterPrompts onPromptClick={sendMessage} />

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
              placeholder={`Ask me anything about ${sessionData?.companyName || 'BuildSuite'}...`}
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
