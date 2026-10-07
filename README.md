# VibeGuard — Vulnerability Scanner for AI & Vibe-Coded Websites

<p align="center">
  <strong>VibeGuard</strong> is a production-quality, non-destructive web security auditing platform designed specifically for applications built with AI coding engines like <strong>Lovable, Bolt, Cursor, v0, Replit, and Claude</strong>.
</p>

---

## ⚡ Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                CLIENT BROWSER                                     |
|  - Landing (/page.tsx)             - Live Terminal SSE (/scan/[id]/page.tsx)      |
|  - Scanner Input (ScannerInput.tsx)- Audit Report Dashboard (/report/[id]/page.tsx)|
|  - Ownership Wizard (DNS/Meta/File)- Telemetry History (/history/page.tsx)        |
+------------------------------------------+----------------------------------------+
                                           | HTTP / SSE Stream
                                           v
+-----------------------------------------------------------------------------------+
|                               NEXT.JS APP ROUTER                                  |
|  - API Routes: /api/scan, /api/scan/[id], /api/verify, /api/history               |
|  - Ownership Verification Gate (DNS TXT, Meta Tag, /.well-known/vibeguard.txt)   |
|  - NextAuth.js Session Authentication & Rate Limiting (3 concurrent, 10/day)      |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                        VIBEGUARD BACKGROUND ENGINE                                |
|  - Queue: BullMQ + Redis (with seamless in-memory fallback for local dev)        |
|  - SSRF Protection Guard (ssrf.ts): RFC1918, link-local, 169.254.169.254, DNS rebinding|
|  - Orchestrator (orchestrator.ts): Concurrency throttle (max 5 req/s, 200 req cap)|
+--------------------+---------------------------------------------+----------------+
                     |                                             |
                     v                                             v
        +-------------------------+                   +-------------------------+
        |   POSTGRESQL / PRISMA   |                   |    TARGET WEBSITE       |
        | - Users & Audit Logs    |                   | - Passive GET & HEAD    |
        | - Scans & Verifications |                   | - Bundled JS & HTML     |
        | - Categorized Findings  |                   | - Headers & SSL/TLS     |
        +-------------------------+                   +-------------------------+
```

---

## 🛡️ Core Scanner Modules

Every scanner module adheres to the standard `ScannerModule` interface:

| Module | File | Target Surface & Detection Capabilities |
| :--- | :--- | :--- |
| **Secrets & Entropy** | `lib/scanners/secrets.ts` | Shannon entropy analysis (> 4.5), regex patterns for OpenAI, Anthropic, AWS, Stripe, GitHub, Supabase service-role keys, source maps (`.map`). Always masks evidence. |
| **Security Headers** | `lib/scanners/headers.ts` | Content-Security-Policy (CSP `unsafe-inline`/`unsafe-eval`), HSTS (`max-age`), X-Frame-Options, X-Content-Type-Options (`nosniff`), Referrer-Policy, Permissions-Policy. |
| **Frontend & DOM** | `lib/scanners/frontend.ts` | Insecure cookies (`Secure`, `HttpOnly`, `SameSite`), mixed content, DOM XSS sinks (`eval`, `dangerouslySetInnerHTML`), unvalidated `postMessage`, outdated CVE libraries. |
| **AI / Vibe-Code Patterns** | `lib/scanners/aiSpecific.ts` | Supabase anon key + public table RLS audits, Firebase test-mode configs, client-side authorization in `localStorage`, debug `console.log()` leaking credentials, placeholder credentials. |
| **Endpoints** | `lib/scanners/endpoints.ts` | Passive checks for `/.env`, `/.git/HEAD`, `/config.json`, `/backup.zip`, `/graphql` schema introspection, `/api/admin`. |
| **CORS Policy** | `lib/scanners/cors.ts` | Wildcard CORS origin with `Allow-Credentials: true`, arbitrary origin reflection, unauthenticated GET APIs. |
| **TLS / SSL** | `lib/scanners/tls.ts` | Certificate expiration warnings (< 30 days), automatic HTTP to HTTPS redirection, software version leakage (`Server`, `X-Powered-By`). |
| **DNS & Email** | `lib/scanners/dns.ts` | SPF record validation, DMARC policy enforcement (`p=reject`), dangling CNAME subdomain takeover vectors. |
| **Subdomains** | `lib/scanners/subdomains.ts` | Enumeration of dev/staging environments (`dev.`, `staging.`, `test.`). |

---

## 🚀 Quickstart

### Option 1: Docker Compose (Full Stack)

Run the entire stack (Next.js App + PostgreSQL + Redis):

```bash
docker-compose up --build
```

Access the application in your browser at `http://localhost:3000`.

### Option 2: Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   ```

3. **Initialize Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Unit Tests:**
   ```bash
   npm test
   ```

5. **Start Dev Server:**
   ```bash
   npm run dev
   ```

Open `http://localhost:3000`.

---

## 🧩 How to Add a New Scanner Module

Adding a new scanner module takes 3 easy steps:

1. **Create the scanner file in `lib/scanners/<name>.ts`:**
   ```typescript
   import { Finding, ScanContext } from "@/lib/types/findings";

   export async function run(target: string, context: ScanContext): Promise<Finding[]> {
     const findings: Finding[] = [];

     // Implement non-destructive inspection
     if (context.html?.includes("vulnerable-pattern")) {
       findings.push({
         id: "unique-finding-id",
         title: "Vulnerability Title",
         category: "Frontend", // "Frontend" | "Backend" | "Infra" | "AI-Specific"
         severity: "High",     // "Critical" | "High" | "Medium" | "Low" | "Info"
         cvssScore: 7.5,
         affectedUrl: target,
         evidence: "Masked evidence snippet",
         description: "Detailed description of vulnerability",
         remediation: "Step-by-step remediation guidance",
         aiFixPrompt: "Fix this issue in my codebase: [Details]",
         references: ["https://owasp.org/"],
       });
     }

     return findings;
   }

   export default { name: "<name>", run };
   ```

2. **Register the module in `lib/engine/orchestrator.ts`:**
   Import your module and add it to the `MODULES` array:
   ```typescript
   import myNewScanner from "@/lib/scanners/<name>";

   const MODULES = [
     // ...existing modules
     myNewScanner,
   ];
   ```

3. **Add unit test in `lib/scanners/__tests__/<name>.test.ts`:**
   Ensure your checks use mocked contexts and run:
   ```bash
   npm test
   ```

---

## 🔒 Mandatory Safety & Security Guardrails

- **Mandatory Ownership Verification**: Domain control must be proven before any scan begins via DNS TXT record (`vibeguard-verify=<token>`), HTML meta tag (`<meta name="vibeguard-verify" content="<token>">`), or `/.well-known/vibeguard.txt`.
- **SSRF Hardening**: Requests to private RFC1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`), IPv6 loopbacks (`::1`), and cloud metadata (`169.254.169.254`, `metadata.google.internal`) are unconditionally rejected prior to resolution and across every redirect.
- **Non-Destructive Probes Only**: No database modification payloads, no brute force, no denial-of-service tests. Probes are rate limited to 5 requests/sec and capped at 200 total requests.
- **Strict Secret Masking**: All credentials detected in evidence snippets are masked (`sk-****abcd`) to prevent secondary credential leakage.

---

## 📜 Ethical Use Disclaimer

VibeGuard is created strictly for authorized vulnerability assessment, educational defense, and assisting developers in hardening websites they own or operate. Unauthorized scanning against systems without explicit permission is strictly prohibited.
