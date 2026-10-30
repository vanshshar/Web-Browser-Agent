# Browser Automation Agent

A modern, production-grade AI-powered web automation application. The **Browser Automation Agent** receives natural-language browser instructions, plans execution steps using the Groq API (e.g., `llama-3.3-70b-versatile`), and operates a real browser using Playwright with strict isolation and SSRF security safeguards.

Built entirely with **TypeScript**, **Node.js**, **Express**, **Next.js**, and **Tailwind CSS**.

---

## 1. Features & Capabilities

- **Natural Language Task Execution**: Direct plain English goals (e.g. searching, navigating, extracting text, completing forms) translated directly into validated browser actions.
- **Server-Side Groq LLM Integration**: Secure execution loop keeping API keys server-side with structured tool calling and bounded iterations.
- **Robust Browser Automation**: Playwright-driven Chromium execution with full lifecycle management, page state observation, and automatic cleanup.
- **Security & SSRF Protection**: Comprehensive URL validation preventing loopback, private RFC1918 subnets, and cloud metadata endpoint access. Untrusted webpage prompt injection defense.
- **Asynchronous Task Lifecycle**: Immediate task acceptance (HTTP 202) with unique UUID tracking and status polling (`queued` → `running` → `completed` / `failed` / `timed_out` / `cancelled`).
- **Clean Responsive UI**: Modern Next.js frontend with Tailwind CSS, execution state indicator, action history audit trail, and result summary.

---

## 2. Technology Stack

- **Language**: TypeScript (strict mode, Node16 module resolution)
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend API**: Node.js, Express, Zod validation
- **AI / LLM Provider**: Groq SDK (`groq-sdk`)
- **Browser Automation**: Playwright
- **Testing**: Vitest
- **Package Manager**: npm workspaces

---

## 3. Project Structure

```text
browser-automation-agent/
├── apps/
│   ├── api/                 # Express backend API server
│   │   ├── src/
│   │   │   ├── config/      # Environment validation
│   │   │   ├── middleware/  # Error handler & request validators
│   │   │   ├── routes/      # /api/health, /api/tasks endpoints
│   │   │   ├── services/    # TaskService lifecycle coordinator
│   │   │   ├── app.ts       # Express app setup
│   │   │   └── server.ts    # Server startup & graceful shutdown
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                 # Next.js frontend application
│       ├── src/
│       │   ├── app/         # Next.js App Router (layout, page, styles)
│       │   ├── components/  # TaskForm, TaskResult, StatusBadge, ErrorDisplay
│       │   ├── hooks/       # useTask custom hook (submission & polling)
│       │   ├── lib/         # API client
│       │   └── types/       # UI type definitions
│       ├── package.json
│       ├── tailwind.config.ts
│       └── tsconfig.json
├── packages/
│   ├── shared/              # Shared schemas, constants, errors, and types
│   │   ├── src/
│   │   │   ├── constants/   # Default configs & error codes
│   │   │   ├── schemas/     # Zod runtime validators
│   │   │   ├── types/       # Shared TypeScript contracts
│   │   │   └── index.ts
│   │   └── package.json
│   ├── browser/             # Playwright browser manager & tool adapter
│   │   ├── src/
│   │   │   ├── browser-manager.ts # Chromium instance & session coordinator
│   │   │   ├── browser-session.ts # Isolated BrowserContext & Page wrapper
│   │   │   ├── page-state.ts      # Bounded DOM & interactive element extractor
│   │   │   ├── playwright-tools.ts# Tool execution implementations
│   │   │   ├── url-validator.ts   # SSRF defense & URL parsing
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── package.json
│   └── agent/               # Groq LLM client, prompt & agent loop
│       ├── src/
│       │   ├── groq-client.ts     # Groq chat completion & tool caller
│       │   ├── prompts/           # System prompt with safety boundaries
│       │   ├── tools/             # Tool definitions & dispatch registry
│       │   ├── agent-loop.ts      # Multi-turn execution loop
│       │   ├── task-manager.ts    # In-memory task store & concurrency
│       │   └── index.ts
│       ├── tests/
│       └── package.json
├── .env.example
├── package.json             # Root npm workspace configuration
├── tsconfig.base.json       # Monorepo TypeScript base configuration
└── README.md
```

---

