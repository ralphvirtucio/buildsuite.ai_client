# Playwright UI Smoke Tests – BuildSuite Client

Date: 2025-11-19
Target: http://localhost:3000
Scope: Chat screen (capabilities card, pill prompts, session selector, header actions, streaming messages).

## Test Cases

### 1. Initial Load & Capabilities Card
- **Steps**
  - Navigate to `/`.
- **Expected**
  - Header shows **Conversations** and **Toggle theme** buttons.
  - Capabilities card is visible with greeting and agent list.
  - Pill prompts row shows: Sales, Marketing, Operations, Estimating, Research, Writer.
- **Observed**
  - All elements present; card lists **Sales, Marketing, Operations, Estimating, Research, Writer** under “Specialized Agents”.
  - “Key Capabilities” includes a **Research & Content** line.
- **Status**: ✅ Pass

### 2. Session Selector Modal
- **Steps**
  - Click **Conversations** in header.
- **Expected**
  - “Your conversations” modal appears, listing past conversations and actions.
- **Observed**
  - Modal shows conversation rows with title, timestamp, delete icon.
  - Footer buttons: **New conversation**, **Continue current**.
- **Status**: ✅ Pass

### 3. Theme Toggle
- **Steps**
  - Close the session selector.
  - Click **Toggle theme**.
- **Expected**
  - App switches theme (icon/state changes).
- **Observed**
  - Toggle becomes active and snapshot indicates theme change.
- **Status**: ✅ Pass

### 4. Capabilities Card – Compact Layout & Dismiss
- **Steps**
  - On an empty chat, inspect the capabilities card.
  - Click **Skip intro**.
- **Expected**
  - Card uses compact layout; Skip intro hides the card.
- **Observed**
  - Smaller logo (h-10 w-10), tighter headings, shorter intro copy.
  - **Skip intro** button is present in the card header.
  - After moving the Skip intro state into `Chat` and wiring `CapabilitiesCard` via an `onSkipIntro` prop, clicking **Skip intro** hides the card and leaves only the pills + input area; no runtime errors are reported.
- **Status**: ✅ Pass

### 5. Pill Prompts – Sales Agent
- **Steps**
  - Click **Sales** pill.
  - Choose **Show recent leads** from dropdown.
- **Expected**
  - Prompt is sent as a user message; assistant responds with lead info.
- **Observed**
  - User bubble "Show recent leads" appears.
  - Assistant shows loading text then a final response; tool badge `get_recent_contacts ✓` appears under the message.
- **Status**: ✅ Pass

### 6. Pill Prompts – Research Agent
- **Steps**
  - Click **Research** pill.
  - Choose **Research a competitor**.
- **Expected**
  - Research workflow runs and returns a markdown research report.
- **Observed**
  - Assistant message renders with headings (H1/H2), lists, and a **Sources** section with clickable links.
  - Agent badge shows `research ✓`.
- **Status**: ✅ Pass

### 7. Pill Prompts – Writer Agent
- **Steps**
  - Click **Writer** pill.
  - Choose **Draft a follow-up email from research**.
- **Expected**
  - Writer workflow runs and returns an email-style response.
- **Observed**
  - User bubble appears; assistant streams a response while input is disabled, then re-enables on completion.
- **Status**: ✅ Pass

### 8. Markdown Rendering
- **Steps**
  - Inspect the DOM for the research report message.
- **Expected**
  - Markdown structure is preserved (headings, lists, links).
- **Observed**
  - Playwright snapshot shows semantic elements (`h1`, `h2`, `ul/li`, `a href=...`), confirming `MarkdownMessage` is used.
- **Status**: ✅ Pass

### 9. Modal Interaction Guard
- **Steps**
  - Open **Conversations** modal.
  - Attempt to click **Toggle theme** behind the modal.
- **Expected**
  - Overlay should block interaction with background controls.
- **Observed**
  - Playwright click times out with overlay intercepting pointer events, as expected for a modal.
- **Status**: ✅ Pass (behavior intentional)

## Summary

- All primary UI components exercised:
  - Header: **Conversations**, **Toggle theme**.
  - Empty state: **CapabilitiesCard** (with Research & Writer) and **Skip intro**.
  - Quick actions: **PillPrompts** (Sales, Marketing, Operations, Estimating, Research, Writer).
  - Session selector modal: open/close, conversation list, new/continue actions.
  - Chat: message bubbles, streaming behavior, tool & agent badges, markdown rendering.
- No broken interactions were observed during this Playwright smoke run.
- Known expected behavior: background controls are intentionally blocked while the session selector modal is open.
