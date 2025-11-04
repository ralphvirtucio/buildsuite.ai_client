# Chat Client Test Scenarios

## Test Environment Setup

### Prerequisites
1. **Backend (kairo_brain) running:**
   ```bash
   cd kairo_brain
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend (client) running:**
   ```bash
   cd client
   pnpm dev
   ```

3. **Backend Configuration (.env):**
   ```bash
   USE_KAIRO_V2=true
   USE_CHAT_MULTIAGENT=true  # Enable multi-agent for these tests
   CHAT_MAX_STEPS=5
   OPENAI_API_KEY=sk-...
   LANGSMITH_TRACING=true
   LANGSMITH_API_KEY=...
   ```

---

## Test Scenario 1: Basic Init Mode (Kairo Greets First)

### Expected Behavior
- User opens chat interface
- Loading state appears: "Connecting to Kairo..."
- Kairo sends initial greeting message

### Steps
1. Open browser to `http://localhost:3000`
2. Wait for page load
3. Observe initial state

### Expected Result
```
[Assistant Message]
Hello! I'm Kairo, an AI assistant for Alliance Contractors.
How can I help you today?
```

### What to Check
- ✅ No static greeting appears
- ✅ "Connecting to Kairo..." shows briefly
- ✅ Kairo's greeting appears within 2-3 seconds
- ✅ Message appears in left-aligned bubble with border
- ✅ No errors in browser console

---

## Test Scenario 2: Simple Question (Single Agent)

### Input
```
What can you help me with?
```

### Expected Behavior
- User message appears on right (blue background)
- "Thinking..." indicator shows
- Assistant streams response in chunks
- No tool/agent metadata (simple response)

### Expected Result
```
[Assistant Message]
I can help you with various tasks related to Alliance Contractors:

1. Sales & Lead Management - Track contacts, analyze leads, manage CRM
2. Marketing - Campaign management, content creation
3. Estimating - Project quotes and cost analysis
4. Operations - Workflow management, scheduling

What would you like assistance with?
```

### What to Check
- ✅ Streaming works (text appears gradually)
- ✅ No metadata section appears
- ✅ Session continuity maintained
- ✅ Response completes with "final" event

---

## Test Scenario 3: Multi-Turn Conversation (Context Retention)

### Turn 1
**Input:** `My name is Sarah and I work in sales`

**Expected Result:**
```
[Assistant Message]
Nice to meet you, Sarah! As a sales professional, I can help you with
lead management, CRM tasks, contact tracking, and sales analytics.
What would you like to work on?
```

### Turn 2 (Same Session)
**Input:** `What's my name?`

**Expected Result:**
```
[Assistant Message]
Your name is Sarah, and you mentioned you work in sales.
```

### What to Check
- ✅ Kairo remembers information from Turn 1
- ✅ Same session_id used for both turns (check localStorage)
- ✅ conversation_history sent with each request
- ✅ Context maintained across page reload (if session_id persists)

---

## Test Scenario 4: Tool Usage (CRM Query)

### Input
```
Show me the 3 most recent contacts
```

### Expected Behavior
- Kairo invokes `get_recent_contacts` tool
- Tool execution appears in metadata
- Structured response with contact data

### Expected Result
```
[Assistant Message]
Here are the 3 most recent contacts:

1. John Smith - john@example.com - Added: Nov 3, 2024
2. Jane Doe - jane@example.com - Added: Nov 2, 2024
3. Bob Johnson - bob@example.com - Added: Nov 1, 2024

🔧 get_recent_contacts: completed
```

### What to Check
- ✅ Tool metadata appears below message
- ✅ 🔧 emoji displayed
- ✅ Tool name and status shown
- ✅ SSE "tool" events received (check console logs)
- ✅ Actual contact data displayed (if GHL configured)

### If Backend Not Configured
```
[Assistant Message]
I don't have access to the CRM tools right now. Please check that
the GHL API is configured.

🔧 get_recent_contacts: failed
```

---

## Test Scenario 5: Multi-Agent Workflow (Sales + Operations)

### Input
```
Get today's leads, analyze their quality, and create a follow-up plan
```

### Expected Behavior
- Kairo uses multiple agents to complete the task
- Tool calls for fetching leads
- Sales agent analyzes lead quality
- Operations agent creates follow-up plan
- All metadata displayed

