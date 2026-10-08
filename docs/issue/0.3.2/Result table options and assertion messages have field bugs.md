# Result table options and assertion messages have field bugs

Static analysis during the 0.3.2 refactoring review found four defects in `result.js`, `assert.js`, and `line.js`.

These are behaviour defects routed here per the refactoring rules, and they are excluded from `docs/refactoring/0.3.2/Proposal.md`.

## Defects

### `hideStepError` reads the wrong config field

In `src/quest-runner/result.js` `print()` (around line 170), `hideStepError` is computed from `config?.hideStepResult` instead of `config?.hideStepError`.

Passing `{ hideStepError: true }` to `result.print()` has no effect, while `{ hideStepResult: true }` suppresses both the result and the error columns.

### `sizeName` option expression is fragile

In `print()` (around line 166), `config?.sizeName ?? 0 + process.env.SIZE_STEP_NAME > 0 ? process.env.SIZE_STEP_NAME : 40` depends on `??`, `+`, `>`, and `?:` precedence.

It happens to work, but any edit to the expression can silently change behaviour. The intent should be written explicitly.

### `assertFalse` never quotes the value

In `src/quest-runner/assert.js` (around line 17), `assertFalse` computes `s` from `o`, then quotes `o` instead of `s`, so the quoted detail never reaches the failure message.

### `assertNull` reports the message instead of the value

In `assert.js` (around line 42), `assertNull` builds its detail string from `message` rather than the offending value `o`, so a failed `assertNull` can never show what was received.

### Typo in `list`/`--draw` help

In `src/quest-runner/line.js`, the `--draw` description reads "Draw exectuion diagram".

## Expected Behavior

- `hideStepError` suppresses the error column independently of `hideStepResult`.
- `sizeName` is computed with explicit precedence.
- `assertFalse` and `assertNull` failure messages show the received value.
- Help text spells "execution" correctly.

## Implementation Plan

1. Fix the `hideStepError` field reference and parenthesize the `sizeName` expression in `result.js`.
2. Fix `assertFalse` to quote `s` and `assertNull` to describe `o` in `assert.js`.
3. Fix the `exectuion` typo in `line.js`.
4. Run `npm run lint`, `npm run smoke`, and `node bin.js play example/book.quest.js`. Verify the `--help` output text.

## Verification

- `npm run lint`: Passed.
- `npm run smoke`: Passed.
- `node bin.js play example/book.quest.js`: Passed, 17 steps, exit code 0.
- `node bin.js --help`: Passed, "Draw execution diagram" spelled correctly.
- Manual `Result.print` probe: Passed, `hideStepError` now suppresses the error column independently.
- Manual `assertFalse`/`assertNull` probe: Passed, failure messages now show the received value.

Status: implemented.
