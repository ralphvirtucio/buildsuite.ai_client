'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

function getPreferredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
  if (stored === 'light' || stored === 'dark') return stored;
  const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  return mq && mq.matches ? 'dark' : 'light';
}

function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const initial = getPreferredTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} aria-label="Toggle theme">
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
