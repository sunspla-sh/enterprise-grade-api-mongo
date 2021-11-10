import faker from 'faker';
import request from 'supertest';
import { Express } from 'express';

import db from '@exmpl/utils/db';
import { createServer } from '@exmpl/utils/server';

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