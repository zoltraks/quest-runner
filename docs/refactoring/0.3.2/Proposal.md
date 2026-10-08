# Refactoring Proposal

**Date**: 2026-10-08

**Status**: Proposed

## Problem

Static analysis of `src/quest-runner/` found three duplicated mechanisms that have each grown independently, several readability debts, and defects discovered during analysis that are routed to separate issue documents (see Findings).

The three duplicated mechanisms are:

- The spawned-helper invocation pattern appears three times: `x.execute()` spawning `request.js`, `x.pause()` spawning `pause.js`, and `x.expectAlive()` spawning `ping.js`. Each builds the `node <helper> <json-args>` call, parses stdout JSON, and handles `proc.error` separately.
- Step display-name resolution (`name`, array fallback, index fallback) is triplicated in `index.js` and `result.js` (`draw()` and `print()`).
- Case-insensitive keyed-dictionary handling is repeated across `setHeader`, `setParameter`, `setOption`, and `mergeHeaders` in `test.js`.

The codebase is small (about 1900 lines across 11 modules), so the debt is concentrated and the refactor scope fits a single sprint.

## Goal

Consolidate the duplicated mechanisms behind single implementations, remove dead and misleading code, and keep every external contract untouched: the `task`/`step`/`play`/`mode` API, the `x.*` context surface, CLI flags, output table format, and exit codes.

## Findings

### 1. Spawned-helper invocation is triplicated

- **Issue**: `Test.execute()` (test.js), `Test.pause()` (test.js), and `Expect.expectAlive()` (expect.js) each inline `spawnSync('node', [helperPath, JSON.stringify(args)], {...})` with their own error and stdout handling.
- **Impact**: Three copies to keep consistent. The parse-and-error plumbing already diverged once (the transport-error mislabeling fixed in `test.js` existed only because each site evolved separately).
- **Recommendation**: Extract a shared helper-runner (for example `runHelper(file, args, spawnOptions)` returning `{ stdout, stderr, error }`) in `utils.js` or a new internal module, and delegate all three call sites to it. Keep each caller's own JSON parsing and result shaping.
- **Risk Level**: Major.
- **Breaking Change Assessment**: None - all three sites are internal, and behaviour must stay identical (same spawned args, same timeouts, same `windowsHide`).
- **Example**: `expectAlive` would become `const proc = runHelper('ping.js', { host, options: { timeout } }, { timeout: (timeout + 2) * 1000 })` followed by its existing parse block.

### 2. Step display-name resolution is triplicated

- **Issue**: The expression resolving a step's display name (`step.name`, `Array.isArray` fallback to `name[0]`, then index fallback) is written three times: `index.js` (line ~184), `result.js` `draw()` (line ~52), and `result.js` `print()` (line ~197).
- **Impact**: The three copies already differ subtly (empty-string handling, index rendering), so a future change to naming must be made three times and can drift.
- **Recommendation**: Extract `utils.stepDisplayName(step)` (or a private method on `Result` plus one call in `index.js`) and reuse it at all three sites. Preserve each site's current fallback choice exactly.
- **Risk Level**: Major.
- **Breaking Change Assessment**: None - pure extraction. The rendered names in output and the summary table are unchanged.
- **Example**: The multi-line `Array.isArray` fallback expression in `index.js` collapses to one `stepDisplayName(step)` call.

### 3. Case-insensitive dictionary logic is repeated in `test.js`

- **Issue**: `setHeader`, `setParameter`, and `setOption` each re-implement the same find-key-case-insensitively / delete-if-undefined / set-otherwise sequence, and `mergeHeaders` re-implements the same key lookup again.
- **Impact**: Four copies of one idea. A subtle fix (e.g., a header key that is an empty string) must be applied four times.
- **Recommendation**: Extract a private `findKeyCaseInsensitive(dictionary, name)` helper used by all four methods. Do not merge the methods themselves - they write to different fields.
- **Risk Level**: Minor.
- **Breaking Change Assessment**: None - the `x.*` surface and merge semantics stay identical.
- **Example**: `const key = Object.keys(this.options).find(name => name.toLowerCase() === search)` becomes `const key = findKey(this.options, name)`.

### 4. `result.js draw()` uses a growing switch for step-type styling

