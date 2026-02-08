# Refactoring Proposal

**Date**: 2026-02-08

**Status**: Proposed

## 1. Security: Replace `eval()` with `vm` Module (WITHDRAWN)

**Target**: `src/quest-runner/bin.js`

### What is changing?

Replace the direct usage of `eval(code)` with Node.js `vm.createContext()` and `vm.runInContext()`.

### Why is it needed?

1.  **Security**: execution of arbitrary code via `eval` is risky and has access to the local scope.

2.  **Scope Stability**: The recent bug with `task`/`_task` variable naming collision was caused by `eval` sharing the local scope.

    `vm` provides a sandboxed environment, preventing such collisions.

3.  **Debugging**: `vm` allows specifying a filename for the script, improving stack traces.

### Why is it safe?

It maintains the synchronous execution model.

The `sandbox` object will explicitly expose the API (`task`, `step`, `play`, `require`, `process`, etc.), ensuring the scenario scripts have exactly what they need and nothing else.

**Compatibility**: The `vm` module is stable and fully supported in Node.js 18 and much earlier versions, ensuring backward compatibility.

### Verification

Run existing scenario tests.

They should behave identically.

Stack traces for errors in scenarios should referencing the scenario filename instead of `eval`.

---

## 2. Maintainability: Extract HTTP Client Adapter

**Target**: `src/quest-runner/test.js` -> `src/quest-runner/http.js`

### What is changing?

Extract the low-level `child_process.execSync('curl ...')` logic from the `Test` class in `test.js` into a dedicated `HttpClient` class.

### Why is it needed?

1.  **Single Responsibility**: `test.js` currently handles test context, headers management, *and* raw shell command execution.

2.  **Testability**: Decoupling the command execution allows unit testing the `Test` class with a mock executor, avoiding actual network calls during development tests.

3.  **Extensibility**: Makes it easier to support other execution methods (e.g., if a native sync HTTP library is adopted later) without changing the core `Test` logic.

### Why is it safe?

It is a purely structural refactoring (Extract Method/Class). Logic remains identical.

### Verification

Run all HTTP-based scenarios. Results must be identical.

---

## 3. Robustness: System Dependency Check

**Target**: `src/quest-runner/index.js` or `bin.js`

### What is changing?

Add a startup check to verify that `curl` and `ping` commands are available in the system logic.

### Why is it needed?

The project relies on these system tools.

If they are missing (common on some Windows setups), the tool fails with obscure execution errors during steps.

### Why is it safe?

It only adds a check before execution starts.

### Verification

Run on an environment without `curl` (or mock failure) to see a clear error message.

Run in normal environment to ensure no regression.
