import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Paperclip, Send, Bot } from 'lucide-react';

export default function Chat() {
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col px-4 py-8">
      <div className="mb-4 flex w-full items-center justify-end">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Hello, I’m Kairo</h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Powerful assistant for your tasks. I have agents — would you like to know the agents
            that we have?
          </p>
        </div>

        <div className="flex w-full max-w-2xl items-end gap-2">
          <Button type="button" variant="ghost" className="h-10 px-3" aria-label="Attach files">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            className="flex-1 border-0 bg-muted focus-visible:ring-1"
            placeholder="Type your message…"
            aria-label="Message"
          />
          <Button type="button" className="h-10 px-3" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