- **Issue**: A ~60-line `switch` maps `step.info.type` to prefix/suffix/color triples, with aliases (`'condition'`/`'<>'`, `'internal'`/`'::'`) interleaved.
- **Impact**: Adding a step type means editing switch arms. The mapping itself is data, not logic.
- **Recommendation**: Replace the switch with a lookup table keyed by type (with the error override kept after the lookup). Behaviour must render identically.
- **Risk Level**: Minor.
- **Breaking Change Assessment**: None - the drawn diagram output must be byte-identical.
- **Example**: The `stop` arm becomes an entry `stop: ['((', '))', red]` in a constant map, with `prefix`/`suffix`/`color` read from the entry.

### 5. Dead and commented-out code in `index.js` and `bin.js`

- **Issue**: `index.js` lines ~208-219 keep commented-out `console.log` interception lines inside the step wrapper. `bin.js` has an unreachable `else if (command === 'list')` branch (line ~44) after the combined play/list branch, and a `case ''` fallthrough that silently maps a bare invocation to `help`.
- **Impact**: Misleading scaffolding during maintenance. The dead branch suggests `list` is handled twice.
- **Recommendation**: Remove the commented lines and the unreachable branch. Add an explicit `help` command label in the switch comment or leave the yargs `.help(true)` handling documented.
- **Risk Level**: Minor.
- **Breaking Change Assessment**: None - dead code removal only. `bin.js help` output verified unchanged (prints usage, exit 0).
- **Example**: Delete the unreachable `else if (command === 'list')` block that sets `process.env.MODE`.

### 6. Non-ASCII identifier `μ` and convoluted `getTimeDifference` in `utils.js`

- **Issue**: `getTimeString` uses a Greek `μ` variable (violating the project's ASCII-preference guideline), and `getTimeDifference` builds a `total` object via a throwaway `difference` property that is later deleted.
- **Impact**: Readability and a self-inflicted style violation.
- **Recommendation**: Rename `μ` to `micros`/`fraction` and compute `total` fields directly without the temporary property.
- **Risk Level**: Minor.
- **Breaking Change Assessment**: None - internal identifier and internal object construction. The public output shape is unchanged.
- **Example**: `const total = { days, hours, minutes, seconds, milliseconds: difference }` built after computing each field.

### 7. Defects found during analysis - routed to issue documents

These are behaviour defects, not refactoring targets. Per the rules they are excluded from this proposal and recorded here for follow-up issue documents.

- `result.js` `print()` reads `config?.hideStepResult` when computing `hideStepError` (line ~170) - a copy-paste field bug.
- `result.js` `print()` `sizeName` expression (line ~166) relies on `??`/`+`/`>`/`?:` precedence and is fragile.
- `assert.js` `assertFalse` quotes `o` after converting `s` (line ~17), so the quoting never applies. `assertNull` builds its detail string from `message` instead of the value (line ~42).
- `line.js` describe text has a typo: "Draw exectuion diagram".

## Plan

1. Extract the shared helper-runner and delegate `execute()`, `pause()`, and `expectAlive()` to it (finding 1).
2. Extract step display-name resolution and reuse at the three sites (finding 2).
3. Extract the case-insensitive key lookup in `test.js` (finding 3).
4. Replace the `draw()` switch with the type-styling lookup table (finding 4).
5. Remove commented-out interception lines in `index.js` and the unreachable `list` branch in `bin.js` (finding 5).
6. Rename `μ` and simplify `getTimeDifference` construction (finding 6).

## Step Granularity

Each step is a single coherent structural change, one finding each, run independently.

No tidy work is mixed into the structural steps. Steps 5 and 6 are the tidy steps and are listed separately.

Steps execute in the listed order, each leaving the codebase buildable and lint-clean.

## Risk

All changes are internal restructurings. The main risks are behavioural drift in the helper-runner consolidation (different timeout and `windowsHide` handling per caller) and subtle divergence in step-name fallbacks. Both are covered by preserving each caller's existing parameters verbatim and verifying with `npm run lint`, `npm run smoke`, and `node bin.js play example/book.quest.js` after each step.

## Acceptance Criteria

- `npm run lint` reports zero issues.
- `npm run smoke` prints "Smoke test passed" and exits 0.
- `node bin.js play example/book.quest.js` produces identical task/step output and exit code (requires the Book API or `REMOTE` override).
- `node bin.js list example/book.quest.js`, `--draw`, `--task`, and `--skip` behave as before.
- No public API signature changes, and no scenario file requires modification.
- The defects in finding 7 are not touched by this proposal and are tracked separately.
