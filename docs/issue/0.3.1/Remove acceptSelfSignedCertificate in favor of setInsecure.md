# Replace acceptSelfSignedCertificate with setInsecure in docs and examples

The `Test` API currently provides both `x.acceptSelfSignedCertificate()` and `x.setInsecure()`.

We do not need `acceptSelfSignedCertificate()` anymore.

All scenarios, examples and documentation should use `x.setInsecure()` instead.

## Expected Behavior

- Remove `x.acceptSelfSignedCertificate()` from the public API.

- `x.setInsecure()` remains the only API to enable/disable insecure HTTPS behavior.

  - If called with no argument, it enables insecure mode.

  - If called with an argument, it sets insecure mode to the provided boolean value.

- Update all shipped examples and samples to use `x.setInsecure()`.

- Update `README.md` to reflect the removal:

  - Replace any mention of `acceptSelfSignedCertificate()` with `setInsecure()`.

  - Ensure the documentation describes how to enable insecure mode:

    - per-call by passing `{ insecure: true }` to `x.call()`

    - globally via the CLI flag `--insecure` / `-k`

    - globally via `INSECURE` env var

    - in-scenario via `x.setInsecure()`

## Notes

This change should be implemented as a runtime change and should not require scenario authors to wrap steps with `try`/`finally`.
