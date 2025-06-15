const { spawn } = require('child_process');

const serverCmd = 'npx';
const serverArgs = [
  '-y',
  'tsx',
  './src/index.ts',
  '--config',
  './.cursor/db-config.json'
];

// Start the MCP server as a child process
const server = spawn(serverCmd, serverArgs, { stdio: ['pipe', 'pipe', 'inherit'] });
server.stdout.setEncoding('utf8');

// State for dynamic requests
let dbIds = [];
let currentRequestIndex = 0;
const pending = new Map();
const TIMEOUT_MS = 4000;

// Initial requests: list tools, then list databases
const requests = [
  {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  },
  {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "list_databases",
      arguments: {}
    }
  }
];

let testInsightDbId = null;
let testInsightText = `Test insight at ${new Date().toISOString()}`;

function sendNextRequest() {
  if (currentRequestIndex >= requests.length) {
    // If we have dbIds, queue up list_tables requests for each
    if (dbIds.length > 0) {
      // Start at 3 to avoid id collision
      let id = 3;
      dbIds.forEach((dbId) => {
        requests.push({
          jsonrpc: "2.0",
          id: id++,
          method: "tools/call",
          params: {
            name: "list_tables",
            arguments: { dbId }
          }
        });
      });
      // For insights test, pick the first dbId
      testInsightDbId = dbIds[0];
      // Add append_insight request
      requests.push({
        jsonrpc: "2.0",
        id: id++,
        method: "tools/call",
        params: {
          name: "append_insight",
          arguments: { dbId: testInsightDbId, insight: testInsightText }
        }
      });
      // Add list_insights request
      requests.push({
        jsonrpc: "2.0",
        id: id++,
        method: "tools/call",
        params: {
          name: "list_insights",
          arguments: { dbId: testInsightDbId }
        }
      });
      dbIds = []; // Prevent re-adding
      sendNextRequest();
      return;
    }
    // All requests sent, exit after a short delay
    setTimeout(() => {
      server.kill();
      process.exit(0);
    }, 1000);
    return;
  }
  const req = requests[currentRequestIndex];
  pending.set(req.id, setTimeout(() => {
    console.error(`Timeout waiting for response to request id ${req.id}`);
    sendNextRequest();
  }, TIMEOUT_MS));
  server.stdin.write(JSON.stringify(req) + '\n');
}

// Listen for responses
server.stdout.on('data', (data) => {
  data.split('\n').filter(Boolean).forEach(line => {
    let response;
    try {
      response = JSON.parse(line);
    } catch (e) {
      console.log('Non-JSON output:', line);
      return;
    }
    if (response.id && pending.has(response.id)) {
      clearTimeout(pending.get(response.id));
      pending.delete(response.id);
      // Improved output formatting
      if (response.result && Array.isArray(response.result.content)) {
        response.result.content.forEach((item) => {
          if (item.type === 'text' && typeof item.text === 'string') {
            // Try to parse as JSON
            try {
              const parsed = JSON.parse(item.text);
              // If this is the list_databases response, extract dbIds
              if (response.id === 2 && parsed.databases) {
                dbIds = parsed.databases.map(db => db.id);
              }
              console.log('Received (pretty):', JSON.stringify(parsed, null, 2));
            } catch (e) {
              // Not JSON, print as-is
              console.log('Received (text):', item.text);
            }
          } else {
            console.log('Received (content):', JSON.stringify(item, null, 2));
          }
        });
      } else {
        console.log('Received:', JSON.stringify(response, null, 2));
      }
      currentRequestIndex++;
      sendNextRequest();
    } else {
      // Notification or unexpected response
      console.log('Received (no matching id):', JSON.stringify(response, null, 2));
    }
  });
});

server.on('error', (err) => {
  console.error('Server process error:', err);
  process.exit(1);
});

server.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`Server exited with code ${code} (signal: ${signal})`);
    process.exit(code);
  }
});

// Start the sequence
sendNextRequest(); 