'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import type { ConversationSummary } from '../types';

interface SessionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationSummary[];
  onResume: (conversationId: string) => void;
  onStartNew: () => void;
}

export function SessionSelectorModal({
  isOpen,
  onClose,
  conversations,
  onResume,
  onStartNew,
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
      <div className="w-full max-w-md rounded-lg border bg-background shadow-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Sessions</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {hasConversations ? (
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {sortedConversations.map((c) => {
              const updated = c.updated_at ?? c.created_at;
              const dateLabel = updated ? new Date(updated).toLocaleString() : 'Unknown';
              const channelLabel = c.channel ?? 'chat';

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onResume(c.id);
                    onClose();
                  }}
                  className="w-full rounded-md border bg-background px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Session ({channelLabel})
                    </span>
                    <span className="text-xs text-muted-foreground">{c.status}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{dateLabel}</div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            You have no previous sessions yet. Start a new session to begin a conversation.
          </div>
        )}

        <div className="flex justify-between pt-2 border-t">
          <Button variant="outline" size="sm" onClick={onStartNew}>
            Start New Session
          </Button>
          {hasConversations && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Continue Current
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

