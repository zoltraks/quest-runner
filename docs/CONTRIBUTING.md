# Contributing to Quest Runner

Thank you for your interest in contributing.

This document explains how to report issues, set up the project, and submit changes.

## Ways To Contribute

- Report bugs and unexpected behavior.
- Request features and improvements.
- Improve documentation, examples, and error messages.
- Submit code fixes and enhancements.

## Reporting Issues

Search the existing issues at [github.com/zoltraks/quest-runner/issues](https://github.com/zoltraks/quest-runner/issues) before opening a new one.

Open one issue per problem.

Include the quest-runner version, the operating system and shell, the command or scenario you ran, the expected behavior, and the actual behavior.

A minimal `.quest.js` scenario that reproduces the problem is the most useful attachment.

## Development Setup

Clone the repository and work inside the package directory:

```bash
git clone git@github.com:zoltraks/quest-runner.git
cd quest-runner/src/quest-runner
npm install
```

The package source lives in `src/quest-runner/` - all package commands run from that directory.

Check your setup:

```bash
npm run lint
npm run smoke
node bin.js --version
```

`npm run smoke` executes the `test/smoke.quest.js` scenario and must exit cleanly.

The `npm test` script is an unconfigured stub - use `lint` and `smoke` as the verification loop.

## Pull Requests

- Keep each pull request focused on one change.
- Follow the code style of the surrounding files.
- Run `npm run lint` and `npm run smoke` before submitting.
- Update `README.md`, `CHANGELOG.md`, or examples when the change alters behavior, options, or output.
- Keep commit messages short - a single sentence without a trailing period, without conventional-commit prefixes.

## AI-Assisted Contributions

Disclose when a report or change was produced with AI assistance.

Verify every AI-generated finding personally before reporting it - do not paste raw AI output into an issue or pull request.

You must understand and own the code you submit - AI-assisted changes follow the same style, verification, and licensing requirements as any other contribution.

## License

Contributions are licensed under the MIT License, the same license that covers the project.