## 4. Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Playwright Chromium**: installed via `npx playwright install chromium`
- **Groq API Key**: Obtainable from [Groq Console](https://console.groq.com/)

---

## 5. Installation & Setup

1. **Clone the repository and enter the directory**:
   ```bash
   cd webbrowser-agent
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

3. **Install Playwright browser binaries**:
   ```bash
   npx playwright install chromium
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to supply your Groq API key:
   ```dotenv
   GROQ_API_KEY=gsk_your_groq_api_key_here
   GROQ_MODEL=your_groq_model_id
   NODE_ENV=development
   API_PORT=4000
   WEB_ORIGIN=http://localhost:3000
   BROWSER_HEADLESS=true
   TASK_TIMEOUT_MS=120000
   MAX_AGENT_ITERATIONS=25
   ```

---

## 6. Development & Build Commands

- **Run in development mode (API + Web concurrently)**:
  ```bash
  npm run dev
  ```
  - Backend API starts on: `http://localhost:4000`
  - Frontend Web UI starts on: `http://localhost:3000`

- **Build all packages and applications**:
  ```bash
  npm run build
  ```

- **Run all automated tests**:
  ```bash
  npm run test
  ```

- **Run individual package tests**:
  ```bash
  npm run test:browser
  npm run test:agent
  ```

---

## 7. API Reference

### Health Check
`GET /api/health`

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-10-30T07:45:00.000Z"
}
```

### Submit a Task
`POST /api/tasks`

Request:
```json
{
  "task": "Navigate to https://example.com and extract the main headline.",
  "confirmConsequentialActions": false
}
```

Response (HTTP 202 Accepted):
```json
{
  "taskId": "7f09a805-4dc2-482f-87a4-84594c965c49",
  "status": "queued"
}
```

### Get Task Status
`GET /api/tasks/:taskId`

Response:
```json
{
  "id": "7f09a805-4dc2-482f-87a4-84594c965c49",
  "description": "Navigate to https://example.com and extract the main headline.",
  "status": "completed",
  "createdAt": "2026-10-30T07:45:00.000Z",
  "startedAt": "2026-10-30T07:45:01.000Z",
  "completedAt": "2026-10-30T07:45:04.000Z",
  "result": {
    "summary": "Example Domain headline found and extracted successfully.",
    "finalUrl": "https://example.com/"
  },
  "actionHistory": [
    {
      "id": "action-1",
      "toolName": "navigate",
      "status": "completed",
      "startedAt": "2026-10-30T07:45:01.500Z",
      "completedAt": "2026-10-30T07:45:02.800Z",
      "summary": "Action 'navigate' succeeded."
    },
    {
      "id": "action-2",
      "toolName": "extract_text",
      "status": "completed",
      "startedAt": "2026-10-30T07:45:03.000Z",
      "completedAt": "2026-10-30T07:45:03.500Z",
      "summary": "Action 'extract_text' succeeded."
    }
  ]
}
```

### Cancel an Active Task
`POST /api/tasks/:taskId/cancel`

Response:
```json
{
  "taskId": "7f09a805-4dc2-482f-87a4-84594c965c49",
  "status": "cancelled"
}
```

---

## 8. Security Design

1. **SSRF Mitigation**:
   All target URLs are parsed and inspected before Playwright loads them. Non-HTTP(S) protocols (`file:`, `javascript:`, `ftp:`) are strictly forbidden. Access to `localhost`, `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, link-local `169.254.0.0/16`, and cloud metadata endpoints (`metadata.google.internal`) is blocked at the validation layer.
2. **Context Isolation**:
   Every submitted task receives a discrete `BrowserContext`. No cookies, sessions, or local storage are leaked between concurrent or sequential tasks.
3. **Prompt Injection Boundary**:
   System instructions explicitly instruct the LLM that content loaded from webpages is untrusted data and cannot override user instructions or system policies.
4. **Credential Confidentiality**:
   The `GROQ_API_KEY` is loaded and utilized strictly on the server side. It is never transmitted to the browser client.

---

## 9. Troubleshooting

- **Browser Launch Failures**: Ensure Playwright browser binaries have been installed via `npx playwright install chromium`. On Linux distributions, you may also need `npx playwright install-deps chromium`.
- **Invalid Groq API Key**: Verify `GROQ_API_KEY` in `.env` is configured and has an active quota.
- **Port Conflict**: Change `API_PORT` (default 4000) or web port (default 3000) in `.env` and `apps/web/package.json` if ports are already bound.

