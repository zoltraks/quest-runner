#!/usr/bin/env node

async function main() {
    const fs = require('fs').promises;
    try {
        let command = (process.argv[2] ?? '').toLowerCase();
        let name;
        switch (command.toLowerCase()) {
            case '':
                command = 'run';
                break;
            case 'run':
                name = process.argv[3];
                break;
            default:
                throw Error(`Unknown command ${command}`);
        }
        if (command === 'run') {
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
                console.error('No script found. Go and create file that name ends with ".quest.js".');
                return;
            }
            let exists = false;
            for (const suffix of ['', '.quest.js']) {
                try {
                    await fs.access(file + suffix);
                    file += suffix;
                    exists = true;
                    break;
                } catch { continue; }
            };
            if (!exists) {
                console.error(`Script not found ${file}`);
                return;
            }
            const code = '' + await fs.readFile(file);
            const { task, step, play } = require('./index.js');
            eval(code);
            const result = await play();
            if (result != undefined) {
                result.draw();
                result.print();
            }
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

main();

