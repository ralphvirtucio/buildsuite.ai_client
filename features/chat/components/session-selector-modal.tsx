'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, X, PlusCircle } from 'lucide-react';
import type { ConversationSummary } from '../types';

interface SessionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeConversationId?: string | null;
  conversations: ConversationSummary[];
  onResume: (conversationId: string) => void;
  onStartNew: () => void;
  onDelete: (conversationId: string) => void;
}

export function SessionSelectorModal({
  isOpen,
  onClose,
  activeConversationId,
  conversations,
  onResume,
  onStartNew,
  onDelete,
}: SessionSelectorModalProps) {
  const hasConversations = conversations.length > 0;

  const sortedConversations = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        const aTime = a.updated_at ?? a.created_at;
        const bTime = b.updated_at ?? b.created_at;
        return (bTime ?? '').localeCompare(aTime ?? '');
      }),
    [conversations],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border bg-background shadow-lg p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-sm font-semibold leading-none">Your conversations</h2>
              <p className="text-xs text-muted-foreground">
                Resume a previous chat or start a new one.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {hasConversations ? (
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {sortedConversations.map((c) => {
              const updated = c.updated_at ?? c.created_at;
              const dateLabel = updated ? new Date(updated).toLocaleString() : 'Unknown';
              const isActive = activeConversationId === c.id;
              const channelLabel = c.channel ?? 'chat';
              const title = (c.title ?? '').trim() || `Session (${channelLabel})`;

              return (
                <div
                  key={c.id}
                  className={`w-full rounded-md border px-3 py-2 text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'bg-background hover:bg-accent hover:text-accent-foreground'
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onResume(c.id);
                    onClose();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onResume(c.id);
                      onClose();
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted/60 text-primary">
                        <MessageSquare className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium line-clamp-1">{title}</span>
                        <span className="mt-1 text-xs text-muted-foreground">{dateLabel}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-600"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onDelete(c.id);
                        }}
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            You have no previous conversations yet. Start a new one to begin chatting.
          </div>
        )}

        <div className="flex justify-between pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onStartNew}
            className="inline-flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New conversation</span>
          </Button>
          {hasConversations && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Continue current
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
