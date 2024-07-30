const yargs = require('yargs/yargs')
const argv = yargs(process.argv.slice(2))
    .boolean('version')
    .boolean('help')
    .boolean('verbose')
    .boolean('silent')
    .alias('V', 'version')
    .alias('?', 'help')
    .alias('v', 'verbose')
    .alias('s', 'silent')
    .describe('verbose', 'Verbose mode')
    .describe('silent', 'Silent mode')
    .parse();
module.exports = argv;
