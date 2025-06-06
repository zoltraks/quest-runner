
//   __________________________________________________________________________
//  |                                                                          |
//  |        ______                 _________     ________________________     |
//  |      .~      ~.  |         | |             /                 |           |
//  |     |          | |         | |_____        \________         |           |
//  |     |      ._  | |         | |                      \        |           |
//  |      `.______~-_ `._______.' |______________________/        |           |
//  |                                                                          |
//  |     _________                ______    ______    _________  _________    |
//  |    |___      \  |         | |      \  |      \  |          |___      \   |
//  |    |   |_____/  |         | |       | |       | |____      |   |_____/   |
//  |    |      \     |         | |       | |       | |          |      \      |
//  |    |       \    `._______.' |       | |       | |_________ |       \     |
//  |                                                                          |
//  |__________________________________________________________________________|
//
//  TITLE:        Quest Runner
//  DESCRIPTION:  Tool for creating and processing logic flow scenarios
//  AUTHOR:       Filip Golewski
//  YEAR:         2024

const ansi = require('ansi-colors');

ansi.enabled = require('color-support').hasBasic;

const utils = require('./utils.js');

const { Test } = require('./test.js');
const { Result } = require('./result.js');
const { AssertionError } = require('./assert.js');

const state = { task: [] };

const mode = {};

const task = (name, code, info) => {
    if (typeof name === 'function') {
        info = code;
        code = name;
        name = '';
    } else if (code === undefined && typeof name === 'function') {
        code = name;
        name = '';
    }
    state.task.push({
        name,
        code,
        info
    });
};

const step = (name, code, info) => {
    if (code === undefined) {
        code = name;
        name = '';
    }
    state.step.push({
        name,
        code,
        info
    });
};

let playing = false;

const play = argv => {
    if (playing) return;
    playing = true;
    if (argv == undefined) argv = require('./line.js');
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const result = await run(argv);
                playing = false;
                resolve(result);
            }
            catch (error) {
                playing = false;
                reject(error);
            }
        }, 0);
    });
}

