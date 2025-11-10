'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface StarterPromptsProps {
  onPromptClick: (prompt: string) => void;
  isCollapsed?: boolean;
}

interface CategoryPrompts {
  title: string;
  icon: string;
  prompts: string[];
}

const CATEGORIES: CategoryPrompts[] = [
  {
    title: 'Sales & CRM',
    icon: '🎯',
    prompts: [
      'Show me recent leads from this week',
      'Which leads need follow-up today?',
      "What's my pipeline value this month?",
      'Find hot leads ready to close',
    ],
  },
  {
    title: 'Operations',
    icon: '📅',
    prompts: [
      'Show my schedule for today',
      'What tasks are overdue?',
      'Get updates on active projects',
      'Schedule a follow-up with a client',
    ],
  },
  {
    title: 'Estimating',
    icon: '💰',
    prompts: [
      'Create an estimate for a roofing project',
      "What's the typical cost for HVAC installation?",
      'Generate a quote for a recent lead',
    ],
  },
  {
    title: 'Marketing',
    icon: '📧',
    prompts: [
      'Draft a follow-up email for a client',
      'Create social media content about our services',
      'Help me write a project proposal',
    ],
  },
];

const QUICK_ACTIONS = [
  { text: 'Show Leads', prompt: 'Show me recent leads from this week', icon: '📊' },
  { text: 'My Schedule', prompt: 'Show my schedule for today', icon: '📅' },
  { text: 'Create Quote', prompt: 'Create an estimate for a project', icon: '💰' },
];

export function StarterPrompts({ onPromptClick, isCollapsed: initialCollapsed = false }: StarterPromptsProps) {
  return (
    <div className="border-t bg-gradient-to-br from-muted/20 to-muted/5">
      <div className="p-4 space-y-4">
        {/* Quick Actions - Always Visible */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_ACTIONS.map((action, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => onPromptClick(action.prompt)}
                className="justify-start text-left h-auto py-2 px-3"
              >
                <span className="mr-1.5" aria-hidden="true">{action.icon}</span>
                <span className="text-xs">{action.text}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Expandable Categories */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">More Options</p>
          {CATEGORIES.map((category, idx) => (
            <details key={idx} className="group">
              <summary className="cursor-pointer list-none flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent transition-colors">
                <span className="text-sm font-medium flex items-center gap-2">
                  <span aria-hidden="true">{category.icon}</span>
                  {category.title}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-1 ml-6 space-y-1">
                {category.prompts.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => onPromptClick(prompt)}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
