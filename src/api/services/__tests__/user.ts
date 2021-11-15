import faker from 'faker';

import UserService from '@exmpl/api/services/user';
import db from '@exmpl/utils/db';
import { createGenericUser, createGenericUserAndAuthorize } from '@exmpl/test_helpers/user';
import cacheExternal from '@exmpl/utils/cache_external';

beforeAll(async () => {
  await cacheExternal.open()
  await db.open();
});

afterAll(async () => {
  await cacheExternal.close()
  await db.close();
})

describe('Service - User - auth', () => {

  test('should resolve with true and valid userId for token', async () => {

    const genericUser = await createGenericUserAndAuthorize();

    await expect(UserService.auth(genericUser.token)).resolves.toEqual({
      userId: genericUser.userId
    });

  });

  test('should resolve with false for invalid token', async () => {

    const response = await UserService.auth('invalidToken');

    expect(response).toEqual({
      error: {
        type: 'unauthorized',
        message: 'Authentication failed'
      }
    });

  });

  test('performance test of auth function', async () => {

    const genericUser = await createGenericUserAndAuthorize();

    const now = new Date().getTime();

    let i = 0;

    do {
      
      i += 1;

      await UserService.auth(`Bearer ${genericUser.token}`);

    } while (new Date().getTime() - now < 1000);

    console.log(`UserService.auth performance test results: ${i} verifications per second`);

  });

});

describe('Service - User - createUser', () => {

  test('should resolve with true and valid userId', async () => {

    const email = faker.internet.email();
    const password = faker.internet.password();
    const name = faker.name.firstName();

    await UserService.createUser(email, password, name);

    await expect(UserService.createUser(email, password, name)).resolves.toEqual({
      error: {
        type: 'account_already_exists',
        message: `${email} already exists`
      }
    });

  });

  test('should reject if invalid input', async () => {

    const email = 'invalid@email.m';
    const password = faker.internet.password();
    const name = faker.name.firstName();

    await expect(UserService.createUser(email, password, name)).rejects.toThrowError(/validation failed/)

  });
});

describe('Service - User - login', () => {

  test('should return jwt, userId, expireAt to a valid login/password', async () => {

    const genericUser = await createGenericUser();
    
    await expect(UserService.login(genericUser.email, genericUser.password)).resolves.toEqual({
      userId: genericUser.userId,
      token: expect.stringMatching(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/), //jwt regex pattern
      expireAt: expect.any(Date)
    });

  });

  test('should resolve with an error if email does not exist', async () => {
    await expect(UserService.login(faker.internet.email(), faker.internet.password())).resolves.toEqual({
      error: {
        type: 'invalid_credentials',
        message: 'Invalid email/password'
      }
    });
  });

  test('should resolve with an error if email exists but password is incorrect', async () => {
    const genericUser = await createGenericUser();
    await expect(UserService.login(genericUser.email, faker.internet.password())).resolves.toEqual({
      error: {
        type: 'invalid_credentials',
        message: 'Invalid email/password'
      }
    });
  });

});