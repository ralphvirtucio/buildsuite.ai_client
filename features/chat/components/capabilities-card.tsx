'use client';

import { useMemo } from 'react';
import {
  Bot,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  Settings,
  DollarSign,
  Users,
  Mail,
  MessageSquare,
  Zap,
  Search,
  FileText,
} from 'lucide-react';
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

interface AgentCapability {
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface ToolCategory {
  category: string;
  tools: string[];
  icon: React.ReactNode;
}

interface CapabilitiesCardProps {
  onSkipIntro?: () => void;
}

/**
 * CapabilitiesCard Component
 *
 * Displays a centered welcome card showcasing Kairo's agents and tools.
 * Personalized with user's name and company from session data.
 *
 * Automatically disappears after user sends first message.
 */
export function CapabilitiesCard({ onSkipIntro }: CapabilitiesCardProps) {
  const { data: session, isLoading } = useSession();

  const greeting = useMemo(() => {
    if (isLoading) return 'Hello';

    const timeGreeting = getTimeGreeting(session?.timezone);
    const firstName = session?.firstName;
    const companyName = session?.companyName;

    if (firstName && companyName) {
      return `Hi ${firstName} from ${companyName}`;
    } else if (firstName) {
      return `Hi ${firstName}`;
    } else if (companyName) {
      return `${timeGreeting}, ${companyName}`;
    }

    return timeGreeting;
  }, [session, isLoading]);

  const agents: AgentCapability[] = [
    {
      name: 'Sales Agent',
      description: 'CRM management, lead enrichment, contact tracking',
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      name: 'Marketing Agent',
      description: 'Campaign automation, analytics, workflows',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      name: 'Operations Agent',
      description: 'Project coordination, task management',
      icon: <Settings className="h-4 w-4" />,
    },
    {
      name: 'Estimating Agent',
      description: 'Cost estimates, project quotes',
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      name: 'Research Agent',
      description: 'Web research, competitive analysis, market trends',
      icon: <Search className="h-4 w-4" />,
    },
    {
      name: 'Writer Agent',
      description: 'Client emails, proposal sections, marketing copy',
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  const toolCategories: ToolCategory[] = [
    {
      category: 'CRM Management',
      tools: ['Contacts', 'Opportunities', 'Pipelines', 'Lead scoring'],
      icon: <Users className="h-3.5 w-3.5 text-primary" />,
    },
    {
      category: 'Email Operations',
      tools: ['Send emails', 'Draft emails', 'Search & analyze'],
      icon: <Mail className="h-3.5 w-3.5 text-primary" />,
    },
    {
      category: 'Communication',
      tools: ['Slack notifications', 'Team updates'],
      icon: <MessageSquare className="h-3.5 w-3.5 text-primary" />,
    },
    {
      category: 'Automations',
      tools: ['Trigger workflows', 'Research', 'Job posting'],
      icon: <Zap className="h-3.5 w-3.5 text-primary" />,
    },
    {
      category: 'Research & Content',
      tools: ['Research reports', 'Writer-ready briefs', 'Client-facing copy'],
      icon: <Search className="h-3.5 w-3.5 text-primary" />,
    },
  ];

  return (
    <div className="flex flex-1 justify-center items-center animate-in fade-in-0 zoom-in-95 duration-500">
      <div className="w-full max-w-md rounded-lg border bg-background shadow-md p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-sm">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-snug">BuildSuite AI</h2>
              <p className="text-[11px] text-muted-foreground leading-snug">Powered by Kairo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSkipIntro}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip intro
          </button>
        </div>

        {/* Personalized Greeting */}
        <div>
          <p className="text-sm font-medium text-foreground mb-1 leading-snug">{greeting}</p>
          <p className="text-xs text-muted-foreground leading-snug">
            I&apos;m Kairo, your AI assistant. Here&apos;s what I can help with today:
          </p>
        </div>

        {/* Agents Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Specialized Agents
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="flex items-start gap-2 p-2 rounded-md bg-muted/40 border border-border/40"
              >
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="text-primary flex-shrink-0">{agent.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">
                      {agent.name.replace(' Agent', '')}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tools Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Key Capabilities
          </h3>
          <div className="space-y-1.5">
            {toolCategories.map((category) => (
              <div key={category.category} className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">{category.icon}</span>
                <div>
                  <span className="text-xs font-medium text-foreground">{category.category}</span>
                  <span className="text-xs text-muted-foreground">
                    : {category.tools.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-center text-muted-foreground">
            Choose an agent below or ask me anything to get started
          </p>
        </div>
      </div>
    </div>
  );
}
