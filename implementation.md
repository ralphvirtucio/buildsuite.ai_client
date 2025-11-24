# Client Implementation – Research & Writer Agents UI

## Feature Scope – Pill Prompts & Capabilities Card

- Surface the new **Research** and **Writer** agents in the chat UI so users can easily discover and use them.
- Extend the existing **pill prompts** row to include focused quick actions for Research and Writer.
- Update the **CapabilitiesCard** empty state so it clearly communicates what the Research and Writer agents can do.
- Keep the implementation simple and static for now (no dynamic agent registry from the backend).

## Current Behavior (Client – Chat Agents UI)

- `client/features/chat/components/pill-prompts.tsx` renders quick‑action pills for:
  - Sales, Marketing, Operations, and Estimating agents.
  - Each pill opens a small dropdown of predefined prompts that are inserted into the input box.
- `client/features/chat/components/capabilities-card.tsx`:
  - Shows a greeting plus a list of “Specialized Agents” (Sales, Marketing, Operations, Estimating).
  - Lists “Key Capabilities” grouped into categories (CRM Management, Email Operations, Communication, Automations).
  - Does **not** yet mention the Research or Writer agents explicitly.

## Planned Changes (Client)

1. **Extend PillPrompts with Research & Writer agents**
   - File: `client/features/chat/components/pill-prompts.tsx`.
   - Add two new entries to `agentPrompts`:
     - `research` agent:
       - Gradient color distinct from existing agents.
       - Prompts focused on market/competitor/technical research (e.g., “Research a competitor”, “Summarize latest trends”, “Prepare research brief for a client”).
     - `writer` agent:
       - Gradient color distinct from others.
       - Prompts for email/proposal writing (e.g., “Draft follow‑up email from research”, “Write proposal intro”, “Polish this draft”).
   - Keep the component behavior unchanged:
     - Clicking a pill toggles its dropdown.
     - Clicking a prompt calls `onPromptClick` and closes the dropdown.

2. **Update CapabilitiesCard to highlight Research & Writer**
   - File: `client/features/chat/components/capabilities-card.tsx`.
   - Extend the `agents` list to include:
     - **Research Agent** – “Web research, competitive analysis, market trends”.
     - **Writer Agent** – “Client emails, proposal sections, marketing copy”.
   - Optionally refine `toolCategories`:
     - Add or adjust a category (e.g., “Research & Content”) that mentions research reports and writer‑ready content.
     - Keep the list compact so the card does not feel crowded.

3. **Keep Orchestrator & API Contract Unchanged**
   - No changes to `/api/v1/triggers/chat` or agent routing are required for this UI work.
   - Rely on the existing orchestrator/agent selection logic; the UI only provides clearer entry points into those flows.

## Latest Adjustments

- Refreshed all pill prompt lists to align with the active Kairo agents (sales, marketing, operations, estimating, research, writer) and make the call-to-actions clearer (e.g., “Show warm leads for follow-up”, “Trigger nurture workflow for this contact”, “Research a competitor and cite sources”, “Polish this draft and keep it on-brand”).

## Testing & Verification (Manual)

1. **Pill Prompts**
   - Open the chat UI.
   - Verify that “Research” and “Writer” pills appear alongside existing agents.
   - Click each pill and confirm:
     - The dropdown shows relevant prompts.
     - Clicking a prompt inserts it into the input and closes the dropdown.

2. **Capabilities Card**
   - Reload the chat page with no prior messages so the capabilities card is visible.
   - Confirm that:
     - Research and Writer appear under “Specialized Agents” with concise descriptions.
     - The “Key Capabilities” section mentions research and content writing without overwhelming the layout.

3. **Regression Checks**
   - Send a few normal questions to ensure the card still hides after the first message.
   - Confirm the existing Sales/Marketing/Operations/Estimating pills still behave as before.
