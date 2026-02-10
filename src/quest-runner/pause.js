const ansi = require('ansi-colors');
const readline = require('node:readline');

const args = process.argv.slice(2);
const config = JSON.parse(args[0] || '{}');
const timeout = (0 + config.time) * 1000;
let question = config.text;

if (question === undefined) {
    question = '' +
        ansi.whiteBright('Press ') +
        ansi.greenBright('Enter ') +
        ansi.whiteBright('to continue... ');
}

if (question != undefined && 0 === ('' + question).trim().length) question = undefined;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let timer;

if (timeout > 0) {
    timer = setTimeout(() => {
        rl.close();
        process.exit(0);
    }, timeout);
}

rl.question(question ?? '', () => {
    if (timer) clearTimeout(timer);
    rl.close();
    // Move cursor up and clear line to clean up the prompt if needed, 
    // or just exit. The original async implementation did some cleanup.
    // simpler to just exit for now, or replicate cleanup if possible.
    // Replicating cleanup:
    readline.moveCursor(process.stdout, 0, -1, () => {
        readline.clearLine(process.stdout, 1, () => {
            process.exit(0);
        });
    });
});
