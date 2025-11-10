'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useSession } from '../../auth/hooks';

interface StarterPromptsProps {
  onPromptClick: (prompt: string) => void;
  isCollapsed?: boolean;
}

function getTimeGreeting(tz?: string) {
  try {
    if (!tz) return 'Good day';
    const now = new Date();
    const hour = parseInt(
      now.toLocaleString('en-US', { timeZone: tz, hour: 'numeric', hour12: false }).split(',')[0] || '12',
    );
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  } catch {
    return 'Good day';
  }
}

export function StarterPrompts({ onPromptClick }: StarterPromptsProps) {
  const { data: session } = useSession();

  const firstName = session?.firstName || '';
  const hello = useMemo(() => `Hi${firstName ? `, ${firstName}` : ''}!`, [firstName]);

  const suggestions = useMemo(
    () => [
      // Sales & CRM tools
      'Leads with no recent follow-up', // get_contacts + heuristics
      'Pipeline summary for this week', // get_pipeline_metrics
      'Find a contact by email', // search_contact_by_email
      'Create a new contact', // create_contact
      // Operations / Projects
      "Today’s schedule and tasks", // scheduling/task mgmt (ops)
      'Active projects that need attention', // ops overview
      // Marketing / Comms
      'Draft a follow-up email', // send_email/create_email_draft
      'Post an update to Slack', // slack_send_message
    ],
    [],
  );

  return (
    <section aria-label="Starter prompts" className="border-t bg-background/60">
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium text-foreground/90">{hello}</p>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Jump in with:</p>
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
      </div>
    </section>
  );
}
