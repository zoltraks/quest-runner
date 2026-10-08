# JavaScript Command-Line Tool Engineering Standards

## Purpose

This document defines the engineering standard for a small command-line tool written in JavaScript on Node.js.

It covers the language version, the project layout, the coding conventions, the packaging, the testing, and the verification loop.

It is written to be executed directly by an AI coding agent and to be read without effort by a human reviewer.

## Scope

A project is in scope when all of the following conditions hold.

- The project is a Node.js command-line tool written in JavaScript.
- The package is a CommonJS package.
- The tool is invoked through a `bin` entry declared in `package.json`.
- The tool performs local work or calls remote services through spawned processes or standard-library clients.

A project that uses TypeScript, an ESM-first layout, or a bundler is out of scope, because those stacks carry different conventions.

An HTTP service is out of scope for its service-specific concerns - use the matching service standard instead.

## How To Use This Standard

This section is the entry point for an agent.

Read it before reading anything else in this document.

### Order Of Operations

Follow these steps in order at the start of every task that touches JavaScript code.

1. Read the project rules file, such as `README.md` or the project guidelines, because a project rule overrides this standard.
2. Determine the Node.js floor, the module system, and the entry-point shape using the Agent Intake Protocol below.
3. Confirm the conclusion with the user when the repository is ambiguous.
4. Apply the sections of this standard that match the confirmed project kind.
5. Run every applicable row of the Verification section.
6. Check the result against the Definition of Done before reporting the task complete.

### Precedence

When two rules conflict, apply the first matching source in this list.

| Rank | Source                                    | Example                                      |
|------|-------------------------------------------|----------------------------------------------|
| 1    | An explicit instruction from the user     | "Keep this tool on CommonJS"                 |
| 2    | The project rules file                    | `README.md` or the project guidelines        |
| 3    | The existing convention in the repository | kebab-case option names across the CLI       |
| 4    | This standard                             | Exit codes honest and mapped to failure kind |
| 5    | General JavaScript best practice          | Anything the four sources above do not cover |

Never silently reformat existing code to match this standard.

A whole-repository reformat destroys review history and hides the real change inside noise.

Bring a deviation to the user as a proposal, not as an unrequested edit.

### Non-Negotiable Rules

- **No hardcoded secrets.** A secret in a committed file is a security incident.
- **stdout carries the payload.** Diagnostics, progress, and warnings go to stderr.
- **Exit codes are honest.** `0` means success, a non-zero code means failure - a failure that exits `0` is a defect.
- **`--help` and `--version` work.** Every public CLI answers both without touching remote systems.
- **No `var`.** Use `const` by default and `let` only when reassignment is required.
- **`node --check` produces no errors** on every changed file.
- **No new runtime dependency without a reason.** A small tool keeps its dependency list short.

A violation of any of these rules is a defect, not a style preference.

## Agent Intake Protocol

### Detection First

Before asking the user anything, inspect the repository and infer the project shape.

| Signal Found In The Repository            | Inferred Decision               | Confidence |
|-------------------------------------------|---------------------------------|------------|
| `package.json` without `"type": "module"` | CommonJS                        | High       |
| `"bin"` field in `package.json`           | CLI entry point                 | High       |
| `#!/usr/bin/env node` shebang in bin file | Direct Node execution           | High       |
| `yargs`, `commander`, or `util.parseArgs` | Argument parser adopted         | High       |
| ESLint flat config (`eslint.config.js`)   | Lint baseline present           | High       |
| `"engines"` field in `package.json`       | Node.js floor declared          | High       |
| No `"engines"` field                      | Floor from strictest dependency | Medium     |

### Existing Project

When detection is confident, state the conclusion and ask for a single confirmation rather than running a questionnaire.

When detection is ambiguous, ask only the questions that resolve the ambiguity.

## Documentation

The following are the authoritative sources for JavaScript CLI development.

