const { Assert, AssertionError } = require('./assert.js');

class Expect extends Assert {

    async expectAny(many = [], message) {
        if (many == undefined) return;
        if (typeof many !== 'object' || !Array.isArray(many)) many = [many];
        let success = false;
        for (const every of many) {
            try {
                const result = every(this);
                if (result instanceof Promise) await result;
                success = true;
            } catch (error) {
                if (error instanceof AssertionError) {
                    continue;
                }
                throw error;
            }
        }
        if (!success) {
            if (!message) message = 'Expect any failed'
            this.assert(message);
        }
    };

    async expectAll(many = [], message) {
        if (many == undefined) return;
        if (typeof many !== 'object' || !Array.isArray(many)) many = [many];
        let fail = false;
        for (const every of many) {
            try {
                const result = every(this);
                if (result instanceof Promise) await result;
            } catch (error) {
                fail = true;
                if (error instanceof AssertionError) {
                    continue;
                }
                throw error;
            }
        }
        if (fail) {
            if (!message) message = 'Expect all failed'
            this.assert(message);
        }
    };

    async expectAlive(host, config, message) {
        const ansi = require('ansi-colors');
        if (host == undefined || typeof (host) !== 'string' || !(host = host.trim()).length) return;
        if (config != undefined && message == undefined && typeof (config) === 'string') {
            message = config;
            config = undefined;
        }
        const ping = require('ping');
        if (config == undefined || typeof (config) !== 'object') config = {};
        const print = !!config.print;
        config = {
            timeout: 5,
            ...config,
            print: undefined
        };
        let result = await ping.promise.probe(host, config);
        if (result) {
            if (result.times && Array.isArray(result.times) && !result.times.length) delete result.times;
            if (result.time === 'unknown') delete result.time;
            delete result.times;
            delete result.min;
            delete result.max;
            delete result.avg;
            delete result.packetLoss;
            delete result.stddev;
            delete result.inputHost;
            if (result.numeric_host) result = { ...result, address: result.numeric_host, numeric_host: undefined };
            if (result.output) result.output = result.output.replace(/\s+/g, ' ').trim();
        }
        const fail = !result?.alive;
        if (print) {
            const json = JSON.stringify(result, null, 4);
            if (fail) console.error(json);
            else console.log(json);
            console.log();
        }
        if (fail) {
            if (!message) message = `Expected alive ${ansi.yellowBright(host)}` + ansi.magentaBright((' ' + result.output.trim()).trimEnd());
            this.assert(message);
        }
        return result;
    }

}

module.exports = {
    Expect,
};
