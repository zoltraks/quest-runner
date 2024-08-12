const ansi = require('ansi-colors');

const utils = require('./utils.js');

const { Expect } = require('./expect.js');

class Test extends Expect {

    constructor() {
        super();
        this.setHeader('Accept', 'application/json, text/plain, */*');
        this.setHeader('User-Agent', 'quest-runner/1.0');
        this.setHeader('Accept-Encoding', 'gzip, compress, deflate, br');
        this.setProtocol('https');
        if (process.env.BASE_URL) this.base = process.env.BASE_URL;
    }

    running = true;

    base;

    headers = {};

    queue = [];

    parameters = {};

    pretty = false;

    request;

    response;

    summary;

    options = {};

    utils;

    protocol;

    setBase(base) {
        this.base = base;
        const value = base ? base : 'empty value';
        console.log(`Base address set to ${ansi.yellow(value)}`);
        console.log();
    }

    getBase() {
        return this.base;
    }

    setPretty(pretty) {
        this.pretty = pretty;
    }

    getPretty() {
        return this.pretty;
    }

    setHeader(header, value) {
        if (this.headers == undefined) this.headers = {};
        const search = header.toLowerCase();
        const key = Object.keys(this.headers).find(key => key?.toLowerCase() === search);
        if (key) {
            if (value === null || value === undefined) {
                delete this.headers[key];
            } else {
                this.headers[key] = value;
            }
        } else {
            if (value !== null && value !== undefined) {
                this.headers[header] = value;
            }
        }
    }

    getHeader(header) {
        const search = header.toLowerCase();
        const key = Object.keys(this.headers).find(key => key?.toLowerCase() === search);
        return '' + (this.headers[key] ?? '');
    }

    hasHeader(header) {
        const search = header.toLowerCase();
        const key = Object.keys(this.headers).find(key => key?.toLowerCase() === search);
        return key != undefined;
    }

    getHeaders() {
        return this.headers;
    }

    mergeHeaders() {
        const dictionary = this.headers ?? {};
        for (let i = 0; i < arguments.length; i++) {
            const argument = arguments[i];
            for (let field in argument) {
                if (!argument.hasOwnProperty(field)) continue;
                const search = field.toLowerCase();
                const key = Object.keys(dictionary).find(key => key?.toLowerCase() === search);
                if (key != undefined) delete dictionary[key];
                dictionary[field] = argument[field];
            }
        }
        for (let field in dictionary) {
            if (!dictionary.hasOwnProperty(field)) continue;
            if (dictionary[field] == undefined) delete dictionary[field];
        }
        return dictionary;
    }

    getContentType() {
        return this.getHeader('Content-Type');
    }

    setContentType(type) {
        this.setHeader('Content-Type', type);
    }

    getParameter(name) {
        if (name == undefined) return;
        if (this.parameters == undefined) return undefined;
        const search = name.toLowerCase();
        const key = Object.keys(this.parameters).find(name => name.toLowerCase() === search);
        return key == undefined ? undefined : this.parameters[key];

    }

    setParameter(name, value) {
        if (name == undefined) return;
        if (this.parameters == undefined) this.parameters = {};
        const search = name.toLowerCase();
        let key = Object.keys(this.parameters).find(name => name.toLowerCase() === search);
        if (value == undefined) {
            if (key != undefined) delete this.parameters[key];
        } else {
            if (key == undefined) key = name;
            this.parameters[key] = value;
        }
    }

    setProtocol(value) {
        this.protocol = value;
    }

    getRequest() {
        if (this.request == undefined) return this.request;
        return JSON.parse(JSON.stringify(this.request));
    }

    getResponse() {
        if (this.response == undefined) return this.response;
        return JSON.parse(JSON.stringify(this.response));
    }

    getSummary() {
        if (this.summary == undefined) return this.summary;
        return JSON.parse(JSON.stringify(this.summary));
    }

    getRandomInteger(min, max) {
        return utils.getRandomInteger(min, max);
    }

    limit(value, length = 100, suffix = '...') {
        return utils.stringLimit(value, length, suffix);
    }

    setOptions(options) {
        this.options = options;
    }

    result(o) {
        if (o == undefined) return;
        else if (typeof o === 'object') o = JSON.stringify(o, null, 4);
        else if (typeof o === 'string') o = o.trim();
        else if (typeof o !== 'string') o = ('' + o).trim();
        if (o.length == 0) return;
        if (!this.output) {
            this.output = o;
        } else {
            if (!Array.isArray(this.output)) {
                this.output = [this.output];
            }
            this.output.push(o);
        }
        console.log(o);
        console.log();
    }

    print(o) {
        if (o == undefined) return;
        else if (typeof o === 'object') o = JSON.stringify(o, null, 4);
        else if (typeof o === 'string') o = o.trim();
        else if (typeof o !== 'string') o = ('' + o).trim();
        if (o.length == 0) return;
        console.log(o);
        console.log();
    }

