'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Briefcase, TrendingUp, Settings, DollarSign } from 'lucide-react';

interface AgentPrompt {
  agent: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  prompts: string[];
}

interface PillPromptsProps {
  onPromptClick: (prompt: string) => void;
}

const agentPrompts: AgentPrompt[] = [
  {
    agent: 'sales',
    icon: <Briefcase className="h-3.5 w-3.5" />,
    label: 'Sales',
    color: 'from-blue-500 to-blue-600',
    prompts: [
      'Show recent leads',
      'Pipeline summary',
      'Score leads',
      'Find contact by email',
      'Create new contact',
      'Get opportunities',
    ],
  },
  {
    agent: 'marketing',
    icon: <TrendingUp className="h-3.5 w-3.5" />,
    label: 'Marketing',
    color: 'from-purple-500 to-purple-600',
    prompts: [
      'Campaign analytics',
      'Trigger marketing workflow',
      'Research competitors',
      'Get contact count',
    ],
  },
  {
    agent: 'operations',
    icon: <Settings className="h-3.5 w-3.5" />,
    label: 'Operations',
    color: 'from-green-500 to-green-600',
    prompts: [
      "Today's tasks and schedule",
      'Project breakdown',
      'Trigger automation workflow',
      'Add contact to workflow',
    ],
  },
  {
    agent: 'estimating',
    icon: <DollarSign className="h-3.5 w-3.5" />,
    label: 'Estimating',
    color: 'from-orange-500 to-orange-600',
    prompts: [
      'Get opportunities for quotes',
      'Pipeline metrics',
      'Recent project estimates',
    ],
  },
];

/**
 * PillPrompts Component
 *
 * Displays agent-specific quick action pills above the input field.
 * Each pill opens a dropdown with relevant prompts for that agent.
 *
 * Helps the orchestrator route requests to the correct specialist agent.
 */
export function PillPrompts({ onPromptClick }: PillPromptsProps) {
  const [openAgent, setOpenAgent] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenAgent(null);
      }
    }

    if (openAgent) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openAgent]);

  const handlePillClick = (agent: string) => {
    setOpenAgent(openAgent === agent ? null : agent);
  };

  const handlePromptClick = (prompt: string) => {
    onPromptClick(prompt);
    setOpenAgent(null);
  };

  return (
    <div className="relative border-t bg-background/60 pt-2 pb-1">
      <div className="flex flex-wrap gap-2 px-1">
        {agentPrompts.map((agentPrompt) => (
          <div key={agentPrompt.agent} className="relative" ref={dropdownRef}>
            {/* Pill Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-full px-3 text-xs font-medium flex items-center gap-1.5"
              onClick={() => handlePillClick(agentPrompt.agent)}
            >
              {agentPrompt.icon}
              {agentPrompt.label}
              <ChevronDown
                className={`h-3 w-3 transition-transform ${
                  openAgent === agentPrompt.agent ? 'rotate-180' : ''
                }`}
              />
            </Button>

            {/* Dropdown Menu */}
            {openAgent === agentPrompt.agent && (
              <div className="absolute bottom-full left-0 mb-2 z-50 w-64 rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
                {/* Header */}
                <div
                  className={`px-3 py-2 border-b bg-gradient-to-r ${agentPrompt.color} text-white rounded-t-md flex items-center gap-1.5`}
                >
                  <span className="flex-shrink-0">{agentPrompt.icon}</span>
                  <p className="text-xs font-semibold">
                    {agentPrompt.label} Agent
                  </p>
                </div>

                {/* Prompts */}
                <div className="p-1.5">
                  {agentPrompt.prompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePromptClick(prompt)}
                      className="w-full text-left px-3 py-2 text-xs rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-muted-foreground text-center mt-2 px-1">
        Choose an agent for quick actions or type your own question
      </p>
    </div>
  );
}
