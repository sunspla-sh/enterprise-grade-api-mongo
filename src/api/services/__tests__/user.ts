import user from '../user';

describe('auth', () => {

  test('should resolve with true and valid userId for hardcoded token', async () => {

    const response = await user.auth('fakeToken');

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

    const response = await user.auth('invalidToken');

    expect(response).toEqual({
      error: {
        type: 'unauthorized',
        message: 'Authentication failed'
      }
    });

  });

})