    time(options) {
        const ansi = require('ansi-colors');
        const utils = require('./utils.js');
        const value = utils.getTimeString(new Date());
        if (options?.silent !== true) {
            console.log(`${ansi.greenBright('TIME')} ${ansi.whiteBright(value.substring(11))}`);
            console.log();
        }
        return value;
    }

    sanitize(s) {
        if (s == undefined) return s;
        if (typeof s === 'object') {
            s = JSON.stringify(s, null, 4);
        }
        if (typeof s !== 'string') {
            s = '' + s;
        }
        if (s.length < 10) {
            s = s.replace(/./g, '.');
        } else if (s.length < 100) {
            s = s.substring(0, 2) + s.substring(2, s.length - 2).replace(/./g, '.') + s.substring(s.length - 2);
        } else {
            s = s.substring(0, 4) + s.substring(4, s.length - 4).replace(/./g, '.') + s.substring(s.length - 4);
        }
        return s;
    }

    squeeze(array, limit = 10, separator = '...') {
        return utils.squeeze(array, limit, separator);
    }

    timeout;

    setTimeout(timeout) {
        this.timeout = timeout;
    }

    getTimeout() {
        return this.timeout;
    }

    acceptSelfSignedCertificate(value = true) {
        this.options = { ...this.options, rejectUnauthorized: false };
    }

    createAgent(options) {
        const allow = ['1', 'ALLOW'].indexOf((process.env.SELF_SIGNED_CERTIFICATE ?? '').toUpperCase()) >= 0;
        options = options == undefined ? {} : { ...options };
        if (this.options) options = { ...this.options, ...options };
        if (options.rejectUnauthorized == undefined && allow) options.rejectUnauthorized = false;
        let protocol = 'https';
        if (options.protocol === '') throw Error('Unknown protocol');
        if (options.protocol != undefined) {
            if (['http', 'https'].indexOf(options.protocol.toLowerCase()) < 0) {
                throw Error(`Unsupported protocol ${options.protocol}`);
            }
            protocol = options.protocol.toLowerCase();
            delete options.protocol;
        }
        if (options.timeout == undefined && this.timeout != undefined) options.timeout = this.timeout;
        let agent;
        switch (protocol) {
            case 'https':
                const https = require('https');
                agent = new https.Agent(options);
                break
            case 'http':
                const http = require('http');
                agent = new http.Agent(options);
                break;
        }
        return agent;
    }