### Expected Result
```
[Assistant Message]
I've analyzed today's leads and created a follow-up plan:

**Today's Leads Summary:**
- Total: 5 leads
- High priority: 2
- Medium priority: 2
- Low priority: 1

**Quality Analysis:**
High-priority leads show strong engagement signals...

**Follow-Up Plan:**
1. Contact high-priority leads within 2 hours
2. Schedule calls with medium-priority for tomorrow
3. Send automated nurture email to low-priority

🔧 get_recent_contacts: completed
🤖 sales: completed
🤖 operations: completed
```

### What to Check
- ✅ Multiple tool executions shown
- ✅ Multiple agent executions shown
- ✅ Agents appear with 🤖 emoji
- ✅ All metadata shown in order
- ✅ Response synthesizes all agent outputs
- ✅ Check LangSmith traces for full execution path

---

## Test Scenario 6: Streaming with Tool Calls

### Input
```
Summarize the recent contacts and tell me who to prioritize
```

### Expected Behavior
- "Thinking..." appears immediately
- Tool execution logged (check console)
- Text streams in as it's generated
- Tool metadata appears after streaming completes

### What to Check
- ✅ SSE events arrive in order: `start` → `tool` → `delta` × N → `final`
- ✅ Console logs show: "Tool get_recent_contacts: completed"
- ✅ Text appears character by character
- ✅ Metadata appears at bottom after completion
- ✅ No duplicate messages

---

## Test Scenario 7: Error Handling (Backend Down)

### Setup
1. Stop the kairo_brain backend server
2. Attempt to send a message

### Input
```
Hello
```

### Expected Behavior
- Request fails gracefully
- Error message displayed
- No crash, no infinite loading

### Expected Result
```
[System Message - Gray]
Error: HTTP 500 (or connection error)
```

### What to Check
- ✅ Error message appears in chat
- ✅ "Thinking..." disappears
- ✅ Input field re-enabled
- ✅ User can retry after backend restarts
- ✅ Console shows warning, not uncaught error

---

## Test Scenario 8: Long Conversation (Session Persistence)

### Multi-Turn Test
1. **Turn 1:** `I need help with a roofing project`
2. **Turn 2:** `The client's name is ABC Construction`
3. **Turn 3:** `The budget is $50,000`
4. **Turn 4:** `What have I told you so far?`

### Expected Result (Turn 4)
```
[Assistant Message]
Based on our conversation:
- You need help with a roofing project
- Client: ABC Construction
- Budget: $50,000
```

### What to Check
- ✅ All context retained
- ✅ conversation_history grows with each turn
- ✅ Session not dropped between messages
- ✅ Reload page → session persists (localStorage)

---

## Test Scenario 9: Init Mode Edge Case (Empty Greeting)

### Test Variation
Manually clear localStorage and refresh

### Steps
1. Open DevTools → Application → LocalStorage
2. Delete `chat_session_id`
3. Refresh page

### Expected Result
- New session created
- Init request sent with new session_id
- Kairo greeting appears
- New session_id stored in localStorage

### What to Check
- ✅ New UUID generated
- ✅ Init mode triggered
- ✅ No duplicate greetings
- ✅ Session works normally after init

---

## Test Scenario 10: Rapid Fire Messages

### Input (Send quickly, one after another)
1. `Hello`
2. `Who are you?`
3. `What can you do?`

### Expected Behavior
- Messages queue properly
- No race conditions
- Responses appear in correct order
- Each message waits for previous to complete

### What to Check
- ✅ Messages don't overlap
- ✅ Streaming doesn't interfere with next message
- ✅ All messages get responses
- ✅ Conversation order maintained

---

## Test Scenario 11: Special Characters & Formatting

### Input
```
Can you format this:
- Bullet 1
- Bullet 2

**Bold text**
*Italic text*

Code: `console.log("test")`
```

### Expected Result
```
[Assistant Message]
I can help you format that. Here's the formatted version:

- Bullet 1
- Bullet 2

**Bold text**
*Italic text*

Code: `console.log("test")`
```

### What to Check
- ✅ Whitespace preserved
- ✅ Line breaks rendered correctly
- ✅ Special characters don't break parsing
- ✅ Markdown-like formatting handled

---

## Test Scenario 12: Mobile Responsiveness

### Steps
1. Open DevTools → Toggle device toolbar
2. Test on iPhone SE (375px width)
3. Send messages

### What to Check
- ✅ Messages width adapts (max-w-[85%])
- ✅ Input remains usable
- ✅ No horizontal scroll
- ✅ Metadata readable on small screens
- ✅ Send button accessible

---

## Performance Benchmarks

