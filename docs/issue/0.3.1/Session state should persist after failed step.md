# Session state should persist after failed step

When a step updates shared session state and then throws an exception (for example because `x.call()` fails and is not executed with `{ ignore: true }`), the updated state is not persisted for the following tasks.

This produces confusing follow-up errors, because subsequent steps that use relative URLs (like `/api/books`) will be resolved without a base and can end up as `https:///api/books`.

## Expected Behavior

If any of the following is updated during a step, it should persist for subsequent steps and tasks in the same run even if the current step fails later:

- Base URL set by `x.setBase()`

- Parameters set by `x.setParameter()`

- Authorization set by `x.setAuthorization()`

- Content type set by `x.setContentType()`

The above values should remain overridable later in the scenario by calling the same setter again.

Regular request headers should NOT implicitly persist across steps.

They should be configured per step (or per request) explicitly.

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

## Notes / Possible Fix Direction

- The runner persists `base`, `parameters`, and `headers` back to the outer variables only at the bottom of the step execution loop.

- If an exception is thrown before reaching that point, the updated state is lost.

- Consider persisting selected session state in a `finally` block per step.

- Consider separating persistent state from step-local headers.

  For example, keep persistent values like base/parameters/auth/content-type, but avoid persisting arbitrary headers unless explicitly marked as persistent.

- A possible implementation approach is to persist `Authorization` and `Content-Type` as dedicated fields on `Test` (not as parameters), similar to fields like `base`, `timeout`, or `insecure`.

  `x.setAuthorization()` and `x.setContentType()` would update these dedicated fields.

  When building request headers, merge them in the following precedence order:

  - `Test`-level `authorization` / `contentType` fields (persistent defaults)

  - headers provided for the current call (step-local)

  This way, if `Authorization` or `Content-Type` is set or passed as headers for a request, it overrides the persisted field values.

- After implementing this behavior change, update `README.md` to document the new persistence rules and header precedence.
