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
        const { execSync } = require('child_process');
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

        try {
            // Use ping command synchronously
            const isWindows = process.platform === 'win32';
            let cmd;
            if (isWindows) {
                cmd = `ping -n 1 -w ${timeout * 1000} ${host}`;
            } else {
                cmd = `ping -c 1 -W ${timeout} ${host}`;
            }

            const output = execSync(cmd, {
                encoding: 'utf8',
                timeout: (timeout + 2) * 1000,
                windowsHide: true
            });

            result.alive = true;
            result.output = output.replace(/\s+/g, ' ').trim();

            // Try to extract IP address
            const ipMatch = output.match(/\[?([\d.]+)\]?/);
            if (ipMatch) result.address = ipMatch[1];

            // Try to extract time
            const timeMatch = output.match(/time[=<](\d+)/i);
            if (timeMatch) result.time = parseInt(timeMatch[1], 10);
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
