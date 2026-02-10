
const utils = require('./utils.js');

class HttpClient {

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

module.exports = new HttpClient;
