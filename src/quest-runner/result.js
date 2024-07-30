const ansi = require('ansi-colors');

class Result {

    constructor() {
    }

    draw() {
        if (this.stack.length <= 0) return;

        const sizeName = 40;
        const sizeLine = 90;

        let task;
        let line;
        let size;
        let prefix;
        let suffix;
        let ruler;
        let color;
        let space;

        const arrow = x => ansi.yellowBright(x);

        for (const execution of this.stack) {

            if (!task || task.name != execution.task.name || task.number != execution.task.number) {
                if (line) {
                    console.log(line);
                }
                line = '';
                size = 0;
                task = execution.task;
                const title = task.name ? task.name : '' + task.number;
                if (ruler) {
                    console.log();
                } else {
                    ruler = true;
                }
                color = x => ansi.bgBlackBright(ansi.whiteBright(x));
                console.log(`       ${color(' +' + '-'.repeat(2 + title.length) + '+ ')}`);
                console.log(`       ${color(' | ' + title + ' | ')} `);
                console.log(`       ${color(' +' + '-'.repeat(2 + title.length) + '+ ')}`);
                console.log();
            }

            if (!execution.step) {
                continue;
            }

            const step = execution.step;
            let display = '' + (step.name ? (Array.isArray(step.name) ? (step.name[0] ? step.name[0] : step.index + 1) : step.name) : step.index + 1);
            if (display.length > sizeName) display = display.substring(0, sizeName - 3) + '...';
            if (step.name === '') display = '';

            let operation = step.info?.type;
            if (!operation) operation = '';
            operation = operation.toLowerCase();
            switch (operation) {
                case '<>':
                case 'condition':
                    prefix = '<<';
                    suffix = '>>';
                    color = x => ansi.bgMagenta(ansi.white(x));
                    break;
                case '()':
                    prefix = '((';
                    suffix = '))';
                    color = x => ansi.bgYellow(ansi.black(x));
                    break;
                case '{}':
                case 'operation':
                    prefix = '{}';
                    suffix = '{}';
                    color = x => ansi.bgGreen(ansi.black(x));
                    break;
                case '::':
                case 'internal':
                    prefix = '::';
                    suffix = '::';
                    color = x => ansi.bgBlackBright(ansi.white(x));
                    break;
                case '!!':
                    prefix = '!!';
                    suffix = '!!';
                    color = x => ansi.bgRed(ansi.white(x));
                    break;
                case '..':
                    prefix = '..';
                    suffix = '..';
                    color = x => ansi.bgYellow(ansi.black(x));
                    break;
                case 'event':
                    prefix = '((';
                    suffix = '))';
                    color = x => ansi.bgYellow(ansi.black(x));
                    if (display === '') display = 'EVENT';
                    break;
                case 'start':
                    prefix = '((';
                    suffix = '))';
                    color = x => ansi.bgGreen(ansi.black(x));
                    if (display === '') display = 'START';
                    break;
                case 'stop':
                    prefix = '((';
                    suffix = '))';
                    color = x => ansi.bgRed(ansi.black(x));
                    if (display === '') display = 'STOP';
                    break;
                case '[]':
                case 'block':
                default:
                    prefix = '[[';
                    suffix = ']]';
                    color = x => ansi.bgBlue(ansi.white(x));
                    break;
            }

            if (step.error) {
                prefix = '!!';
                suffix = '!!';
                color = x => ansi.bgRed(ansi.white(x));
            }

            if (display === '') display = ' ';

            if (line) {
                if (size > sizeLine) {
                    line += `  ${arrow('--+')}`;
                    size += 5;
                    console.log(line);
                    line = `  ${' '.repeat(size - 3)}${arrow('|')}`;
                    console.log(line);
                    line = `  ${arrow('+' + '-'.repeat(size - 4) + '+')}`;
                    console.log(line);
                    line = `  ${arrow('|')}`;
                    console.log(line);
                    line = '';
                    size = 0;
                    line += `  ${arrow('+->')}  `;
                    size += 7;
                } else {
                    line += `  ${arrow('-->')}  `;
                    // arrow = arrow === arrow1 ? arrow2 : arrow1;
                    size += 7;
                }
            } else {
                space = '       ';
                line += space;
                size += space.length;
            }
            line += color(' ' + prefix + ' ' + display + ' ' + suffix + ' ');
            size += 4 + prefix.length + display.length + suffix.length;
        }
        if (line) {
            console.log(line);
        }
        console.log();
    }

