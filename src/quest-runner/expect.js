const { Assert, AssertionError } = require('./assert.js');

class Expect extends Assert {

    expectAny(many = [], message) {
        if (many == undefined) return;
        if (typeof many !== 'object' || !Array.isArray(many)) many = [many];
        let success = false;
        for (const every of many) {
            try {
                every(this);
                success = true;
            } catch (error) {
                if (error instanceof AssertionError) {
                    continue;
                }
                throw error;
            }
        }
        if (!success) {
            if (!message) message = 'Expect any failed';
            this.assert(message);
        }
    }

    expectAll(many = [], message) {
        if (many == undefined) return;
        if (typeof many !== 'object' || !Array.isArray(many)) many = [many];
        let fail = false;
        for (const every of many) {
            try {
                every(this);
            } catch (error) {
                fail = true;
                if (error instanceof AssertionError) {
                    continue;
                }
                throw error;
            }
        }
        if (fail) {
            if (!message) message = 'Expect all failed';
            this.assert(message);
        }
    }

    expectAlive(host, config, message) {
        const { spawnSync } = require('child_process');
        const path = require('path');
        const ansi = require('ansi-colors');

        if (host == undefined || typeof (host) !== 'string' || !(host = host.trim()).length) return;
        if (config != undefined && message == undefined && typeof (config) === 'string') {
            message = config;
            config = undefined;
        }
        if (config == undefined || typeof (config) !== 'object') config = {};
        const print = !!config.print;
        const timeout = config.timeout ?? 5;

        const result = { host, alive: false };

        const helperPath = path.join(__dirname, 'ping.js');
        const args = {
            host,
            options: {
                timeout,
            },
        };

        try {
            const proc = spawnSync('node', [helperPath, JSON.stringify(args)], {
                encoding: 'utf8',
                timeout: (timeout + 2) * 1000,
                windowsHide: true,
            });

            if (proc.error) {
                throw proc.error;
            }

            if (proc.stdout) {
                try {
                    const res = JSON.parse(proc.stdout.trim());
                    result.alive = res.alive;
                    result.output = res.output;
                    if (res.output === 'Ping failed' && !res.alive) {
                        result.output = proc.stdout.trim();
                    }
                    result.time = typeof res.time === 'number' ? Math.round(res.time) : undefined;
                    if (res.numeric_host) result.address = res.numeric_host;
                } catch (parseError) {
                    // If JSON parse fails, it might be raw error output or empty
                    result.output = proc.stdout.trim() || `Failed to parse ping response: ${parseError.message}`;
                }
            } else {
                result.output = proc.stderr ? proc.stderr.toString().trim() : 'No output from ping helper';
            }

        } catch (error) {
            result.alive = false;
            result.output = error.message || 'Ping failed';
        }

        const fail = !result.alive;
        if (print) {
            const json = JSON.stringify(result, null, 4);
            if (fail) console.error(json);
            else console.log(json);
            console.log();
        }
        if (fail) {
            if (!message) message = `Expected alive ${ansi.yellowBright(host)}` + ansi.magentaBright((' ' + (result.output || '')).trimEnd());
            this.assert(message);
        }
        return result;
    }

}

module.exports = {
    Expect,
};