const run = async argv => {
    const path = require('path');
    const hideStartTime = utils.stringToBoolean(process.env.HIDE_START_TIME);
    if (argv && argv.verbose && argv.file) {
        console.log();
        const relative = path.relative(process.cwd(), argv.file);
        console.log(`${ansi.yellowBright('FILE')} ${ansi.greenBright(relative)}`);
    }
    if (!hideStartTime && argv.operation !== 'list') {
        console.log();
        console.log(`${ansi.magentaBright('TIME')} ${ansi.whiteBright(utils.getTimeString(new Date()))}`);
    }
    console.log();
    const result = new Result();
    result.stack = [];
    let start;
    let entry;
    let number = 0;
    let fail;
    let parameters = {};
    let base = undefined;

    for (const task of state.task) {

        try {

            number++;

            let skip = false;

            if (task.info != undefined && typeof task.info === 'object') { 
                if (task.info.skip === true) {
                    skip = true;
                }
            }

            if (typeof mode.task === 'object' && Array.isArray(mode.task)) {
                const value = (task.name ?? '').toLowerCase();
                skip = true;
                for (const check of mode.task) {
                    if (value === check.toLowerCase()) {
                        skip = false;
                        break;
                    }
                }
            }

            if (!skip && typeof mode.skip === 'object' && Array.isArray(mode.skip)) {
                const value = (task.name ?? '').toLowerCase();
                for (const check of mode.skip) {
                    if (value === check.toLowerCase()) {
                        skip = true;
                        break;
                    }
                }
            }

            if (skip && task.info != undefined && typeof task.info === 'object') { 
                if (task.info.always === true) {
                    skip = false;
                }
            }

            if (skip) {
                continue;
            }

            console.log(`${ansi.blueBright('TASK')} ${ansi.bgBlue(' ' + ansi.whiteBright(number) + ' ')}${task.name ? ' ' : ''}${task.name}`);
            console.log();

            state.test = new Test();
            state.test.base = base;
            state.test.parameters = parameters;
            state.step = [];
            if (task.code && typeof task.code === 'function') {
                await task.code(state.test);
            }
            let index = 0;

            while (state.test.running) {

                if (index >= state.step.length) {
                    state.test.stop(true);
                    continue;
                }

                const step = state.step[index];
                if (typeof step.info === 'object' && step.info.skip === true) {
                    index++;
                    continue;
                }
                let name = step.name == undefined ? '' : step.name;
                if (Array.isArray(name)) name = name.length == 0 ? '' : name[0] != undefined ? name[0] : '';

                console.log(`${ansi.redBright('STEP')} ${ansi.bgRed(' ' + ansi.whiteBright(1 + index) + ' ')}${name ? ' ' + ansi.greenBright(name) : ''}`);
                if (argv.operation !== 'list') console.log();

                if (argv.operation === 'list') {
                    index++;
                    continue;
                }

                start = utils.getTimeString();
                entry = {
                    task: { name: task.name, number },
                    step: { name: step.name, index, start: new Date() }
                };
                if (step.info) entry.step.info = step.info;
                result.stack.push(entry);
                if (step.code) {
                    let empty = true;
                    const originalLog = console.log;
                    const originalError = console.error;
                    console.log = (...args) => {
                        // empty = false;
                        // console.log = originalLog;
                        // console.log(args);
                        const line = args.join('');
                        empty = line.length === 0 || line.endsWith('\n');
                        originalLog(...args);
                    };
                    console.error = (...args) => {
                        // empty = false;
                        // console.error = originalError;
                        // console.error(args);
                        const line = args.join('');
                        empty = line.length === 0 || line.endsWith('\n');
                        originalError(...args);
                    };
                    try {
                        if (typeof step.code === 'function') {
                            await step.code(state.test);
                        }
                        if (typeof step.code === 'string') {
                            eval(step.code);
                        }
                    } finally {
                        console.log = originalLog;
                        console.error = originalError;
                        if (!empty) console.log();
                    }
                }
                entry.time = utils.getTimeDifference(start, utils.getTimeString());
                if (state.test.output) {
                    entry.result = state.test.output;
                    delete state.test.output;
                }

                if (!state.test.queue.length) {
                    index++;
                } else {
                    const next = state.test.queue.shift();
                    index = utils.findIndexDeepCaseInsensitive(state.step, 'name', next);
                    if (index < 0) {
                        throw `Step not found. Missing "${next}".`;
                    }
                }

                parameters = state.test.parameters;
                base = state.test.base;
            }
            if (argv.operation !== 'list') console.log();
        }
        catch (error) {

            fail = true;

            if (entry) {
                if (start && !entry.time) entry.time = utils.getTimeDifference(start, utils.getTimeString());
                const message = typeof error === 'string' ? error : error.message;
                entry.error = message;
                if (entry.step && entry.step.error == undefined) {
                    entry.step.error = message;
                }
            };

            let message = (typeof error === 'string' ? error : error.message).trim();
            if (message.length > 0) {
                if (result.error == undefined) result.error = message;
                else if (result.errors == undefined) result.errors = [result.error, message];
                else if (Array.isArray(result.errors)) result.errors.push(message);
                else result.errors = [result.errors, message];
            }

            if (error instanceof ReferenceError) {
                console.error(error.message);
                console.log();
            }

            if (error instanceof AssertionError) {
            } else {
                const debug = utils.stringToBoolean(process.env.DEBUG);
                if (debug && error.stack) {
                    console.error(error.stack);
                    console.log();
                }
            }
        }
        if (argv.operation === 'list') console.log();
    }
    if (fail) {
        result.fail = true;
        process.exitCode = 1;
    }
    return result;
};

module.exports = {
    task,
    step,
    play,
    mode,
};
