#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAppsTools } from "./tools/apps.js";
import { registerBuildsTools } from "./tools/builds.js";
import { registerVersionsTools } from "./tools/versions.js";
import { registerTestFlightTools } from "./tools/testflight.js";
import { registerUsersTools } from "./tools/users.js";
import { registerDevicesTools } from "./tools/devices.js";
import { registerBundleIdsTools } from "./tools/bundle-ids.js";

const server = new McpServer({
  name: "appstore-connect",
  version: "1.0.0",
});

// Register all tool modules
registerAppsTools(server);
registerBuildsTools(server);
registerVersionsTools(server);
registerTestFlightTools(server);
registerUsersTools(server);
registerDevicesTools(server);
registerBundleIdsTools(server);

// Connect via stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("App Store Connect MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
