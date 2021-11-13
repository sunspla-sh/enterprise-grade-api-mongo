import faker from 'faker';

import User from '@exmpl/api/models/user';
import UserService from '@exmpl/api/services/user';

type GenericUser = {
  email: string,
  password: string,
  name: string,
  userId: string
}

type AuthorizedGenericUser = {
  email: string,
  password: string,
  name: string,
  userId: string,
  token: string
}

export function genericUser(){
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.name.firstName()
  };
}

export async function createGenericUser(): Promise<GenericUser> {
  const userOptions = genericUser();
  const user = new User(userOptions);
  await user.save();
  return {
    ...userOptions,
    userId: user._id.toString()
  };
}

export async function createGenericUserAndAuthorize(): Promise<AuthorizedGenericUser> {
  const user = await createGenericUser();
  const authToken = await UserService.createAuthToken(user.userId);
  return {
    ...user,
    token: authToken.token
  };

};