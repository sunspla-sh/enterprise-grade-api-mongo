import faker from 'faker';

import User from '@exmpl/api/models/user';
import db from '@exmpl/utils/db';

beforeAll(async () => {
  await db.open();
});

afterAll(async () => {
  await db.close();
});

describe('Model - User - save', () => {

  test('should create a user', async () => {

    /**
     * Generate email, password, and name for testing
     * our user creation
     */
    const email = faker.internet.email();
    const password = faker.internet.password();
    const name = faker.name.firstName();

    /**
     * Get current time for later comparison against
     * our user creation time - should be less than
     * that creation time
     */
    const before = Date.now();

    const user = new User({
      email,
      password,
      name
    });

    await user.save();

    /**
     * Get current time for later comparison against
     * our user creation time - should be more than
     * that creation time
     */
    const after = Date.now();

    const fetchedUser = await User.findById(user._id);

    expect(fetchedUser).not.toBeNull();

    expect(fetchedUser!.email).toBe(email);

    expect(fetchedUser!.password).not.toBe(password);

    expect(fetchedUser!.name).toBe(name);

    expect(before).toBeLessThanOrEqual(fetchedUser!.createdAt.getTime());
    
    expect(fetchedUser!.createdAt.getTime()).toBeLessThanOrEqual(after);

  });

  test('should update user', async () => {

    /**
     * Generate email, password, and name for testing
     * our user creation
     */
    const email = faker.internet.email();
    const password = faker.internet.password();
    const originalName = faker.name.firstName();

    const user = new User({
      email,
      password,
      name: originalName
    });

    const originalUser = await user.save();

    const updatedName = faker.name.firstName();

    originalUser.name = updatedName;

    const updatedUser = await originalUser.save();

    expect(updatedUser.name).toEqual(updatedName);

  });

  test('should not save user with invalid email', async () => {
    
    /**
     * Generate password and name for testing
     * our user creation
     */
    const password = faker.internet.password();
    const name = faker.name.firstName();

    const invalidEmail = 'asdf@asdf.m';

    const user = new User({
      email: invalidEmail,
      password,
      name
    });

    await expect(user.save()).rejects.toThrowError(/does not match email regex/);

  });

  test('should not save user without an email', async () => {

    /**
     * Generate password and name for testing
     * our user creation
     */
    const password = faker.internet.password();
    const name = faker.name.firstName();

    const user = new User({
      password,
      name
    });

    await expect(user.save()).rejects.toThrowError(/email/);

  });

  test('should not save user without a password', async () => {

    /**
     * Generate email and name for testing
     * our user creation
     */
    const email = faker.internet.email();
    const name = faker.name.firstName();
 
    const user = new User({
      email,
      name
    });
 
    await expect(user.save()).rejects.toThrowError(/password/);

  });

  test('should not save user without a name', async () => {

    /**
     * Generate email and password for testing
     * our user creation
     */

    const email = faker.internet.email();
    const password = faker.internet.password();

    const user = new User({
      email,
      password
    });

    await expect(user.save()).rejects.toThrowError(/name/);

  });

  test('should not save user with a duplicate email', async () => {
    
    /**
     * Generate email for testing
     * our user creation
     */

    const duplicateEmail = faker.internet.email();

    const originalUser = new User({
      email: duplicateEmail,
      password: faker.internet.password(),
      name: faker.name.firstName()
    });

    await originalUser.save();

    const duplicateUser = new User({
      email: duplicateEmail,
      password: faker.internet.password(),
      name: faker.name.firstName()
    });

    await expect(duplicateUser.save()).rejects.toThrowError(/E11000/);

  });

  test('should not save user with an unsalted and unhashed password', async () => {

    /**
     * Generate email for testing
     * our user creation
     */    

    const password = faker.internet.password();

    const userOne = new User({
      email: faker.internet.email(),
      password,
      name: faker.name.firstName()
    });

    await userOne.save();

    expect(userOne.password).not.toBe(password);

    const userTwo = new User({
      email: faker.internet.email(),
      password,
      name: faker.name.firstName()
    });

    await userTwo.save();

    expect(userTwo.password).not.toBe(password);

    expect(userOne.password).not.toBe(userTwo.password);

  });

});

describe('Model - User - comparePassword', () => {

  test('should return true for valid password', async () => {

    /**
     * Generate email, password, and name for testing
     */
    const email = faker.internet.email();
    const password = faker.internet.password();
    const name = faker.name.firstName();

    const user = new User({
      email,
      password,
      name
    });

    await user.save();

    expect(await user.comparePassword(password)).toBe(true);

  });

  test('should return false for invalid password', async () => {

    /**
     * Generate email, password, and name for testing
     */
    const email = faker.internet.email();
    const password = faker.internet.password();
    const name = faker.name.firstName();

    const wrongPassword = password + '69';

    const user = new User({
      email,
      password,
      name
    });

    await user.save();

    expect(await user.comparePassword(wrongPassword)).toBe(false);

  });

  test('should update password hash if password is updated', async () => {

    /**
     * Generate email, password, and name for testing
     */
    const email = faker.internet.email();
    const password = faker.internet.password();
    const name = faker.name.firstName();

    const user = new User({
      email,
      password,
      name
    });

    await user.save();

    expect(await user.comparePassword(password)).toBe(true);

    const updatedPassword = faker.internet.password();

    user.password = updatedPassword;

    await user.save();

    expect(await user.comparePassword(password)).toBe(false);

    expect(await user.comparePassword(updatedPassword)).toBe(true);

  });

});

describe('Model - User - toJSON', () => {

  test('should return valid JSON', async () => {
    /**
     * Generate email, password, and name for testing
     */
    const email = faker.internet.email();
    const password = faker.internet.password();
    const name = faker.name.firstName();
 
    const user = new User({
      email,
      password,
      name
    });
 
    await user.save();

    expect(user.toJSON()).toEqual({
      email,
      name,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    })

    
  });

});
