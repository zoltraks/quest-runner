
const host = process.env.HOST || '8.8.8.8';

task('Ping Verification', () => {

    step('Perform Ping', x => {
        x.result(`Pinging ${host}...`);
        const result = x.expectAlive(host);
        if (result.alive) {
            x.result(`Success: ${host} is alive (time=${result.time}ms)`);
        } else {
            x.result(`Failure: ${host} is unreachable`);
        }
    });

});
