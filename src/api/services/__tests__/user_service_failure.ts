import jwt, { Secret, SignCallback, SignOptions } from 'jsonwebtoken';

import db from '@exmpl/utils/db';
import { createGenericUser } from '@exmpl/test_helpers/user';
import UserService from '@exmpl/api/services/user';

beforeAll(async () => {
  await db.open();
});

afterAll(async () => {
  await db.close();
});

describe('Service - User - jwt.sign failure', () => {
  
  test('should return internal_server_error if jwt.sign fails with error', async () => {
    
    (jwt.sign as any) = (
      payload: string | Buffer | object,
      secretOrPrivateKey: Secret,
      options: SignOptions,
      callback: SignCallback
    ) => {
      callback(new Error('failure'), undefined);
    };

    const genericUser = await createGenericUser();

    await expect(UserService.login(genericUser.email, genericUser.password)).rejects.toEqual({
      error: {
        type: 'internal_server_error',
        message: 'Internal server error'
      }
    });

  });

});