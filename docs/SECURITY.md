# Security Policy

## Supported Versions

Security fixes apply to the latest published release on npm.

Older releases are not maintained - upgrade to the current version to receive fixes.

## Reporting a Vulnerability

For a non-sensitive issue - a crash, a bad flag interaction, a dependency advisory with a public CVE - open an issue at [github.com/zoltraks/quest-runner/issues](https://github.com/zoltraks/quest-runner/issues).

For a report whose details should not be public before a fix exists, contact the maintainer through the GitHub profile at [github.com/zoltraks](https://github.com/zoltraks) instead of opening a public issue.

A useful report includes the affected version, the environment (operating system, shell, Node.js version), the scenario or command that triggers the problem, and the observed impact.

## Scope

The tool executes local scenario files and calls remote endpoints.

Never run scenario files or configuration from sources you do not trust - a scenario is executable JavaScript with full local privileges.
