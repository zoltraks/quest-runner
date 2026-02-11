task('Smoke', () => {

    step('Basic assertions', x => {
        x.assertTrue(true);
        x.assertFalse(false);
        x.assertNull(null);
        x.assertNotNull({});
        x.assertEquals(2 + 2, 4);
        x.assertNotEquals(2 + 2, 5);
        x.assertEmpty('');
        x.assertNotEmpty('x');
        x.result('Smoke test passed');
    });

});
