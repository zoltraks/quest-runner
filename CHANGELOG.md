# Changes

## Version 0.3.0

Synchronous API redesign, dependency cleanup, and code quality improvements since 0.2.1.

- Removed `axios` and `ping` dependencies in favor of synchronous system commands (`curl` and `ping` via `child_process.execSync`) to simplify the codebase and eliminate async complexity from test scenarios.
- Converted all expectation methods (`x.expectAlive()`, `x.expectAll()`, `x.expectAny()`) to synchronous execution, removing asynchronous logic and making test scenario code cleaner without requiring `async`/`await`.
- Updated `yargs` dependency from 17.1.1 to 18.0.0 for improved command-line argument parsing and compatibility.
- Added ESLint with code style auto-fixes across all source files, introducing `lint` and `lint:fix` npm scripts for consistent code quality.
- Corrected `acceptSelfSignedCertificate` logic in `test.js` to strictly respect boolean arguments and resolved lint warnings and eval scope issues in `bin.js`.
- Updated copyright year in documentation.

## Version 0.2.2

Command rename and output behavior refinements since 0.2.1.

- Renamed the `run` command to `play` for clearer semantics and better alignment with test execution terminology.
- Disabled automatic drawing of execution diagrams to reduce output verbosity and give users explicit control via the `--draw` option.
- Code cleanup and minor refactoring.

## Version 0.2.1

Command-line filtering, task control, and feature additions since 0.1.4.

- Added `--task` and `--skip` command-line options to selectively run or skip specific tasks by name, enabling focused test execution.
- Implemented `list` command to display all steps in the scenario script in order without executing them.
- Added `x.time()` method for timing operations within test steps.
- Added `x.squeeze()` utility for shrinking arrays by removing empty or undefined elements.
- Added `x.pause()` method for interactive debugging with improved handling of empty queries.
- Fixed deep copy issues for request, response, and summary objects to prevent unintended mutations.
- Improved serialization by converting message objects to JSON when assertions are called.
- Enhanced help information with extended descriptions and removed the `=s` alias for `--silent`.
- Improved npx bin scenario file scanning to better locate `.quest.js` files.
- Added environment variable support for `HIDE_STEP_RESULT`, `HIDE_STEP_ERROR`, and `SIZE_STEP_NAME` to control output formatting.
- Enabled parameter and base URL settings to be shared between tasks for better test flow continuity.

## Version 0.1.4

Documentation and minor improvements since 0.1.0.

- Updated README with additional usage examples and clarifications.
- Added missing file references to `package.json` for proper npm packaging.
- Fixed command-line argument handling and improved scenario file detection.
- Style fixes and code cleanup.

## Version 0.1.0

Initial release of Quest Runner.

- Core task and step API with `task()`, `step()`, and `play()` functions.
- HTTP request handling via `axios` with `x.call()` method.
- Network ping testing with `x.expectAlive()`.
- Assertion functions (`x.assertTrue()`, `x.assertFalse()`, `x.assertNull()`, `x.assertEmpty()`, etc.).
- Expectation wrappers (`x.expectAll()`, `x.expectAny()`).
- Parameter management with `x.setParameter()` and `x.getParameter()`.
- Header management with `x.setHeader()` and `x.getHeader()`.
- Flow control with `x.next()` for conditional step execution.
- Colored terminal output using `ansi-colors`.
- Command-line interface with `yargs`.
- Support for `.quest.js` scenario files.
