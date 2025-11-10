'use client';

import { useMemo } from 'react';
import { Bot } from 'lucide-react';
import { useSession } from '../../auth/hooks';

/**
 * Get time-based greeting based on user's timezone
 */
function getTimeGreeting(tz?: string): string {
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

/**
 * WelcomeMessage Component
 *
 * Displays a personalized welcome message when the chat is empty.
 * Uses session data to greet the user by company name and provides
 * context about BuildSuite AI capabilities.
 *
 * Automatically disappears after user sends first message or clicks starter prompt.
 *
 * Shows full branded version with session data, or centered fallback without.
 */
export function WelcomeMessage() {
  const { data: session, isLoading } = useSession();

  const greeting = useMemo(() => {
    if (isLoading) return 'Hello';

    const timeGreeting = getTimeGreeting(session?.timezone);
    const companyName = session?.companyName;

    if (companyName) {
      return `${timeGreeting}, ${companyName}`;
    }

    return timeGreeting;
  }, [session, isLoading]);

  // If we have session data with company name, show the full branded welcome message
  if (session?.companyName) {
    return (
      <div className="flex justify-start animate-in slide-in-from-bottom-2 fade-in-0 duration-500">
        <div className="max-w-[85%] rounded-md border bg-background px-4 py-3 shadow-sm">
          {/* Header with Bot Icon */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold">BuildSuite AI</span>
          </div>

          {/* Personalized Greeting */}
          <div className="space-y-3">
            <p className="text-base font-medium text-foreground">
              {greeting}
            </p>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              I'm the BuildSuite AI assistant. I help companies implement AI solutions through
              sales automation, CRM management, and custom workflows integrated into your existing systems.
            </p>

            {/* Call to Action */}
            <p className="text-sm text-muted-foreground">
              Ask me anything about leads, contacts, projects, or how I can help.
            </p>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground mt-3 opacity-70">
            Just now
          </div>
        </div>
      </div>
    );
  }

  // Fallback: Centered assistant-style message when no session data
  return (
    <div className="flex justify-center animate-in fade-in-0 duration-500">
      <div className="max-w-[85%] rounded-md border bg-background px-4 py-3">
        {/* Simple AI branding */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">BuildSuite AI</span>
        </div>

        {/* Fallback welcome text */}
        <div className="space-y-2">
          <p className="text-sm text-foreground">
            {greeting}
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed">
            I'm here to help you with sales automation, CRM management, and workflow integration.
            Ask me anything about leads, contacts, or projects.
          </p>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground mt-2 opacity-70">
          Just now
        </div>
      </div>
    </div>
  );
}
