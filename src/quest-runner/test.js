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

    timeout;

    insecure;

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
            for (const field in argument) {
                if (!argument.hasOwnProperty(field)) continue;
                const search = field.toLowerCase();
                const key = Object.keys(dictionary).find(key => key?.toLowerCase() === search);
                if (key != undefined) delete dictionary[key];
                dictionary[field] = argument[field];
            }
        }
        for (const field in dictionary) {
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

    setTimeout(timeout) {
        this.timeout = timeout;
    }

    getTimeout() {
        return this.timeout;
    }

    acceptSelfSignedCertificate(value) {
        if (value === false) {
            this.options = { ...this.options, insecure: false };
        } else {
            this.options = { ...this.options, insecure: true };
        }
    }

    createAgent(options) {
        const forceInsecure = ['1', 'TRUE', 'YES'].indexOf((process.env.INSECURE ?? '').toUpperCase()) >= 0;
        options = options == undefined ? {} : { ...options };
        if (this.options) options = { ...this.options, ...options };
        if (forceInsecure || options.insecure === true) options.rejectUnauthorized = false;
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
                break;
            case 'http':
                const http = require('http');
                agent = new http.Agent(options);
                break;
        }
        return agent;
    }

    call(method, url, payload, headers, options) {
        const utils = require('./utils.js');
        const request = {};
        const response = {};
        const summary = {};
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

        const result = this.execute({
            method,
            url,
            headers,
            body,
            options: {
                timeout: options?.timeout ?? this.options?.timeout ?? this.timeout,
                insecure: options?.insecure ?? this.options?.insecure ?? this.insecure,
            },
        });

        this.response = result.response;
        this.summary = result.summary;
        Object.assign(response, result.response);

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

    pause(options) {
        if (typeof options === 'string') options = { text: options };
        const { spawnSync } = require('child_process');
        const path = require('path');
        const helperPath = path.join(__dirname, 'pause.js');

        const config = {
            text: options?.text,
            time: options?.time,
        };

        spawnSync('node', [helperPath, JSON.stringify(config)], {
            stdio: 'inherit',
            windowsHide: true,
        });

        if (options?.text != undefined) {
            console.log();
        }
    }

    execute(request) {
        const { method, url, headers, body, options } = request;
        const { spawnSync } = require('child_process');
        const path = require('path');

        const response = {
            url,
            method,
            headers: {},
            data: null,
            status: 0,
        };

        const summary = {
            url,
            method,
            request: body,
            response: null,
            status: 0,
        };

        const result = { response, summary };

        let start;
        let taken;

        try {
            const config = {
                method,
                url,
                headers,
                body,
                timeout: options?.timeout,
                insecure: options?.insecure,
            };

            const forceInsecure = ['1', 'TRUE', 'YES'].indexOf((process.env.INSECURE ?? '').toUpperCase()) >= 0;
            if (forceInsecure && config.insecure == undefined) {
                config.insecure = true;
            }

            const helperPath = path.join(__dirname, 'request.js');

            start = performance.now();
            const proc = spawnSync('node', [helperPath, JSON.stringify(config)], {
                encoding: 'utf8',
                timeout: options?.timeout || 30000,
                windowsHide: true,
            });
            taken = performance.now() - start;

            if (proc.error) {
                throw proc.error;
            }

            if (proc.stdout) {
                try {
                    const httpResult = JSON.parse(proc.stdout.trim());

                    response.status = httpResult.status;
                    response.headers = httpResult.headers || {};
                    response.data = httpResult.data;

                    if (httpResult.error) {
                        response.error = httpResult.error;
                    }

                    // Parse JSON if applicable
                    if (typeof response.data === 'string' && !httpResult.error) {
                        const regex = /^\s*(?:\[.*\]|\{.*\})\s*$/s;
                        if (regex.test(response.data)) {
                            try {
                                response.data = JSON.parse(response.data);
                            } catch (err) {
                                if (!(err instanceof SyntaxError)) {
                                    throw err;
                                }
                            }
                        }
                    }

                    if (taken != undefined && taken > 0) {
                        summary.time = Math.ceil(taken);
                    }

                    summary.response = response.data;
                    summary.status = response.status;

                    if (response.error && options?.ignore !== true) {
                        throw new Error(response.error);
                    }

                } catch (parseError) {
                    const error = new Error(`Failed to parse HTTP response: ${parseError.message}`);
                    this.handleError(error, response, summary);
                }
            } else {
                const error = new Error('No response from HTTP helper');
                this.handleError(error, response, summary);
            }

        } catch (error) {
            this.handleError(error, response, summary);
        }

        return result;
    }

    handleError(error, response, summary) {
        response.error = '';
        if (error.message) {
            response.error = error.message;
        }
        if (error.stderr) {
            response.error = error.stderr.toString().trim() || response.error;
        }
        let print = response.error;
        if (print) {
            print = 'ERROR ' + print;
            console.error(print);
            console.log();
            const debug = utils.stringToBoolean(process.env.DEBUG);
            if (debug && error.stack) {
                console.error(error.stack);
                console.log();
            }
        }
        summary.error = response.error;
    }
}

module.exports = {
    Test,
};
