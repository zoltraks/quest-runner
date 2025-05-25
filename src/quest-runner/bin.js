#!/usr/bin/env node

async function main() {
    const argv = require('./line.js');

    if (argv.version) {
        const package = require('./package.json');
        console.log(package.version);
        process.exit(0);
    }

    if (argv.help) {
        require('yargs/yargs').showHelp();
        process.exit(0);
    }

    const fs = require('fs').promises;
    const rest = argv._;
    try {
        let command = (rest[0] ?? '').toLowerCase();
        let name = process.argv[3];
        switch (command.toLowerCase()) {
            case '':
                command = '';
            case 'play':
            case 'list':
                break;
            default:
                throw Error(`Unknown command ${command}`);
        }
        const file = await locateScriptFile(name);
        const exists = await fileExists(file);
        if (!exists) return;
        if (command == undefined) {
        } else if (command === 'play' || command === 'list') {
            argv.file = file;
            const code = '' + await fs.readFile(file);
            const { task, step, play, mode } = require('./index.js');
            if ((argv.task || []).length > 0) mode.task = argv.task;
            if ((argv.skip || []).length > 0) mode.skip = argv.skip;
            if (command === 'list') argv.operation = 'list';
            eval(code);
            const result = await play(argv ?? {});
            if (result != undefined) {
                result.draw();
                result.print();
            }
        } else if (command === 'list') {
            argv.file = file;
            process.env.MODE = 'list';
        }
    }
    catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

function isDirectory(path) {
    const fs = require('fs');
    try {
        const stats = fs.statSync(path);
        return stats.isDirectory();
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
}

async function fileExists(file) {
    const fs = require('fs').promises;
    try {
        await fs.access(file, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
}

async function locateScriptFile(name) {
    const fs = require('fs').promises;
    let file;
    if (name != undefined) {
        for (const e of [name, name + '.quest.js']) {
            try {
                await fs.access(e);
                file = e;
                break;
            }
            catch { }
        }
    }
    if (file == undefined) {
        const path = require('path');
        for (const sub of ['', 'quest', 'test', '../quest', '../test']) {
            const dir = 0 < sub.length ? path.join(process.cwd(), sub) : process.cwd();
            if (!isDirectory(dir)) continue;
            const all = await fs.readdir(dir);
            let files = all.filter(path => {
                if (name != undefined && !path.startsWith(name)) return false;
                return path.endsWith('.quest.js');
            });
            if (files.length > 0) {
                files.sort();
                file = path.join(dir, files[0]);
            }
            if (file != undefined) break;
        }
    }
    if (file == undefined) {
        console.error('No script found. \nGo and create file that name ends with ".quest.js".');
        return;
    }
    let exists = false;
    for (const suffix of ['', '.quest.js']) {
        try {
            await fs.access(file + suffix);
            file += suffix;
            exists = true;
            break;
        }
        catch { }
    };
    if (!exists) {
        console.error(`Script not found ${file}`);
        return;
    }
    return file;
}

main();
