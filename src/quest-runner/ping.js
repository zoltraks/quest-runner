const ping = require('ping');

const args = process.argv.slice(2);
const config = JSON.parse(args[0]);
const host = config.host;
const options = config.options || {};

(async () => {
    try {
        const res = await ping.promise.probe(host, {
            timeout: options.timeout ?? 5,
            extra: process.platform === 'win32' ? ['-n', '1'] : ['-c', '1'],
        });
        console.log(JSON.stringify(res));
    } catch (error) {
        console.error(JSON.stringify({
            alive: false,
            output: error.message || 'Ping failed',
        }));
    }
})();
