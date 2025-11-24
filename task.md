# Client Task Board – User Sessions & Conversation Selector

This file tracks the current tasks for the **frontend** (client) related to
user sessions and the session selector pop‑up.

Backend tasks live under `kairo_brain/task.md`.

---

## Status Legend

- [ ] Not started
- [~] In progress
- [x] Completed

---

## Planning & Documentation

- [x] Write frontend implementation plan for user session & conversation selector (`USER_SESSION_FRONTEND_IMPLEMENTATION.md`).
- [x] Review and refine the plan with the human (scope, UX details, and API assumptions).

---

## Session State & Initialization

- [x] Introduce or extend a chat/session context or hook to hold:
  - `sessionId`, `conversationId`
  - `buildsuiteUserId`, `locationId`
  - `conversations`, `messages`
  - `isSessionSelectorOpen`
- [x] Integrate session initialization in `client/features/chat/index.tsx`:
  - [x] Use existing `useSession()` hook to obtain initial `sessionId`.
  - [x] Call `/api/v1/auth/validate_session` (via `/api/session`) to confirm validity and obtain user metadata.
  - [x] Store `buildsuiteUserId` and `locationId` in state.

---

## Conversation Listing & Selection

- [x] Fetch and store user conversations:
  - [x] Call `/api/v1/conversations?user_id=buildsuiteUserId`.
  - [x] Save the list as `conversations` in state.
- [ ] Session Selector Modal:
  - [x] Create `SessionSelectorModal` component.
  - [x] Show recent conversations in the modal with basic metadata.
  - [x] Add “Resume” action:
    - [x] On click, load conversation messages for the chosen item.
  - [x] Add “Start new session” action:
    - [x] Call `/api/v1/auth/create_session` with current `locationId` and (optionally) user metadata.
    - [x] Update the active `sessionId` used by chat and clear local `messages` to start a fresh conversation context.
  - [x] Integrate modal into chat:
    - [x] Automatically open on initial load when conversations exist.
    - [x] Add “Sessions” button in chat header to reopen it.

---

## Conversation Hydration & Messaging

- [x] When resuming a session:
  - [x] Call `/api/v1/conversations/{conversation_id}`.
  - [x] Seed `messages` from the returned `messages` array.
- [x] Ensure the existing streaming/non-streaming chat logic:
  - [x] Always uses the current `sessionId` (from `/api/session`).
  - [x] Appends user and assistant messages without breaking the SSE flow.

---

## UX & Error Handling

- [x] Empty state:
  - [x] Handle case where user has no conversations (show empty-state message and “Start new session”).
- [ ] Error cases:
  - [ ] Invalid or expired session from `/validate_session`.
  - [x] Failed `conversations` or `conversation detail` fetches.
- [ ] Mobile behavior:
  - [ ] Ensure the modal is usable on small screens (scrollable content, full-screen dialog if needed).

---

## Future Enhancements (Nice to Have)

- [x] Allow mid-chat session switching (via header button) without page reload.
- [ ] Display more detailed summaries in the session list:
  - [ ] Last message snippet.
  - [ ] Dominant agent involved (e.g., sales, research).
- [ ] Add pagination/infinite scroll for conversations if the list grows large.
- [x] Add ability to delete individual conversations from the session selector UI.

---

## Research Agent – Markdown Rendering & Download

- [x] Add a `MarkdownMessage` component for rendering assistant messages in markdown (headings, lists, links).
- [x] Extend `ChatMessage` type to support a `format` or `contentType` field (e.g., `'plain' | 'markdown'`).
- [x] Update chat rendering to use `MarkdownMessage` for research reports (or all assistant messages).
- [x] Ensure markdown links open in a new tab and are clearly styled as clickable.
- [x] Add a “Download .md” action for research report messages that:
  - [x] Generates a client-side `.md` file from the message content.
  - [x] Uses a sensible filename (e.g., `research-report-{date}.md`).

---

## Research & Writer Agents – Pill Prompts & Capabilities Card

- [x] Review Research & Writer agent backend docs and state to understand available capabilities.
- [x] Extend `PillPrompts` with Research and Writer agent quick-action pills.
- [x] Update `CapabilitiesCard` to list Research and Writer under Specialized Agents and reflect their key capabilities.
- [x] Refresh pill prompt wording to match live Kairo agent capabilities and clearer CTAs.
- [ ] Manual QA: verify new pills and capabilities card content on desktop and mobile (no overlap or overflow issues).
