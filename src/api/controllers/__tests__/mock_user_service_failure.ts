import faker from 'faker';
import request from 'supertest';
import { Express } from 'express';

import UserService from '@exmpl/api/services/user';
import { createServer } from '@exmpl/utils/server';

jest.mock('@exmpl/api/services/user');

let server: Express;

beforeAll(async () => {
  server = await createServer();
});

describe('Controller|Mocking - UserService - auth failure', () => {

  test('should return 500 & valid response if auth rejects with an error', done => {

    /**
     * Here we mock the auth function of the user service and
     * force a reject of the promise. This would occur when we
     * are unable to verify that the user auth is valid or invalid.
     * For example, we'd see this error when the connection to our
     * database is lost (thus causing the async function to hang,
     * timeout, and reject our promise). Note that our auth function
     * can resolve properly with an error, but that is the case where
     * we have successfully determined that the user is unauthorized,
     * which means that we must have succesfully received a response from
     * our database - that is not what is being tested here.
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

describe('Controller|Mocking - UserService - createUser failure', () => {

  test('should return 500 & valid response if createUser rejects with an error', done => {

    (UserService.createUser as jest.Mock).mockRejectedValue(new Error);

    request(server)
      .post('/api/v1/user')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.name.firstName()
      })
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

  test('should return 500 & valid response if createUser resolves then rejects with any error other than account_already_exists', done => {

    (UserService.createUser as jest.Mock).mockResolvedValue({ error: 'unknown' });

    request(server)
      .post('/api/v1/user')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.name.firstName()
      })
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

describe('Controller|Mocking - UserService - login failure', () => {

  test('should return 500 & valid response if login rejects with an error', done => {

    (UserService.login as jest.Mock).mockResolvedValue({
      error: {
        type: 'unknown'
      }
    });

    request(server)
      .post('/api/v1/login')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password()
      })
      .expect(500)
      .end(function(err, res){

        if(err) return done(err);

        expect(res.body).toMatchObject({
          error: {
            type: 'internal_server_error',
            message: 'Internal server error'
          }
        });

        done();

      })
    
  });

});