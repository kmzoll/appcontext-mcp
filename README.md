# appcontext-mcp

Connect AI coding agents to [AppContext](https://appcontext.dev) from stdio-only MCP clients.

AppContext is a macOS desktop app that gives AI coding agents like Claude Code and Cursor live
visual context — iOS Simulator and browser screenshots, console and Metro logs — over MCP, and
works as a personal MCP hub with per-tool authorization policies.

## Requirements

- macOS with the [AppContext app](https://appcontext.dev) installed and running
  (its MCP server listens on `http://localhost:7777/sse`)
- Node.js 18+

## Usage

Most MCP clients can connect to AppContext's SSE endpoint directly — prefer that when supported:

```json
{ "mcpServers": { "appcontext": { "url": "http://localhost:7777/sse" } } }
```

For stdio-only clients, use this bridge:

```json
{ "mcpServers": { "appcontext": { "command": "npx", "args": ["-y", "appcontext-mcp"] } } }
```

## Tools

`fetch_device_status`, `fetch_liveview`, `fetch_recent_logs`, `fetch_web_console`,
`switch_platform`, `get_browser_tabs`, `hub_status`, `hub_call`, `hub_policies` — plus any tools
from MCP servers you aggregate through the AppContext hub (namespaced `server:tool`).

MCP Hub features are free; Live View (screenshots/logs) requires AppContext Pro.
Docs: https://appcontext.dev/docs/
