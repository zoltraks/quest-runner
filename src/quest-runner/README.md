Quest Runner
============

This is a remote API testing tool that uses the **JavaScript** language and **Node.js**.

Scenarios are written in pure JS, allowing for complex logic while keeping the test flow readable and synchronous.

> Please consider following the project's author [Filip Golewski](https://github.com/zoltraks) and ⭐ the [project](https://github.com/zoltraks/quest-runner) to show your ❤️ and support.

## Quick Start ##

Create `my.quest.js`:

```js
task('My First Quest', () => {
    step('Hello World', x => {
        x.result('Testing my API...');
    });
});
```

Run it:

```sh
$ npx quest-runner run my
```

## Basic Usage ##

All API functions are **synchronous**. No `async` or `await` needed.

### Base URL and Authorization ###

```js
step('Initialize', x => {
    x.setBase('https://api.example.com');
    x.setAuthorization('Bearer', 'YOUR_JWT_TOKEN');
});
```

### Making Calls ###

```js
step('Get User', x => {
    const response = x.call('GET', '/users/1');
    x.assertTrue(response.status === 200);
    x.result(x.getSummary());
});
```

### Assertions ###

```js
x.assertTrue(condition);
x.assertEquals(expected, actual);
x.assertNotNull(subject);
x.expectAlive('google.com');
```

## Detailed Documentation ##

For advanced features like conditional steps, parameter persistence, and full API reference, please visit the [Main Repository](https://github.com/zoltraks/quest-runner).

### Author ###

**Filip Golewski**
* [GitHub Profile](https://github.com/zoltraks)
* [LinkedIn Profile](https://www.linkedin.com/in/filipgolewski)

### License ###

Copyright © 2024-2026 [Filip Golewski](https://github.com/zoltraks)
Released under the [MIT License](LICENSE).
