const { execSync } = require('child_process');
const ansi = require('ansi-colors');
const utils = require('./utils.js');

class HttpClient {

    execute(request) {
        const { method, url, headers, body, options } = request;
        const response = {
            url,
            method,
            headers: {},
            data: null,
            status: 0
        };

        const summary = {
            url,
            method,
            request: body,
            response: null,
            status: 0
        };

        const result = { response, summary };

        let start;
        let taken;

        try {
            const args = ['curl', '-s', '-i', '-X', method];

            if (options?.timeout != undefined) {
                args.push('--max-time', Math.ceil(options.timeout / 1000).toString());
            }

            for (const header in headers) {
                if (headers[header] != undefined) {
                    args.push('-H', `${header}: ${headers[header]}`);
                }
            }

            if (body != undefined) {
                args.push('-d', body);
            }

            // Allow self-signed certificates
            const allow = ['1', 'TRUE', 'YES'].indexOf((process.env.INSECURE ?? '').toUpperCase()) >= 0;
            if (allow || options?.rejectUnauthorized === false) {
                args.push('-k');
            }

            args.push(url);

            start = performance.now();
            const output = execSync(args.join(' '), {
                encoding: 'utf8',
                maxBuffer: 50 * 1024 * 1024,
                windowsHide: true,
                shell: true
            });
            taken = performance.now() - start;

            this.parseOutput(output, response);

            if (taken != undefined && taken > 0) {
                summary.time = Math.ceil(taken);
            }

            summary.response = response.data;
            summary.status = response.status;

        } catch (error) {
            this.handleError(error, response, summary);
        }

        return result;
    }

    parseOutput(output, response) {
        const parts = output.split(/\r?\n\r?\n/);
        const headerLines = parts[0].split(/\r?\n/);
        const bodyText = parts.slice(1).join('\n\n');

        const statusMatch = headerLines[0].match(/HTTP\/[\d.]+ (\d+)/);
        response.status = statusMatch ? parseInt(statusMatch[1], 10) : 0;

        response.headers = {};
        for (let i = 1; i < headerLines.length; i++) {
            const colonIndex = headerLines[i].indexOf(':');
            if (colonIndex > 0) {
                const key = headerLines[i].substring(0, colonIndex).trim();
                const value = headerLines[i].substring(colonIndex + 1).trim();
                response.headers[key.toLowerCase()] = value;
            }
        }

        response.data = bodyText;

        // Parse JSON response if applicable
        if (typeof response.data === 'string') {
            const regex = /^\s*(?:\[.*\]|\{.*\})\s*$/s;
            if (regex.test(response.data)) {
                try {
                    const o = JSON.parse(response.data);
                    response.data = o;
                } catch (err) {
                    if (!(err instanceof SyntaxError)) {
                        throw err;
                    }
                }
            }
        }
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

module.exports = new HttpClient;
