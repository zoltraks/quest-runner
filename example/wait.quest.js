task('Wait Verification', () => {

    step('Before', x => {
        x.result('Preparing to wait for 2 seconds...');
    });

    step('Wait', x => {
        x.wait(2000);
    });

    step('After', x => {
        x.result('This message should be visible after 2 seconds.');
    });

});