    async call(method, url, payload, headers, options) {
        const utils = require('./utils.js');
        let request = {};
        let response = {};
        let summary = {};
        url = '' + (url ?? '');
        if (url === '') throw Error('Empty endpoint address');
        if (utils.getProtocol(url) === '') {
            let base = this.getBase() ?? '';
            if (base && !base.endsWith('/') && !url.startsWith('/')) {
                base += '/';
            }
            url = base + url;
        }
        let protocol = utils.getProtocol(url);
        if (protocol === '' && this.protocol != undefined) {
            url = this.protocol + '://' + url;
            protocol = utils.getProtocol(url);
        }
        if (protocol === '') throw Error(`Unknown protocol in ${url}`);
        method = method.toUpperCase();
        let body = payload;
        let contentType;
        if (body != undefined) {
            if (typeof body === 'boolean') {
                body = undefined;
            } else if (typeof body === 'number') {
                body = '' + body;
            } else if (typeof body === 'string') {
                contentType = 'text/plain';
            } else if (typeof body !== 'string') {
                contentType = 'application/json';
                if (this.pretty) {
                    body = JSON.stringify(body, null, 4);
                } else {
                    body = JSON.stringify(body);
                }
            }
        }

        headers = this.mergeHeaders({ 'Content-Type': contentType }, headers);

        request.url = url;
        request.method = method;
        request.headers = headers;
        request.payload = payload;

        this.request = request;

        response.url = url;
        response.method = method;
        response.request = { headers, payload };

        summary.url = url;
        summary.method = method;
        if (payload) summary.request = payload;

        let agent;
        let start;
        let taken;

        try {
            if (options != undefined && options.agent) {
                agent = options.agent;
            } else {
                agent = this.createAgent({
                    protocol,
                    ...options
                });
            }

            if (options?.silent !== true) {
                let anonymous = true;
                for (const header in request.headers) {
                    if (header.toLowerCase() === 'authorization') {
                        anonymous = false;
                        break;
                    }
                }
                if (anonymous) {
                    console.log(`${ansi.greenBright('CALL')} ${ansi.blueBright(method)} ${ansi.yellowBright(url)}`);
                } else {
                    console.log(`${ansi.magentaBright('CALL')} ${ansi.cyanBright(method)} ${ansi.yellowBright(url)}`);
                }
                console.log();
            }

            let result;

            if (options != undefined && options.axios != undefined && !options.axios) {
                const init = { method: request.method, headers: request.headers };
                if (agent != undefined) init.agent = agent;
                if (body != undefined) init.body = body;
                start = performance.now();
                result = await fetch(url, init);
                taken = performance.now() - start;
                if (result.headers) {
                    response.headers = {};
                    result.headers.forEach((value, key) => {
                        response.headers[key] = value;
                    });
                }
            } else {
                const timeout = options?.timeout ?? this.timeout;
                let config = { url, method, headers };
                if (body != undefined) config.data = body;
                if (agent != undefined) config.httpsAgent = agent;
                if (timeout != undefined) config.timeout = timeout;
                const axios = require('axios');
                axios.defaults.validateStatus = () => true;
                start = performance.now();
                result = await axios(config);
                taken = performance.now() - start;
                response.headers = {};
                for (const header in result.headers) {
                    response.headers[header] = result.headers[header];
                }
            }

            if (result.data != undefined) {
                response.data = result.data;
            } else {
                response.data = await result.text();
            }

            if (typeof response.data === 'string') {
                const regex = /^\s*(?:\[.*\]|\{.*\})\s*$/s;
                if (regex.test(response.data)) {
                    try {
                        const o = JSON.parse(response.data);
                        response.data = o;
                    } catch (err) {
                        if (err instanceof SyntaxError) {
                        } else {
                            throw err;
                        }
                    }
                }
            }

            if (taken != undefined && taken > 0) {
                summary.time = Math.ceil(taken);
            }

            summary.response = response.data;
            summary.status = result.status;

            response.status = result.status;
        } catch (error) {
            response.error = '';
            if (error.cause) {
                response.error = '' + error.cause.message;
            }
            if (response.error === '' && Array.isArray(error.errors)) {
                response.error = error.errors[error.errors.length - 1].message;
            }
            if (response.error === '') {
                response.error = error.message;
            }
            let print = response.error;
            if (print) {
                print = 'ERROR ' + print;
                console.error(print);
                console.log();
                const debug = utils.stringToBoolean(process.env.DEBUG);
                if (error.name === 'AggregateError') {
                } else {
                    if (debug && error.stack) {
                        console.error(error.stack);
                        console.log();
                    }
                }
            }
        }

        if (response.error != undefined) summary.error = response.error;

        this.response = response;
        this.summary = summary;

        if (response.error != undefined && options?.ignore !== true) {
            throw Error(response.error);
        }

        return response;
    }

    next(condition, step) {
        if (step === undefined) {
            step = condition;
            condition = undefined;
        }
        if (condition === false) return;
        this.queue.push(step);
    }

    stop(opts) {
        let quiet = false;
        if (typeof opts === 'boolean') {
            quiet = opts;
        } else if (typeof opts === 'object') {
            if (opts.quiet != undefined) quiet = !!opts.quiet;
        }
        const isNotEmptyString = typeof quiet === 'string' && quiet.length > 0;
        if (isNotEmptyString) {
            this.result(quiet);
        }
        if (this.running) {
            if (quiet !== true) {
                if (isNotEmptyString) {
                    console.log(`${ansi.redBright('STOP')} ${ansi.yellowBright(quiet)}`);
                } else {
                    console.log(`${ansi.redBright('STOP')}`);
                }
                console.log();
            }
        }
        this.running = false;
    }

    wait(ms) {
        if (0 + ms < 1) ms = 1000;
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async pause(options) {
        if (typeof options === 'string') options = { text: options };
        const ansi = require('ansi-colors');
        const readline = require('node:readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const time = (0 + options?.time) * 1000;
        let question = options?.text;
        if (question === undefined) question = '' +
            ansi.whiteBright('Press ') +
            ansi.greenBright('Enter ') +
            ansi.whiteBright('to continue... ');
        if (question != undefined && 0 === ('' + question).trim().length) question = undefined;
        let enter = false;
        process.stdin.resume();
        try {
            await new Promise(resolve => {
                const ac = new AbortController();
                const signal = ac.signal;
                signal.addEventListener('abort', () => {
                    if (!enter) resolve();
                }, { once: true });
                rl.question(question ?? '', { signal }, async _answer => {
                    enter = true;
                    resolve();
                });
                if (time > 0) setTimeout(() => ac.abort(), time);
            });
            await new Promise(resolve => {
                readline.moveCursor(process.stdout, 0, -1, () => {
                    readline.clearLine(process.stdout, 1, () => {
                        resolve();
                    });
                });
            });
        } catch (error) {
        } finally {
            process.stdin.pause();
            if (enter === true && question != undefined) {
                console.log();
            }
        }
    }
}

module.exports = {
    Test
};
