task(() => {

    step(async x => {
        await x.assertTrue(undefined == null);    // must be false
        await x.assertFalse(undefined === null);  // must be false
        await x.assertNull(undefined);            // undefined is null
        await x.result('Even when await is not needed it will still work');
    });

});
