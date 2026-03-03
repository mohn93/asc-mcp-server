# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server that exposes Apple's App Store Connect API as tools. Built with TypeScript, runs over stdio transport.

## Commands

- **Build:** `npm run build` (compiles TypeScript to `build/`)
- **Dev:** `npm run dev` (watch mode)
- **Run:** `npm start` (runs `build/index.js`)

No test framework is configured yet.

## Required Environment Variables

- `ASC_KEY_ID` — App Store Connect API Key ID
- `ASC_ISSUER_ID` — App Store Connect Issuer ID
- `ASC_PRIVATE_KEY_PATH` — Path to `.p8` private key file

## Architecture

### Entry Point & Wiring

`src/index.ts` creates an `McpServer` (from `@modelcontextprotocol/sdk`), registers all tool modules, and connects via `StdioServerTransport`. Each tool domain is a separate module that exports a `registerXxxTools(server: McpServer)` function.

### Layers

```
src/index.ts          — Server bootstrap, tool registration
src/auth/jwt.ts       — ES256 JWT generation with 20-min expiry and caching
src/client/api-client.ts — HTTP client (GET/POST/PATCH/DELETE + pagination)
src/types/asc-api.ts  — TypeScript interfaces for all ASC resources
src/tools/*.ts        — Tool modules (one per API domain)
```

### API Client (`src/client/api-client.ts`)

Provides `ascGet`, `ascPost`, `ascPatch`, `ascDelete`, and `ascGetAll` (auto-pagination). All requests go through `https://api.appstoreconnect.apple.com/v1` with automatic JWT auth. Custom `APIError` class carries status, code, and detail.

### Tool Module Pattern

Every file in `src/tools/` follows the same structure:

1. Export `registerXxxTools(server: McpServer)`
2. Define Zod schemas for input validation
3. Call `server.tool(name, description, zodSchema, handler)` for each tool
4. Handler calls the API client, formats the response, returns `{ content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }`

Tool names use `snake_case`. Errors return `{ content: [...], isError: true }`.

### Adding a New Tool Module

1. Create `src/tools/<domain>.ts` with a `register<Domain>Tools(server: McpServer)` function
2. Import and call it in `src/index.ts`

### Type System

All ASC resources extend `ASCResource { type, id, links? }` in `src/types/asc-api.ts`. API responses use `PaginatedResponse<T>` and `SingleResponse<T>` generics from the client.

## Tool Tiers

**Tier 1 (core):** apps, builds, versions, testflight, users, devices, bundle-ids
**Tier 2 (advanced):** reviews, certificates, subscriptions, analytics
