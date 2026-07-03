#!/usr/bin/env node
// appcontext-mcp: stdio bridge to the AppContext desktop app's local MCP endpoint.
//
// AppContext (https://appcontext.dev) is a macOS menu-bar app that gives AI coding
// agents live visual context (iOS Simulator + browser screenshots, Metro/console
// logs) and acts as a personal MCP hub. Its MCP server listens on
// http://localhost:7777/sse — this package lets stdio-only MCP clients connect:
//
//   { "mcpServers": { "appcontext": { "command": "npx", "args": ["-y", "appcontext-mcp"] } } }
//
// Clients that support SSE URLs directly can skip this bridge and use
// { "url": "http://localhost:7777/sse" } instead.

import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const ENDPOINT = process.env.APPCONTEXT_MCP_URL || "http://localhost:7777/sse";

function notRunning(detail) {
  console.error(
    [
      "",
      `  Could not connect to AppContext at ${ENDPOINT}`,
      detail ? `  (${detail})` : "",
      "",
      "  1. Download AppContext for macOS: https://appcontext.dev",
      "  2. Launch it (menu-bar icon appears; the MCP server starts automatically)",
      "  3. Retry this connection",
      "",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  process.exit(1);
}

const upstream = new SSEClientTransport(new URL(ENDPOINT));
const stdio = new StdioServerTransport();

// Raw bidirectional passthrough — the desktop app's server does all the thinking.
upstream.onmessage = (msg) => stdio.send(msg);
stdio.onmessage = (msg) => upstream.send(msg);
upstream.onclose = () => process.exit(0);
stdio.onclose = () => process.exit(0);
upstream.onerror = (err) => {
  // Errors after connect are transient (app restarting, etc.) — log, don't die.
  console.error(`appcontext-mcp upstream error: ${err?.message ?? err}`);
};
stdio.onerror = (err) => console.error(`appcontext-mcp stdio error: ${err?.message ?? err}`);

try {
  await upstream.start(); // SSE connect + endpoint handshake
} catch (err) {
  notRunning(err?.message ?? String(err));
}
await stdio.start();
