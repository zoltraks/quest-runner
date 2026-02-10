const https = require('https');
const http = require('http');

const args = process.argv.slice(2);
const config = JSON.parse(args[0]);

const { method, url, headers, body, timeout, insecure } = config;

const urlObj = new URL(url);
const isHttps = urlObj.protocol === 'https:';
const httpModule = isHttps ? https : http;

const requestOptions = {
    method,
    hostname: urlObj.hostname,
    port: urlObj.port || (isHttps ? 443 : 80),
    path: urlObj.pathname + urlObj.search,
    headers: headers || {},
    timeout: timeout,
    rejectUnauthorized: insecure === true ? false : true,
};

const chunks = [];
const req = httpModule.request(requestOptions, (res) => {
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
        const result = {
            status: res.statusCode,
            headers: res.headers,
            data: Buffer.concat(chunks).toString('utf8'),
        };
        console.log(JSON.stringify(result));
    });
});

req.on('error', (error) => {
    const result = {
        status: 0,
        headers: {},
        data: null,
        error: error.message,
    };
    console.log(JSON.stringify(result));
    process.exit(1);
});

req.on('timeout', () => {
    req.destroy();
    const result = {
        status: 0,
        headers: {},
        data: null,
        error: `timeout of ${timeout}ms exceeded`,
    };
    console.log(JSON.stringify(result));
    process.exit(1);
});

if (body) {
    req.write(body);
}

req.end();
