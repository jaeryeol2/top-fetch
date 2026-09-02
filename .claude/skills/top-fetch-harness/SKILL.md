---
name: top-fetch-harness
description: >-
  Execute, develop, and verify the top-fetch test harness engineering workflows across all 8 target environments
  (Vue 3, Nuxt 3, React 18/19, Next.js App Router, NestJS Backend, JSP Script Tag, Template Engines, Bundle Integrity)
  using dynamic random scenarios, fuzzer, and SSR/CSR dual-mode validation.
---

# `top-fetch` Harness Engineering Skill (Top-Fetch Harness Skill)

This skill is a runbook that systematically performs, per the development guidelines and architecture principles in `AGENTS.md`, validation of the `top-fetch` library across its 8 target environments, dynamic/varied scenario testing, dual-mode (SSR/CSR) validity evaluation, and test-result documentation.

---

## 📋 Core Validation Procedure (Step-by-Step Runbook)

### Step 1: Build & Bundle Integrity Validation
Run the build to ensure the bundle outputs (ESM, CJS, IIFE, DTS) match the latest source code:
```bash
npm run build
```
- **Validation targets**:
  - `dist/top-fetch.mjs` (ESM)
  - `dist/top-fetch.cjs` (CJS)
  - `dist/top-fetch.min.js` (IIFE Script Tag)
  - `dist/@types/top-fetch.d.mts` (DTS)

### Step 2: Static Analysis & Lint Validation
Verify code quality and compliance with SonarQube/ESLint rules:
```bash
npx eslint .
```
- **Principles**: No `any` usage, minimize cognitive complexity, switch to `switch` when there are 4+ `if` conditions.

### Step 3: Run the 8-Environment Matrix & Dynamic/Varied Harness
Run the full unit test suite and matrix harness:
```bash
npm test
```
- **Validation targets**:
  1. **Vue 3 / React 18/19 (CSR)**: Browser AJAX, reactive state, FormData uploads, chained parsing
  2. **Next.js App Router / Nuxt 3 (SSR & CSR Dual-Mode)**: Server Component/Action fetch & hydration client fetch
  3. **NestJS / Node.js Backend**: Singleton service injection, 4xx/5xx error collection, exponential backoff retry, `returnError` conversion
  4. **JSP / Legacy HTML**: Loading `dist/top-fetch.min.js` as an IIFE script tag and polymorphic queries via `window.topFetch`
  5. **Server Template Engines (EJS/Handlebars/Thymeleaf)**: SSR pre-fetching and binary Blob downloads
  6. **Multi-tenant Isolation & Circular-Reference Guard**: `topFetch.create()` instance isolation and WeakSet-based circular-reference detection
  7. **Chaos / Fuzzer**: Random queries, emoji/Unicode, extreme timeouts (0–10ms), stream-cloning safety

### Step 4: Write & Cumulatively Update the README.md Test Execution History (Mandatory)
Immediately after tests complete, record the results **only in the `## 🧪 Test Execution History` section at the bottom of `README.md`** (do not add test history to `manual.html` — keep it as an API usage manual only):
- **State version and date**: Structure the latest run history as `<details open>` and past history as `<details>`
- **Test result summary**: Number of passing files, total test count, pass rate (100% Pass), elapsed time
- **Write unique/dynamic details**: Specify concretely the random keys/values actually applied, payload formats, error codes (400–599), and SSR/CSR branching details
- **Sync Fail & Fix history**: If a fix occurred, reflect it with a `[Fix completed: <filename> (yyyyMMdd)]` entry

---

## 🚨 Test Failure Response Protocol (Fail & Fix Workflow)

If a failure occurs during unit tests or harness execution, **never immediately overwrite the source code**; instead follow these steps:

1. **Step 1 (Record failure history)**:
   - First, clearly record the cause of the failure, the failed test case, and the resulting error log at the bottom of the `README.md` test execution history.
2. **Step 2 (Fix and record the date)**:
   - After fixing the source code or tests, specify the fix date and modified file(s) in the format `[Fix completed: <filename> (yyyyMMdd)]`.

---

## 📚 Detailed Reference Documents (References)
- [8 Target Environments Specification](./references/target-environments.md)
- [Dynamic/Varied Data & Fuzzing Generation Guidelines](./references/dynamic-generators.md)
- [Harness Engineering Rules](../../rules/harness-engineering.md)
