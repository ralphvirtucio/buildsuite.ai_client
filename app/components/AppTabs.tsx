'use client';

import { useState } from 'react';
import { MessageSquare, FileText, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import Chat from '@/features/chat';
import Documents from '@/features/documents';
import Deals from '@/features/deals';

type TabId = 'chat' | 'documents' | 'deals';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

const tabs: Tab[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare, component: Chat },
  { id: 'documents', label: 'Documents', icon: FileText, component: Documents },
  { id: 'deals', label: 'Deals', icon: Briefcase, component: Deals },
];

export function AppTabs() {
  const [activeTab, setActiveTab] = useState<TabId>('chat');

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component;

  return (
    <div className="h-screen flex flex-col">
      {/* Tab Bar */}
      <div
        className="border-b border-border bg-background"
        role="tablist"
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex gap-1 h-14">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tab.id}-panel`}
                  id={`${tab.id}-tab`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                    'border-b-2 -mb-px',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 flex min-h-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${tab.id}-panel`}
            aria-labelledby={`${tab.id}-tab`}
            hidden={activeTab !== tab.id}
            className="h-full flex-1 min-h-0"
          >
            {activeTab === tab.id && <tab.component />}
          </div>
        ))}
      </div>
    </div>
  );
}
