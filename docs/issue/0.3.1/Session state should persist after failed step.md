# Session state should persist after failed step

When a step updates shared session state and then throws an exception (for example because `x.call()` fails and is not executed with `{ ignore: true }`), the updated state is not persisted for the following tasks.

This produces confusing follow-up errors, because subsequent steps that use relative URLs (like `/api/books`) will be resolved without a base and can end up as `https:///api/books`.

## Expected Behavior

If any of the following is updated during a step, it should persist for subsequent steps and tasks in the same run even if the current step fails later:

- Base URL set by `x.setBase()`

- Parameters set by `x.setParameter(name, value)`

- Persisted request headers set by `x.setHeader()`

  This includes headers set via `x.setAuthorization()` and `x.setContentType()`, which should continue setting `Authorization` and `Content-Type` headers (i.e. keep the current behavior).

- Options set by `x.setOption(name, value)`

  Similar to `x.setParameter()`, `x.setOption()` should require at least a name.

  If a second parameter `value` is passed, it sets the option.

  If the second parameter is omitted, the option with the given name is removed.

  In particular, `timeout` and `insecure` should be part of options and should persist.

The above values should remain overridable later in the scenario by calling the same setter again.

When `x.call()` is used with custom headers and options, they must be merged with the persisted headers and options.

Per-call values should override persisted values.

This should be implemented as a runtime behavior change (runner/Test implementation).

It should NOT require changing scenario code.

In particular, scenario authors should not be forced to wrap steps in `try`/`finally` blocks just to persist state.

## Actual Behavior

- A step can call `x.setBase()` and it prints that the base address was set.

- If a later operation in the same step throws, the runner does not persist the updated session state.

- The next task starts without the updated base, so relative endpoints become malformed URLs like `https:///api/books` and fail with follow-up DNS / connection errors.

## Example Output

```
STEP  1  Obtain JWT token

Base address set to https://localhost:9090

CALL POST https://localhost:9090/api/auth/token

ERROR Failed to parse HTTP response: self-signed certificate

TASK  2  Book Retrieval

STEP  1  Get all books

CALL GET https:///api/books

ERROR Failed to parse HTTP response: getaddrinfo ENOTFOUND api
```

## Notes

- The current behavior is that the runner persists `base`, `parameters`, `headers` back to the outer variables only at the bottom of the step execution loop and if an exception is thrown before reaching that point, the updated state is lost.

- Consider persisting selected session state in a `finally` block per step.

- Persist `base`, `parameters`, `headers` and `options` changes even if a step fails.

  This includes values set via `x.setBase()`, `x.setParameter()`, `x.setHeader()` and `x.setOption()`, as well as values managed by helper methods like `x.setAuthorization()`, `x.setContentType()`, and `x.setInsecure()`.

  When `x.call()` is executed, merge persisted values with per-call values in the following precedence order:

  - persisted `headers`
  - per-call headers (step-local)

  and similarly:

  - persisted `options`
  - per-call options (step-local)

- After implementing this behavior change, update `README.md` to document the new persistence rules and header precedence.
