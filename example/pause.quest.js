
task('Pause Verification', () => {

    step('Perform Pause', x => {
        x.result('Before pause...');
        x.pause('Please press ENTER to continue...');
        x.result('After pause...');
    });

});