    print(config) {
        const utils = require('./utils');
        const ansi = require('ansi-colors');

        const sizeName = config?.sizeName ?? 0 + process.env.SIZE_STEP_NAME > 0 ? process.env.SIZE_STEP_NAME : 40;
        const sizeResult = 80;
        const includeStart = config?.includeStart ?? utils.stringToBoolean(process.env.HIDE_START_TIME) ? false : true;
        const hideStepName = utils.stringToBoolean(config?.hideStepName != undefined ? config?.hideStepName : process.env.HIDE_STEP_NAME);
        const hideStepError = utils.stringToBoolean(config?.hideStepError != undefined ? config?.hideStepResult : process.env.HIDE_STEP_ERROR);
        const hideStepResult = utils.stringToBoolean(config?.hideStepResult != undefined ? config?.hideStepResult : process.env.HIDE_STEP_RESULT);

        let printRuler = false;
        if (this.stack.length <= 0) return;
        let task;
        for (const execution of this.stack) {
            let time = `${('' + execution.time.minutes).padStart(2, '0')}:${('' + execution.time.seconds).padStart(2, '0')}.${('' + execution.time.milliseconds).padStart(3, '0')}`
            if (time === '00:00.000') time = '         ';
            if (!task || task.name != execution.task.name || task.number != execution.task.number) {
                task = execution.task;
                let s = '';
                s += '---- | --- |';
                if (includeStart) s += ' ------------ |'
                s += ' --------- |';
                if (printRuler) console.log(s);
                let t = '';
                t += `${ansi.blueBright('TASK')}`;
                t += ` | ${(task.number == null ? '' : '' + task.number).padStart(3, ' ')}`;
                if (includeStart) t += ` | ${''.padStart(12, ' ')}`;
                t += ` | ${''.padStart(9, ' ')} | ${task.name}`;
                console.log(t);
                console.log(s);
                printRuler = true;
            }
            if (execution.step) {
                const step = execution.step;
                let name = '' + (step.name ? (Array.isArray(step.name) ? (step.name[0] ? step.name[0] : '') : step.name) : '');
                if (execution.error || execution.result) {
                    name = name.padEnd(sizeName, ' ');
                }
                if (name.length > sizeName) name = name.substring(0, sizeName - 3) + '...';
                if (hideStepName) name = '';
                let result;
                let color;
                if (execution.error && !hideStepError) {
                    color = ansi.redBright;
                    result = execution.error.replace(/\s+/g, ' ').trim();
                } else if (execution.result && !hideStepResult) {
                    color = ansi.greenBright;
                    result = execution.result;
                    if (Array.isArray(result)) result = result.join('\n');
                    result = result.replace(/\s+/g, ' ');
                    result = result.trim();
                }
                if (result) {
                    if (result.length > sizeResult) result = '...' + result.slice(3 - sizeResult);
                    if (!hideStepName) name += ' | ';
                    name += color(result);
                }
                let s = '';
                s += `${ansi.magentaBright('STEP')}`;
                s += ` | ${(step.index == null ? '' : '' + (step.index + 1)).padStart(3, ' ')}`;
                if (includeStart) {
                    let start = step.start ?? '';
                    if (start instanceof Date) start = utils.getTimeString(start);
                    if (start.length >= 23) start = start.substring(11, 11 + 12);
                    s += ` | ${ansi.whiteBright(start.padStart(12, ' '))}`
                }
                s += ` | ${ansi.cyanBright(time)} | ${name}`;
                console.log(s);
            }
        }
        console.log();
    }

}

module.exports = {
    Result
};
