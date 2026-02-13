// Book API Test Scenario
// 
// This scenario tests the Book API available at https://github.com/zoltraks/node-book-api
// 
// The API provides JWT-based authentication and CRUD operations for managing books.
//
// Test flow:
//
// - Obtain JWT token using client credentials
// - Retrieve existing books
// - Add a new book
// - Verify the book was added

const REMOTE = 'https://localhost:9090';

task('Authentication', () => {

    step('Obtain JWT token', x => {
        x.setBase(process.env.REMOTE || REMOTE);

        const payload = {
            grant_type: 'client_credentials',
            client_id: 'client',
            client_secret: 'secret',
        };

        x.call(
            'POST',
            '/api/auth/token',
            payload,
            null,
            { insecure: true }
        );

        const response = x.getResponse();

        x.assertTrue(response.status == 200);
        x.assertNotNull(response.data.access_token);
        x.assertEquals(response.data.token_type, 'bearer');
        x.assertEquals(response.data.expires_in, 3600);

        x.setParameter('token', response.data.access_token);
        x.setAuthorization('Bearer', response.data.access_token);

        x.result('Successfully obtained JWT token');
    });

});

task('Book Retrieval', () => {

    step('Get all books', x => {
        x.call(
            'GET',
            '/api/books',
            null,
            null,
            { insecure: true }
        );

        const response = x.getResponse();

        x.assertTrue(response.status == 200);
        x.assertNotNull(response.data.value);
        x.assertTrue(Array.isArray(response.data.value));

        x.setParameter('initialBookCount', response.data.value.length);

        x.result(`Retrieved ${response.data.value.length} books`);
    });

});

task('Book Insertion', () => {

    step('Add a new book', x => {
        const newBook = {
            title: 'The Hobbit',
            author: 'J.R.R. Tolkien',
        };

        x.call(
            'POST',
            '/api/books',
            newBook,
            null,
            { insecure: true }
        );

        const response = x.getResponse();

        x.assertTrue(response.status == 201);
        x.assertNotNull(response.data.id);
        x.assertEquals(response.data.title, newBook.title);
        x.assertEquals(response.data.author, newBook.author);

        x.result(`Successfully added book: "${newBook.title}" by ${newBook.author}`);

        x.setParameter('newBookId', response.data.id);
    });

    step('Verify book was added', x => {
        const initialCount = x.getParameter('initialBookCount');

        x.call(
            'GET',
            '/api/books',
            null,
            null,
            { insecure: true }
        );

        const response = x.getResponse();

        x.assertTrue(response.status == 200);
        x.assertEquals(response.data.value.length, initialCount + 1);

        const hobbit = response.data.value.find(book => book.title === 'The Hobbit');
        x.assertNotNull(hobbit);
        x.assertEquals(hobbit.author, 'J.R.R. Tolkien');

        x.result(`Verified: Book collection now contains ${response.data.value.length} books`);
    });

    task('Book Update', () => {

        step('Update book details', x => {
            const bookId = x.getParameter('newBookId');

            const updatedBook = {
                title: 'The Hobbit - Experienced',
                author: 'John Ronald Reuel Tolkien',
            };

            x.call(
                'PUT',
                `/api/books/${bookId}`,
                updatedBook,
                null,
                { insecure: true }
            );

            const response = x.getResponse();

            x.assertTrue(response.status == 200);
            x.assertEquals(response.data.title, updatedBook.title);
            x.assertEquals(response.data.author, updatedBook.author);

            x.result(`Successfully updated book ${bookId}`);
        });

        step('Verify book update', x => {
            x.call(
                'GET',
                '/api/books',
                null,
                null,
                { insecure: true }
            );

            const response = x.getResponse();
            const bookId = x.getParameter('newBookId');

            x.assertTrue(response.status == 200);

            const book = response.data.value.find(b => b.id === bookId);
            x.assertNotNull(book, `Book ${bookId} should exist`);
            x.assertEquals(book.title, 'The Hobbit - Experienced');
            x.assertEquals(book.author, 'John Ronald Reuel Tolkien');

            x.result(`Verified: Book ${bookId} has updated details`);
        });

    });

    task('Book Deletion', () => {

        step('Delete the book', x => {
            const bookId = x.getParameter('newBookId');

            x.call(
                'DELETE',
                `/api/books/${bookId}`,
                null,
                null,
                { insecure: true }
            );

            const response = x.getResponse();

            x.assertTrue(response.status == 204);

            x.result(`Successfully deleted book ${bookId}`);
        });

        step('Verify book deletion', x => {
            const initialBookCount = x.getParameter('initialBookCount');

            x.call(
                'GET',
                '/api/books',
                null,
                null,
                { insecure: true }
            );

            const response = x.getResponse();
            const bookId = x.getParameter('newBookId');

            x.assertTrue(response.status == 200);
            x.assertEquals(response.data.value.length, initialBookCount);

            const book = response.data.value.find(b => b.id === bookId);
            x.assertNull(book, `Book ${bookId} should not exist`);

            x.result(`Verified: Book ${bookId} is no longer in the collection`);
        });

    });

});
