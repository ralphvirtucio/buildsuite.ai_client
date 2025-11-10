'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface StarterPromptsProps {
  onPromptClick: (prompt: string) => void;
  isCollapsed?: boolean;
}

export function StarterPrompts({ onPromptClick }: StarterPromptsProps) {
  const suggestions = useMemo(
    () => [
      // Sales & CRM tools
      'Leads with no recent follow-up',
      'Pipeline summary for this week',
      'Find a contact by email',
      'Create a new contact',
      // Operations / Projects
      "Today's schedule and tasks",
      'Active projects that need attention',
      // Marketing / Comms
      'Draft a follow-up email',
      'Post an update to Slack',
    ],
    [],
  );

  return (
    <section aria-label="Starter prompts" className="border-t bg-background/60">
      <div className="p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground">Try asking about:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              className="h-8 rounded-full px-3"
              onClick={() => onPromptClick(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