### Expected Metrics
| Metric | Target | Acceptable |
|--------|--------|------------|
| Init greeting time | < 2s | < 5s |
| Simple response (no tools) | < 3s | < 8s |
| Tool call response | < 5s | < 12s |
| Multi-agent response | < 10s | < 20s |
| Streaming first chunk | < 1s | < 3s |

---

## Automated Test Script

Create `client/cypress/e2e/chat.cy.ts`:

```typescript
describe('Chat Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should display Kairo greeting on load', () => {
    cy.contains('Connecting to Kairo...').should('be.visible');
    cy.contains(/Hello|Hi|Greetings/, { timeout: 10000 }).should('be.visible');
  });

  it('should send a message and receive response', () => {
    // Wait for init
    cy.contains(/Hello|Hi|Greetings/, { timeout: 10000 });

    // Send message
    cy.get('input[aria-label="Message"]').type('What can you help with?{enter}');

    // Check message appears
    cy.contains('What can you help with?').should('be.visible');

    // Check response
    cy.contains(/help|assist|can/, { timeout: 15000 }).should('be.visible');
  });

  it('should maintain conversation context', () => {
    cy.contains(/Hello|Hi|Greetings/, { timeout: 10000 });

    // Turn 1
    cy.get('input[aria-label="Message"]').type('My name is Alice{enter}');
    cy.wait(3000);

    // Turn 2
    cy.get('input[aria-label="Message"]').type('What is my name?{enter}');

    // Should remember
    cy.contains('Alice', { timeout: 15000 }).should('be.visible');
  });

  it('should display tool metadata', () => {
    cy.contains(/Hello|Hi|Greetings/, { timeout: 10000 });

    cy.get('input[aria-label="Message"]').type('Show recent contacts{enter}');

    // Check for tool metadata
    cy.contains('🔧', { timeout: 20000 }).should('be.visible');
  });
});
```

---

## Manual Testing Checklist

### Visual Tests
- [ ] Messages aligned correctly (user right, assistant left)
- [ ] Loading states visible
- [ ] Metadata formatted properly
- [ ] Dark mode works (toggle theme)
- [ ] Scroll behavior smooth
- [ ] Auto-scroll to bottom on new messages

### Functional Tests
- [ ] Init mode greeting works
- [ ] Streaming displays text gradually
- [ ] Tool metadata appears
- [ ] Agent metadata appears
- [ ] Multi-turn context retained
- [ ] Error handling graceful
- [ ] Session persists across reload

### Edge Cases
- [ ] Empty message (shouldn't send)
- [ ] Very long message (truncation?)
- [ ] Backend timeout handling
- [ ] Network interruption recovery
- [ ] Multiple tabs (same session?)

### Performance
- [ ] No memory leaks (long conversations)
- [ ] Smooth on mobile
- [ ] Console clear of errors
- [ ] No duplicate requests

---

## Debugging Tips

### Check SSE Events
```javascript
// In browser console
localStorage.setItem('debug', 'true');
// Then send a message - more detailed logs will appear
```

### Inspect Session
```javascript
// In browser console
console.log('Session ID:', localStorage.getItem('chat_session_id'));
console.log('Auth Token:', localStorage.getItem('token'));
```

### Monitor Network
1. DevTools → Network tab
2. Filter: `chat`
3. Send message
4. Check request payload and SSE stream

### Backend Traces
- Visit LangSmith: https://smith.langchain.com
- Find your project
- View traces for each chat request
- Check which agents/tools were called

---

## Known Issues / Expected Failures

### Without GHL Configuration
- Tool calls will fail gracefully
- Error metadata shown: `🔧 get_recent_contacts: failed`

### Without Multi-Agent Enabled
- Only assistant agent used
- No 🤖 metadata (no agent delegation)

### Slow OpenAI API
- Streaming may be delayed
- Increase timeout if needed

---

## Success Criteria

A successful test run should show:
1. ✅ Init greeting appears < 5 seconds
2. ✅ All SSE event types handled (start, tool, agent, delta, final, error)
3. ✅ Context maintained across 3+ turns
4. ✅ Tool/agent metadata displays correctly
5. ✅ Errors handled without crashes
6. ✅ No console errors (warnings OK)
7. ✅ Mobile responsive
8. ✅ Theme toggle works

---

## Reporting Issues

If tests fail, collect:
1. Browser console logs (errors/warnings)
2. Network tab screenshot (request/response)
3. Backend logs from uvicorn
4. LangSmith trace URL
5. Steps to reproduce
6. Expected vs actual behavior
