// Book API Test Scenario
// 
// This scenario tests the Book API available at https://github.com/zoltraks/node-book-api
// 
// The API provides JWT-based authentication and CRUD operations for managing books.
//
// Test flow:
//
// - Obtain JWT token using client credentials
// - Verify invalid credentials are rejected
// - Verify authorization boundaries (missing and invalid token)
// - Retrieve existing books
// - Add a new book
// - Verify incomplete payloads are rejected
// - Verify the book was added
// - Replace the book with PUT
// - Partially update the book with PATCH
// - Verify updates on missing books are rejected
// - Delete the book
// - Verify repeated deletion is rejected
// - Verify the collection is restored

const REMOTE = 'https://localhost:9090';

task('Authentication', () => {

    step('Obtain JWT token', x => {
        x.setBase(process.env.REMOTE || REMOTE);
        x.setInsecure();

        const payload = {
            grant_type: 'client_credentials',
            client_id: 'client',
            client_secret: 'secret',
        };

        x.call(
            'POST',
            '/api/auth/token',
            payload,
            null
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

    step('Reject invalid credentials', x => {
        x.call(
            'POST',
            '/api/auth/token',
            {
                grant_type: 'client_credentials',
                client_id: 'client',
                client_secret: 'wrong',
            },
            null
        );

        const response = x.getResponse();

        x.assertTrue(response.status == 400);
        x.assertEquals(response.data.error, 'invalid_grant');

        x.result('Invalid credentials rejected with 400 invalid_grant');
    });

});

task('Authorization Boundaries', () => {

    step('Reject request without token', x => {
        x.clearAuthorization();

        x.call(
            'GET',
            '/api/books',
            null,
            null
        );

        const response = x.getResponse();

        x.assertTrue(response.status == 401);

        x.setAuthorization('Bearer', x.getParameter('token'));

        x.result('Missing token rejected with 401');
    });

    step('Reject request with invalid token', x => {
        x.call(
            'GET',
            '/api/books',
            null,
            { Authorization: 'Bearer not-a-real-token' }
        );

        const response = x.getResponse();

        x.assertTrue(response.status == 403);

        x.result('Invalid token rejected with 403');
    });

});

task('Book Retrieval', () => {

    step('Get all books', x => {
        x.call(
            'GET',
            '/api/books',
            null,
            null
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
            null
        );

        const response = x.getResponse();

        x.assertTrue(response.status == 201);
        x.assertNotNull(response.data.id);
        x.assertEquals(response.data.title, newBook.title);
        x.assertEquals(response.data.author, newBook.author);

        x.result(`Successfully added book: "${newBook.title}" by ${newBook.author}`);

        x.setParameter('newBookId', response.data.id);
    });

    step('Reject incomplete book payload', x => {
        x.call(
            'POST',
            '/api/books',
            { title: 'No Author' },
            null
        );

        const response = x.getResponse();

        x.assertTrue(response.status == 400);

        x.result('Incomplete payload rejected with 400');
    });

    step('Verify book was added', x => {
        const initialCount = x.getParameter('initialBookCount');

        x.call(
            'GET',
            '/api/books',
            null,
            null
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
                null
            );

            const response = x.getResponse();

            x.assertTrue(response.status == 200);
            x.assertEquals(response.data.title, updatedBook.title);
            x.assertEquals(response.data.author, updatedBook.author);

            x.result(`Successfully updated book ${bookId}`);
        });

        step('Reject PUT with incomplete payload', x => {
            const bookId = x.getParameter('newBookId');

            x.call(
                'PUT',
                `/api/books/${bookId}`,
                { title: 'Only Title' },
                null
            );

            const response = x.getResponse();

            x.assertTrue(response.status == 400);

            x.result('PUT without author rejected with 400');
        });

        step('Reject PUT on missing book', x => {
            x.call(
                'PUT',
                '/api/books/999999',
                { title: 'X', author: 'Y' },
                null
            );

            const response = x.getResponse();

            x.assertTrue(response.status == 404);

            x.result('PUT on missing book rejected with 404');
        });

        step('Partially update book with PATCH', x => {
            const bookId = x.getParameter('newBookId');

            x.call(
                'PATCH',
                `/api/books/${bookId}`,
                { author: 'J. R. R. Tolkien' },
                null
            );

            const response = x.getResponse();

            x.assertTrue(response.status == 200);
            x.assertEquals(response.data.id, bookId);
            x.assertEquals(response.data.author, 'J. R. R. Tolkien');
            x.assertEquals(response.data.title, 'The Hobbit - Experienced');

            x.result(`Patched book ${bookId} author only`);
        });

        step('Reject PATCH on missing book', x => {
            x.call(
                'PATCH',
                '/api/books/999999',
                { title: 'X' },
                null
            );

            const response = x.getResponse();

            x.assertTrue(response.status == 404);

            x.result('PATCH on missing book rejected with 404');
        });

        step('Verify book update', x => {
            x.call(
                'GET',
                '/api/books',
                null,
                null
            );

            const response = x.getResponse();
            const bookId = x.getParameter('newBookId');

            x.assertTrue(response.status == 200);

            const book = response.data.value.find(b => b.id === bookId);
            x.assertNotNull(book, `Book ${bookId} should exist`);
            x.assertEquals(book.title, 'The Hobbit - Experienced');
            x.assertEquals(book.author, 'J. R. R. Tolkien');

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
                null
            );

            const response = x.getResponse();

            x.assertTrue(response.status == 204);

            x.result(`Successfully deleted book ${bookId}`);
        });

        step('Reject repeated delete', x => {
            const bookId = x.getParameter('newBookId');

            x.call(
                'DELETE',
                `/api/books/${bookId}`,
                null,
                null
            );

            const response = x.getResponse();

            x.assertTrue(response.status == 404);

            x.result('Repeated delete rejected with 404');
        });

        step('Verify book deletion', x => {
            const initialBookCount = x.getParameter('initialBookCount');

            x.call(
                'GET',
                '/api/books',
                null,
                null
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
