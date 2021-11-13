import faker from 'faker';
import request from 'supertest';
import { Express } from 'express';

import db from '@exmpl/utils/db';
import { createServer } from '@exmpl/utils/server';
import { createGenericUser } from '@exmpl/test_helpers/user';

let server: Express;

beforeAll(async () => {
  await db.open();
  server = await createServer();
});

afterAll(async () => {
  await db.close();
});

describe('Controller - User - POST /api/v1/user', () => {

  test('should return 201 & valid response for a valid user', done => {
    
    request(server)
      .post('/api/v1/user')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.name.firstName()
      })
      .expect(201)
      .end((err, res) => {
        
        if(err) return done(err);

        expect(res.body).toMatchObject({
          userId: expect.stringMatching(/^[a-f0-9]{24}/)
        });

        done();

      });

  });

  test('should return 409 & valid response for duplicate user email', done => {

    const duplicateEmail = faker.internet.email();

    request(server)
      .post('/api/v1/user')
      .send({
        email: duplicateEmail,
        password: faker.internet.password(),
        name: faker.name.firstName()
      })
      .expect(201)
      .end((err, res) => {

        if(err) return done(err);

        request(server)
          .post('/api/v1/user')
          .send({
            email: duplicateEmail,
            password: faker.internet.password(),
            name: faker.name.firstName()
          })
          .expect(409)
          .end((err, res) => {

            if(err) return done(err);

            expect(res.body).toMatchObject({
              error: {
                type: 'account_already_exists',
                message: expect.stringMatching(/already exists/)
              }
            });

            done();

          });    

      });

  });

  test('should return 400 & valid response for invalid request', done => {

    request(server)
      .post('/api/v1/user')
      .send({
        mail: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.name.firstName()
      })
      .expect(400)
      .end((err, res) => {

        if(err) return done(err);

        expect(res.body).toMatchObject({
          error: {
            type: 'request_validation',
            message: expect.stringMatching(/email/)
          }
        });

        done();

      });

  });

});

describe('Controller - User - /api/v1/login', () => {

  test('should return 200 & valid response for a valid login request', done => {

    createGenericUser()
      .then(genericUser => {

        const { email, password } = genericUser;

        request(server)
          .post('/api/v1/login')
          .send({
            email,
            password
          })
          .expect(200)
          .end(function(err, res){

            if(err) return done(err);

            expect(res.header['x-expires-after']).toMatch(/^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/);

            expect(res.body).toEqual({
              userId: expect.stringMatching(/^[a-f0-9]{24}/),
              token: expect.stringMatching(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
            });

            done();

          });

      })
      .catch(err => done(err));

  });

  test('should return 401 & valid response for a non-existing user', done => {

    request(server)
      .post('/api/v1/login')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password()
      })
      .expect(401)
      .end(function(err, res){

        if(err) return done(err);

        expect(res.body).toEqual({
          error: {
            type: 'invalid_credentials',
            message: 'Invalid email/password'
          }
        });

        done();

      });

  });

  test('should return 400 & valid response for invalid request', done => {

    request(server)
      .post('/api/v1/login')
      .send({
        email: faker.internet.password(),
        password: faker.internet.password()
      })
      .expect(400)
      .end(function(err, res){

        if(err) return done(err);

        expect(res.body).toMatchObject({
          error: {
            type: 'request_validation',
            message: expect.stringMatching(/email/)
          }
        });

        done();

      });

  });

});