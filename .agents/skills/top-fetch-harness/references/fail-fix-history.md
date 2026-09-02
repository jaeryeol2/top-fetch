# Fail & Fix History and README.md Documentation Guidelines (Documentation Protocol)

This document defines the unit-test execution history, failure documentation, and README.md update procedure required by Article 9 of `AGENTS.md`.

---

## 1. Two-Step Fail History Documentation Principle
When an error/failure occurs during unit test execution:
1. **Step 1 (Record failure history)**:
   - First record the cause of the failure, the failed test case, and the resulting error log/symptoms at the bottom of `README.md`.
2. **Step 2 (Record the fix and date)**:
   - After resolving the issue via a code fix, you must clearly state the modified filename(s) and date in the format `[Fix completed: <filename> (yyyyMMdd)]`.

---

## 2. README.md Test Execution History Markdown Format
- **Collapsible accordion structure**: Only the latest version uses `<details open>`; past versions use `<details>`.
- **Differentiate key validation details per environment**: Boilerplate phrases are prohibited; vividly document the actual random keys/values applied, payload formats (FormData, Blob, Uint8Array), random HTTP error codes (400–599), and exponential backoff strategy.

```markdown
<details open>
<summary style="font-size: 1.1rem; font-weight: bold; cursor: pointer;">📋 v1.0.1 (YYYY-MM-DD) - [Title]</summary>

<br />

- **Test Result**: **All N files / M tests passed (100% Pass)**
- **Test Environment**: Node.js v26.0.0 / Vitest v4.1.10 / Happy-DOM v20.11.1
- **Elapsed Time**: X.XX seconds

#### 🚨 Test Failure & Fix History (Fail & Fix History)
- **[Failure record]**: ...
- **[Cause analysis]**: ...
- **[Fix completed: <filename> (yyyyMMdd)]**: ...

#### 🛠️ Today's (YYYY-MM-DD) Random Dynamic/Varied Validation History (Dynamic Testing History)
- **[...]**: ...

| Environment / Target | Test File | Tests Run | Status | Key Validation Details |
| :--- | :--- | :---: | :---: | :--- |
| **...** | `tests/...` | X / X | ✅ Pass | ... |

</details>
```