- [Node.js Documentation](https://nodejs.org/docs/latest/api/) - runtime API reference.
- [npm package.json Reference](https://docs.npmjs.com/cli/v10/configuring-npm/package-json) - the `bin`, `files`, `engines`, and `scripts` fields.
- [util.parseArgs](https://nodejs.org/docs/latest/api/util.html#utilparseargsconfig) - the built-in argument parser.
- [yargs](https://yargs.js.org/) - the argument-parsing library when the project adopts one.
- [ESLint](https://eslint.org/) - the lint baseline.
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - community-curated structure and error-handling practices.

## Language Version

The tool targets the Node.js floor declared by the project - the `engines` field when present, otherwise the strictest floor among the runtime dependencies.

The package is CommonJS: `require` and `module.exports`, no `"type": "module"` in `package.json`.

Do not mix ESM `import` syntax with CommonJS in the same file.

Do not introduce TypeScript or a build step without an explicit user decision, because a small tool has no compile stage.

## Core Technologies

- Built-in `http` and `https` modules, or spawned clients, for remote calls.
- `child_process` for system commands, invoked with argument arrays.
- `path` for filesystem paths - never concatenated separators.
- `yargs` or `util.parseArgs` for argument parsing - one parser per project.
- ESLint flat config for linting.

## Project Structure

```plaintext
bin.js                  CLI entry point - shebang, argument parsing, dispatch
index.js                public module API when the package is also a library
<concern>.js            single-purpose modules grouped by responsibility
test/                   smoke and scenario scripts
docs/                   project documentation and standards
package.json            package manifest - bin, files, engines, scripts
```

A flat layout is a legitimate choice for a small tool - split files by concern instead of piling everything into the entry point.

The `bin` script stays thin: parse arguments, resolve configuration, dispatch, set the exit code.

### Version Control Exclusions

`node_modules/`, output captures, and scratch workspaces are gitignored.

The lockfile `package-lock.json` is committed.

## Naming Conventions

- Functions and variables: `camelCase`.
- Source files: the dominant convention of the project, for example `camelCase`.
- CLI options: kebab-case long flags, for example `--silent`, with short aliases only when they add real value.
- Environment variables: `SCREAMING_SNAKE_CASE`.
- Fixture and scenario files: the project pattern, for example `*.quest.js`.
- Full words over abbreviations - `arguments`, not `args`, `parameters`, not `params`, unless the surrounding code says otherwise.

## Code Conventions

### Output Contract

stdout carries the payload - the result a caller pipes or captures.

Diagnostics, progress, and warnings go to stderr.

A `--silent` or `--quiet` flag suppresses decoration, not correctness - the exit code still reports the outcome.

### Exit Codes

`0` means success and a non-zero code means failure.

Map the failure kind to a stable code when the tool documents distinct codes - a caller may branch on them.

`process.exit()` belongs in the entry point - library code returns results and throws errors instead.

### Errors

Fail with a clear message on stderr and a non-zero exit code.

Catch the expected failure modes - missing file, unreachable host, bad arguments - and translate them into actionable messages.

A raw stack trace is a debugging aid, not the primary user-facing error.

### Cross-Platform Behavior

Use `path` for every filesystem path.

Run system commands through `child_process` with argument arrays, and provide fallbacks when a command is platform-specific.

Support Windows, Linux, and macOS unless the project states otherwise.

### Forbidden Patterns

- Hardcoded credentials, tokens, or private endpoints.
- `process.exit()` inside library code.
- Reading an environment variable not documented in the README.
- A runtime dependency used only by development tooling - it belongs in `devDependencies`.

## Formatting and Linting

When the project ships an ESLint flat config, `npm run lint` is mandatory before a change is done and `npm run lint:fix` handles auto-fixes.

Match the surrounding code style when no config exists.

Run `git diff --check` on every change to catch whitespace errors.

## Testing

A small CLI is verified by executable scenarios or smoke scripts with binary exit codes rather than a unit-test framework.

Keep at least one fast smoke script that proves the tool works end-to-end without external services - wire it as a package script such as `npm run smoke`.

A default `npm test` stub always fails - replace it with a real suite, or leave it and name the actual verification commands instead.

When a unit suite is added, prefer the built-in `node:test` runner with `node --test` to keep the dependency list short.

## Build

A plain JavaScript CLI has no compile stage - development runs the bin file with `node`, users run the installed command.

Publishing runs `npm publish` after the `files` field in `package.json` limits the payload to runtime files.

Verify the packed payload with `npm pack --dry-run` before a release.

## Dependencies

npm is the package manager - add with `npm add <pkg>` or `npm add -D <pkg>` for development dependencies, remove with `npm remove <pkg>`.

Prefer versions published at least 7 days ago - avoid floating ranges that auto-resolve to brand-new releases.

Keep the runtime dependency list short - every dependency is a supply-chain and install-time cost for every user.

## Comments

Comments explain reasons, not actions.

Do not restate the code.

A comment that documents a non-obvious contract or a forbidden pattern earns its place.

## Verification

| Check                  | Command Or Method                                 | Applies To         |
|------------------------|---------------------------------------------------|--------------------|
| Lint passes            | `npm run lint`                                    | Every change       |
| Syntax check passes    | `node --check <file>`                             | Changed JS files   |
| CLI runs               | The bin entry with `--version`                    | Every change       |
| Help renders           | The bin entry with `--help`                       | Option changes     |
| Smoke scenario passes  | `npm run smoke` or the project smoke script       | Behavior changes   |
| Failure exits non-zero | Run an invalid invocation and check the exit code | Error-path changes |
| Dependency audit       | `npm audit --omit=dev`                            | Dependency changes |
| Diff hygiene           | `git diff --check`                                | Every change       |

## Definition of Done

### Correctness

- Lint is clean and the smoke scenario passes.
- `--version` and `--help` produce correct output.

### Interface

- The stdout/stderr split is respected.
- Exit codes report the real outcome.

### Quality

- No debugging output or commented-out code remains.
- Comments explain reasons, not actions.

### Hygiene

- `node_modules/` and scratch workspaces stay gitignored.
- No secret, token, or credential was committed.
- The README was updated when the change altered flags, options, or behavior.

## General Principles

**Thin Entry Point.** The bin script parses arguments and dispatches - logic lives in modules the CLI calls.

**Scriptable.** stdout is machine-readable, so a caller can pipe, capture, and branch on the exit code.

**Fail Fast.** Bad arguments and missing configuration exit before work begins.

**Cross-Platform.** Paths, shells, and system commands work on Windows, Linux, and macOS.

## Sources

The following authoritative references support the rules in this document.

- [Node.js Documentation](https://nodejs.org/docs/latest/api/) - the `child_process`, `path`, `process`, and `node:test` APIs referenced by this standard.
- [npm package.json Reference](https://docs.npmjs.com/cli/v10/configuring-npm/package-json) - the `bin`, `files`, and `engines` fields.
- [util.parseArgs](https://nodejs.org/docs/latest/api/util.html#utilparseargsconfig) - the dependency-free argument parser.
- [yargs](https://yargs.js.org/) - the library choice for richer CLI surfaces.
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - structure and error-handling practices.
