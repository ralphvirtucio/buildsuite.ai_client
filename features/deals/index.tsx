'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { Briefcase, Construction } from 'lucide-react';

export default function Deals() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background px-4 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Deals Engine</h1>
              <p className="text-xs text-muted-foreground">
                Available deals matched to your skills and expertise
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mx-auto">
            <Construction className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Deals Engine Coming Soon</h2>
          <p className="text-muted-foreground">
            View and claim deals matched to your contractor profile based on the 13-pillar classification system.
          </p>
          <div className="pt-4 space-y-2 text-sm text-left bg-muted/50 p-4 rounded-lg">
            <p className="font-medium">Features in development:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Smart deal matching based on your skills</li>
              <li>• Direct deal claiming and acceptance</li>
              <li>• Deals from both GHL CRM and internal sources</li>
              <li>• Filter by location, value, and project type</li>
              <li>• Track your claimed and active deals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
