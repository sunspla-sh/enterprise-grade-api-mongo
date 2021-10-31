import request from 'supertest';
import { Express } from 'express';

import UserService from '@exmpl/api/services/user';
import { createServer } from '@exmpl/utils/server';

jest.mock('@exmpl/api/services/user');

let server: Express;

beforeAll(async () => {
  server = await createServer();
});

describe('auth failure', () => {

  test('should return 500 & valid response if auth rejects with an error', done => {

    /**
     * Here we mock the auth function of the user service and
     * force a reject of the promise. This would occur when we
     * are unable to verify that the user auth is valid or invalid.
     * For example, we'd see this error when the connection to our
     * database is lost (thus causing the async function to hang,
     * timeout, and reject our promise)
     */
    (UserService.auth as jest.Mock).mockRejectedValue(new Error);

    request(server)
      .get('/api/v1/goodbye')
      .set('Authorization', 'Bearer fakeToken')
      .expect(500)
      .end((err, res) => {

        if(err) return done(err);
        
        expect(res.body).toMatchObject({
          error: {
            type: 'internal_server_error',
            message: 'Internal server error'
          }
        });

        done();

      });

  });

});