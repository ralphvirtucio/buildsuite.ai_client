import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system:
      'You are a main agent orchestrator in a main agent, Read and understand the user query, Delegate task to other agents',
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
