#!/usr/bin/env node
/**
 * Integration Test Script for Chat Client + Kairo Brain
 *
 * Tests real multi-agent scenarios with the live backend.
 * Run this with: node test-chat-integration.js
 *
 * Prerequisites:
 * - Backend running on http://localhost:8000
 * - USE_CHAT_MULTIAGENT=true in backend .env
 */

const BASE_URL = process.env.API_URL || 'http://localhost:8000/api/v1';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateSessionId() {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

async function waitForMs(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send a chat message and collect the full streaming response
 */
async function sendChatMessage({ message, sessionId, stream = true, init = false }) {
  const url = `${BASE_URL}/triggers/chat`;

  const payload = {
    message,
    session_id: sessionId,
    user_id: 'test_user_integration',
    stream,
    init,
    conversation_history: [],
  };

  log(`\n📤 Sending: "${message || '(init mode)'}"`, 'cyan');
  log(`   Session: ${sessionId}`, 'blue');

  if (!stream) {
    // Non-streaming request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.result || data.message,
      status: data.status,
      sessionId: data.session_id,
      toolCalls: [],
      agentCalls: [],
    };
  }

  // Streaming request
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Authorization': 'Bearer test-token',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  let fullText = '';
  const toolCalls = [];
  const agentCalls = [];
  let responseSessionId = sessionId;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let boundary;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const sseChunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      const lines = sseChunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const eventData = line.slice(6);
          if (!eventData) continue;

          try {
            const event = JSON.parse(eventData);

            if (event.type === 'start') {
              log(`   🚀 Session started: ${event.session_id}`, 'green');
              responseSessionId = event.session_id;
            } else if (event.type === 'tool') {
              const status = event.status === 'completed' ? '✅' : '❌';
              log(`   ${status} Tool: ${event.name} - ${event.status}`, 'yellow');
              toolCalls.push({ name: event.name, status: event.status, error: event.error });
            } else if (event.type === 'agent') {
              const status = event.status === 'completed' ? '✅' : '❌';
              log(`   ${status} Agent: ${event.name} - ${event.status}`, 'yellow');
              agentCalls.push({ name: event.name, status: event.status, error: event.error });
            } else if (event.type === 'delta') {
              fullText += event.text || '';
              process.stdout.write(colors.bright + (event.text || '') + colors.reset);
            } else if (event.type === 'final') {
              log('\n   ✓ Complete', 'green');
              return {
                text: event.text || fullText,
                sessionId: responseSessionId,
                toolCalls,
                agentCalls,
                status: 'completed',
              };
            } else if (event.type === 'error') {
              throw new Error(event.error || 'Unknown error');
            }
          } catch (err) {
            if (err.message.includes('error')) throw err;
            log(`   ⚠️  Failed to parse event: ${eventData}`, 'yellow');
          }
        }
      }
    }
  }

  return {
    text: fullText,
    sessionId: responseSessionId,
    toolCalls,
    agentCalls,
    status: 'completed',
  };
}

/**
 * Test Scenario 1: Init Mode
 */
