#!/usr/bin/env node

async function main() {
    try {
        let file;
        let command = (process.argv[2] ?? '').toLowerCase();
        switch (command.toLowerCase()) {
            case '':
                command = 'run';
                break;
            case 'run':
                file = process.argv[3];
                break;
            default:
                throw Error(`Unknown command ${command}`);
        }

        if (command === 'run') {
            const fs = require('fs').promises;
            if (!file) {
                const currentDir = process.cwd();
                const allFiles = await fs.readdir(currentDir);
                const filteredFiles = allFiles.filter(name => name.endsWith('.quest.js'));
                file = filteredFiles[0];
            }
            if (!file) {
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

main();

