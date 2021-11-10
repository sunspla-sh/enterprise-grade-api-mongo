import faker from 'faker';

import UserService from '@exmpl/api/services/user';
import db from '@exmpl/utils/db';

beforeAll(async () => {
  await db.open();
});

afterAll(async () => {
  await db.close();
})

describe('Service - User - auth', () => {

  test('should resolve with true and valid userId for hardcoded token', async () => {

    const response = await UserService.auth('fakeToken');

    /**
     * we use the toEqual function to check for object
     * key-value equality recursively as the toBe function
     * checks strict Object equality with Object.is
     */
    expect(response).toEqual({
      userId: 'fakeUserId'
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