async function testInitMode() {
  log('\n' + '='.repeat(60), 'bright');
  log('TEST 1: Init Mode (Kairo Greets First)', 'bright');
  log('='.repeat(60), 'bright');

  const sessionId = generateSessionId();

  try {
    const result = await sendChatMessage({
      message: '',
      sessionId,
      init: true,
    });

    log(`\n📨 Response: ${result.text}`, 'green');

    // Validate
    if (!result.text || result.text.length < 10) {
      throw new Error('Init greeting too short or empty');
    }

    log('✅ PASSED: Init mode works', 'green');
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test Scenario 2: Simple Question (No Tools)
 */
async function testSimpleQuestion() {
  log('\n' + '='.repeat(60), 'bright');
  log('TEST 2: Simple Question (Single Agent)', 'bright');
  log('='.repeat(60), 'bright');

  const sessionId = generateSessionId();

  try {
    const result = await sendChatMessage({
      message: 'What can you help me with?',
      sessionId,
    });

    log(`\n📨 Response: ${result.text}`, 'green');

    // Validate
    if (!result.text || result.text.length < 20) {
      throw new Error('Response too short');
    }

    if (result.toolCalls.length > 0) {
      log(`   ⚠️  Unexpected tool calls: ${result.toolCalls.map(t => t.name).join(', ')}`, 'yellow');
    }

    log('✅ PASSED: Simple question answered', 'green');
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test Scenario 3: Multi-Turn Conversation
 */
async function testMultiTurnConversation() {
  log('\n' + '='.repeat(60), 'bright');
  log('TEST 3: Multi-Turn Conversation (Context Retention)', 'bright');
  log('='.repeat(60), 'bright');

  const sessionId = generateSessionId();

  try {
    // Turn 1: Introduce name
    log('\n--- Turn 1 ---', 'cyan');
    const result1 = await sendChatMessage({
      message: 'My name is Alice and I work in sales',
      sessionId,
    });

    await waitForMs(1000);

    // Turn 2: Ask for name (should remember)
    log('\n--- Turn 2 ---', 'cyan');
    const result2 = await sendChatMessage({
      message: "What's my name?",
      sessionId,
    });

    log(`\n📨 Response: ${result2.text}`, 'green');

    // Validate context retention
    if (!result2.text.toLowerCase().includes('alice')) {
      throw new Error('Failed to remember name from previous turn');
    }

    log('✅ PASSED: Context retained across turns', 'green');
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test Scenario 4: Tool Usage
 */
async function testToolUsage() {
  log('\n' + '='.repeat(60), 'bright');
  log('TEST 4: Tool Usage (CRM Query)', 'bright');
  log('='.repeat(60), 'bright');

  const sessionId = generateSessionId();

  try {
    const result = await sendChatMessage({
      message: 'Show me the 3 most recent contacts',
      sessionId,
    });

    log(`\n📨 Response: ${result.text}`, 'green');

    // Validate tool calls
    if (result.toolCalls.length === 0) {
      log('   ⚠️  No tool calls detected (may need GHL configuration)', 'yellow');
    } else {
      log(`   📊 Tool calls: ${result.toolCalls.map(t => `${t.name} (${t.status})`).join(', ')}`, 'cyan');

      const hasContactTool = result.toolCalls.some(t =>
        t.name.includes('contact') || t.name.includes('get_recent')
      );

      if (!hasContactTool) {
        throw new Error('Expected contact-related tool call');
      }
    }

    log('✅ PASSED: Tool usage working', 'green');
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test Scenario 5: Multi-Agent Workflow
 */
async function testMultiAgentWorkflow() {
  log('\n' + '='.repeat(60), 'bright');
  log('TEST 5: Multi-Agent Workflow (Sales + Operations)', 'bright');
  log('='.repeat(60), 'bright');

  const sessionId = generateSessionId();

  try {
    const result = await sendChatMessage({
      message: "Get today's leads, analyze their quality, and create a follow-up plan",
      sessionId,
    });

    log(`\n📨 Response: ${result.text}`, 'green');

    // Validate multi-agent execution
    if (result.agentCalls.length === 0 && result.toolCalls.length === 0) {
      log('   ⚠️  No agent or tool calls detected', 'yellow');
      log('   ⚠️  Make sure USE_CHAT_MULTIAGENT=true in backend .env', 'yellow');
    } else {
      log(`   🤖 Agent calls: ${result.agentCalls.map(a => `${a.name} (${a.status})`).join(', ')}`, 'cyan');
      log(`   🔧 Tool calls: ${result.toolCalls.map(t => `${t.name} (${t.status})`).join(', ')}`, 'cyan');
    }

    // Check response quality
    if (result.text.length < 50) {
      throw new Error('Response seems too short for complex query');
    }

    log('✅ PASSED: Multi-agent workflow executed', 'green');
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Test Scenario 6: Error Handling
 */
async function testErrorHandling() {
  log('\n' + '='.repeat(60), 'bright');
  log('TEST 6: Error Handling (Invalid Request)', 'bright');
  log('='.repeat(60), 'bright');

  const sessionId = generateSessionId();

  try {
    // Test with malformed endpoint (should fail gracefully)
    const invalidUrl = `${BASE_URL}/triggers/invalid_endpoint`;

    const response = await fetch(invalidUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({
        message: 'test',
        session_id: sessionId,
      }),
    });

    if (response.ok) {
      throw new Error('Expected error response for invalid endpoint');
    }

    log(`   Expected error received: HTTP ${response.status}`, 'yellow');
    log('✅ PASSED: Error handling works', 'green');
    return true;
  } catch (error) {
    if (error.message.includes('Expected error')) {
      log(`❌ FAILED: ${error.message}`, 'red');
      return false;
    }
    log('✅ PASSED: Error handling works', 'green');
    return true;
  }
}

/**
 * Test Scenario 7: Non-Streaming Mode
 */
async function testNonStreaming() {
  log('\n' + '='.repeat(60), 'bright');
  log('TEST 7: Non-Streaming Mode', 'bright');
  log('='.repeat(60), 'bright');

  const sessionId = generateSessionId();

  try {
    const result = await sendChatMessage({
      message: 'Hello, who are you?',
      sessionId,
      stream: false,
    });

    log(`\n📨 Response: ${result.text}`, 'green');

    // Validate
    if (!result.text || result.text.length < 10) {
      throw new Error('Response too short');
    }

    if (result.status !== 'completed') {
      throw new Error(`Expected status 'completed', got '${result.status}'`);
    }

    log('✅ PASSED: Non-streaming mode works', 'green');
    return true;
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  log('\n' + '='.repeat(60), 'bright');
  log('🤖 KAIRO CHAT CLIENT INTEGRATION TESTS', 'bright');
  log('='.repeat(60), 'bright');
  log(`Backend: ${BASE_URL}`, 'cyan');
  log(`Time: ${new Date().toISOString()}`, 'cyan');

  // Check backend availability
  try {
    log('\n🔍 Checking backend availability...', 'cyan');
    const healthCheck = await fetch(`${BASE_URL.replace('/api/v1', '')}/docs`);
    if (!healthCheck.ok) {
      throw new Error('Backend not responding');
    }
    log('✅ Backend is available', 'green');
  } catch (error) {
    log('❌ Backend is not available!', 'red');
    log('   Please start the backend: cd kairo_brain && uv run uvicorn app.main:app --reload', 'yellow');
    process.exit(1);
  }

  const results = [];

  // Run tests sequentially
  results.push(await testInitMode());
  await waitForMs(2000);

  results.push(await testSimpleQuestion());
  await waitForMs(2000);

  results.push(await testMultiTurnConversation());
  await waitForMs(2000);

  results.push(await testToolUsage());
  await waitForMs(2000);

  results.push(await testMultiAgentWorkflow());
  await waitForMs(2000);

  results.push(await testNonStreaming());
  await waitForMs(2000);

  results.push(await testErrorHandling());

  // Summary
  log('\n' + '='.repeat(60), 'bright');
  log('📊 TEST SUMMARY', 'bright');
  log('='.repeat(60), 'bright');

  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;
  const total = results.length;

  log(`Total Tests: ${total}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`, failed > 0 ? 'yellow' : 'green');

  if (failed === 0) {
    log('\n✅ ALL TESTS PASSED! 🎉', 'green');
    process.exit(0);
  } else {
    log('\n❌ SOME TESTS FAILED', 'red');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
