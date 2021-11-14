import request from 'supertest';
import { Express } from 'express';

import db from '@exmpl/utils/db';
import { createServer } from '@exmpl/utils/server';
import { createGenericUserAndAuthorize } from '@exmpl/test_helpers/user';

let server: Express;

beforeAll(async () => {
  await db.open();
  server = await createServer();
});

afterAll(async () => {
  await db.close();
});

describe('Controller - Greeting - GET /hello', () => {
  
  test('should return 200 & valid response if request param list is empty', done => {
    
    request(server)
      .get('/api/v1/hello')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        
        if (err) return done(err);

        expect(res.body).toMatchObject({
          message: 'Hello, stranger!'
        });

        done();

      });

  });

  test('should return 200 & valid response if name parameter is set', done => {
    
    request(server)
      .get('/api/v1/hello?name=Test%20Name')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        
        if(err) return done(err);
        
        expect(res.body).toMatchObject({
          message: 'Hello, Test Name!'
        });

        done();

      });

  });


});

describe('Controller - Greeting - GET /goodbye', () => {

  test('should return 200 & valid response to authorization with fakeToken request', done => {

    createGenericUserAndAuthorize()
      .then(genericUser => {

        request(server)
          .get('/api/v1/goodbye')
          .set('Authorization', `Bearer ${genericUser.token}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {

            if(err) return done(err);

            expect(res.body).toMatchObject({
              message: `Goodbye, ${genericUser.name}!`
            });

            done();

          });

      })
      .catch(err => {
        return done(err);
      })

    

  });

  test('should return 401 & valid error response to invalid authorization token', done => {

    request(server)
      .get('/api/v1/goodbye')
      .set('Authorization', 'Bearer invalidToken')
      .expect('Content-Type', /json/)
      .expect(401)
      .end((err, res) => {

        if(err) return done(err);

        expect(res.body).toMatchObject({
          error: {
            type: 'unauthorized',
            message: 'Authentication failed'
          }
        });

        done();

      });

  });

  test('should return 401 & valid error response if authorization header field is missed', done => {

    request(server)
      .get('/api/v1/goodbye')
      .expect('Content-Type', /json/)
      .expect(401)
      .end((err, res) => {

        if(err) return done(err);

        expect(res.body).toMatchObject({
          error: {
            type: 'request_validation',
            message: 'Authorization header required',
            errors: expect.anything()
          }
        });

        done();

      });

  });

  async function sendGoodbye(token: string) {

    return new Promise<void>(function(resolve, reject) {

      request(server)
        .get('/api/v1/goodbye')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res){
          
          if(err) return reject(err);

          resolve()

      });
    
    });

  }

  test('performance test of goodbye', async () => {

    const genericUser = await createGenericUserAndAuthorize();

    const now = new Date().getTime();

    let i = 0;

    do {

      i += 1;

      await sendGoodbye(genericUser.token);

    } while (new Date().getTime() - now < 1000);

    console.log(`Goodbye route performance test results: ${i} requests processed per second`);

  });

});