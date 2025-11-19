# Chat UX Evolution Plan – Agents, Pills, and Capabilities

This plan describes how to evolve the chat UI as we add more agents (e.g., beyond Sales, Marketing, Operations, Estimating, Research, Writer) without overwhelming users with pills or dense copy.

The scope is **client-only UX**; backend orchestration and agent logic stay unchanged for now.

---

## Phase 1 – Stabilize Current Multi-Agent UI (Now)

Goal: Make the existing multi-agent UI solid and easy to understand with the current set of agents.

- Keep the current pattern:
  - Pill prompts as quick actions for key agents.
  - Capabilities card as a concise overview on an empty chat.
- Ensure Research and Writer agents are clearly represented:
  - Pill prompts have concrete, useful actions (research tasks, writing tasks).
  - Capabilities card describes what Research and Writer can do in 1–2 short lines each.
- UX acceptance criteria:
  - The first-time experience explains “what Kairo can do” in under ~10 seconds of reading.
  - A user can start a relevant task (e.g., research report → email) using only pills, without guessing terminology.

---

## Phase 2 – Avoid Pill Bar Overload (Up to ~10 Agents)

Goal: Support more agents without creating a wall of pills.

### 2.1 Prioritize & Group Pills

- Introduce a simple hierarchy:
  - **Primary pills** (always visible): 3–4 most used agents (e.g., Sales, Research, Writer, Operations).
  - **Secondary agents**: accessible via a single “More agents” pill.
- UX changes:
  - Replace some individual pills with:
    - A `More agents` pill that opens a menu listing the remaining agents by name and short label.
  - Optional grouping in the menu by domain (e.g., “Revenue”, “Operations”, “Knowledge & Content”).

### 2.2 Responsive Behavior

- Ensure the pill row degrades gracefully on narrow viewports:
  - Wrap into at most 2 visual rows, with overflow handled by:
    - Horizontal scroll, or
    - Truncating visible pills + moving the rest into `More agents`.
- Keep the input field and last message visible even with multiple pills, to avoid the UI feeling top-heavy.

---

## Phase 3 – Evolve the Capabilities Card (Many Agents, Many Skills)

Goal: Keep the empty-state card helpful and readable as capabilities grow.

### 3.1 Group Capabilities by Theme

- Replace a long flat list of agents with 3–4 themed sections, for example:
  - **Sales & CRM** – leads, contacts, opportunities, follow-ups.
  - **Operations** – tasks, projects, schedules.
  - **Research** – market/competitor/technical research, briefs.
  - **Content & Marketing** – emails, proposals, marketing copy.
- Within each theme:
  - Show 1–2 example tasks.
  - Link or hint that more tasks/agents exist (e.g., “+ more in Sales & CRM”).

### 3.2 “What Can Kairo Do?” Panel

- Add a small link/button on the card:
  - Label ideas: “View all capabilities” or “See everything Kairo can do”.
  - Clicking opens a side panel or modal with:
    - Full agent list (name, description, icon).
    - Example prompts per agent.
    - Optional search box (“I want to…”) that surfaces matching agents/prompts.

---

## Phase 4 – Smarter, Contextual Agent Suggestions

Goal: Reduce the need for users to manually pick agents once they start chatting.

- Use message context to suggest agents and prompts inline, for example:
  - If the user asks for comparisons or “latest trends”, suggest the Research Agent with a one-click action.
  - If the user mentions “email”, “follow up”, or “proposal”, suggest Writer prompts.
- UX pattern:
  - Small, unobtrusive chips under the last user message:
    - “Ask Research Agent” / “Draft email with Writer”.
  - Clicking inserts a tailored prompt into the input (or starts a follow-up turn pre-populated).

---

## Phase 5 – Optional Backend-Driven Agent Catalog

Goal: Make the UI configuration more maintainable as agents evolve.

- Introduce an agent metadata registry on the backend (optional future step):
  - Fields: `id`, `name`, `short_description`, `icon_key`, `category`, `example_prompts[]`, `is_primary`.
  - Expose via a lightweight `/api/v1/agents` endpoint.
- Client changes:
  - Derive:
    - Pills (primary agents),
    - “More agents” menu,
    - Capabilities card themes and agent lists
  - from the backend metadata instead of hard-coded arrays.
- Benefit:
  - Adding or updating agents mostly becomes a backend/config change instead of touching multiple UI components.

---

## Open Questions for Future Iterations

- How many agents do we realistically expect in the next 6–12 months?
- Which 3–4 agents should be considered “primary” for most BuildSuite users?
- Do we want different default visible pills for different user types (e.g., owner vs. estimator vs. marketer)?
- When we introduce the “View all capabilities” panel, should it be:
  - Always accessible (e.g., in header actions), or
  - Only as part of the empty state / help affordances?

