# Wait should block step execution

The `x.wait(ms)` API currently returns a Promise.

However, if a scenario uses `x.wait(2000)` inside a step and does not use `async`/`await` (or does not explicitly chain the Promise), the runner will immediately proceed to the next step.

This makes it impossible to create a simple scenario like:

- Step 1: print "before"
- Step 2: wait 2 seconds
- Step 3: print "after"

without either:

- converting the scenario code to `async` / `await`, or

- writing Promise chains inside the step.

## Expected Behavior

`x.wait(ms)` should block the execution of subsequent steps.

A scenario like the following should display the `After` step result about 2 seconds after the `Wait` step starts:

```js
task('Wait Verification', () => {

    step('Before', x => {
        x.result('Preparing to wait for 2 seconds...');
    });

    step('Wait', x => {
        x.wait(2000);
    });

    step('After', x => {
        x.result('This message should be visible after 2 seconds.');
    });

});
```

## Actual Behavior

The runner does not wait for `x.wait()` to complete.

All steps are executed immediately and the `After` step message is printed without any delay.

## Possible Fix Direction

- `x.wait()` should be implemented as a synchronous wait (blocking sleep) so that it matches the rest of the synchronous runner API.

- Documentation and examples should be updated to match the chosen behavior.
