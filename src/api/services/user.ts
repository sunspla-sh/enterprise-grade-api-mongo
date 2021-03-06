import jwt, { SignOptions, VerifyErrors, VerifyOptions, } from 'jsonwebtoken';

import User, { IUser } from '@exmpl/api/models/user';
import config from '@exmpl/config';
import logger from '@exmpl/utils/logger';
import cacheLocal from '@exmpl/utils/cache_local';
import cacheExternal from '@exmpl/utils/cache_external';

export type ErrorResponse = { error: { type: string, message: string } }
export type AuthResponse = ErrorResponse | { userId: string }
export type CreateUserResponse = ErrorResponse | { userId: string }
export type LoginUserResponse = ErrorResponse | { token: string, userId: string, expireAt: Date }

const { jwtHmacSecret } = config;

const signOptions: SignOptions = {
  algorithm: 'HS256',
  expiresIn: '14d'
};

const verifyOptions: VerifyOptions = {
  algorithms: ['HS256']
}

function createAuthToken(userId: string): Promise<{ token: string, expireAt: Date }> {

  return new Promise(function(resolve, reject){

    jwt.sign({ userId }, jwtHmacSecret, signOptions, (err: Error | null, encoded: string | undefined) => {
      
      if(err === null && encoded !== undefined){
        
        const twoWeeksInSeconds = 2 * 604800; //two weeks in seconds
        
        const expireAt = new Date();
        
        expireAt.setSeconds(expireAt.getSeconds() + twoWeeksInSeconds);

        cacheExternal.setProp(encoded, userId, twoWeeksInSeconds)
          .then(() => {

            resolve({
              token: encoded,
              expireAt
            });

          })
          .catch(err => {

            logger.warn(`createAuthToken.setProp: ${err}`);

            resolve({
              token: encoded,
              expireAt
            });

          });

      } else {

        reject(err);

      }

    });

  });

}

async function login(email: string, password: string): Promise<LoginUserResponse> {

  try{

    let user: IUser | undefined | null = cacheLocal.get<IUser>(email);

    if(!user){

      user = await User.findOne({ email });

      if(!user){

        /**
         * Here we return an error that will be automatically
         * wrapped as a resolved promise by javascript because
         * we returned the error object from an async function.
         * We don't force a promise reject because it was a correctly
         * formatted input despite containing incorrect email/password.
         * Hence it is user error and not an internal error.
         */
        return {
          error: {
            type: 'invalid_credentials',
            message: 'Invalid email/password'
          }
        };

      }

      cacheLocal.set(user._id.toString(), user);
      cacheLocal.set(email, user);

    }

    const passwordMatch = await user.comparePassword(password);

    if(!passwordMatch){

      /**
       * Here we return an error that will be automatically
       * wrapped as a resolved promise by javascript because
       * we returned the error object from an async function.
       * We don't force a promise reject because it was a correctly
       * formatted input despite containing incorrect email/password.
       * Hence it is user error and not an internal error.
       */
      return {
        error: {
          type: 'invalid_credentials',
          message: 'Invalid email/password'
        }
      };

    }

    const authToken = await createAuthToken(user._id.toString());

    return {
      userId: user._id.toString(),
      token: authToken.token,
      expireAt: authToken.expireAt
    }

  } catch (err) {

    logger.error(`login: ${err}`);

    /**
     * Here we force a promise reject as some type of
     * internal error occurred - the user input 
     * may have been correct or incorrect but
     * we are unable to determine that. This differs
     * from the above case where we resolve with an
     * error because it was a user error.
     */
    return Promise.reject({
      error: {
        type: 'internal_server_error',
        message: 'Internal server error'
      }
    });

  }
}

async function auth(bearerToken: string): Promise<AuthResponse> {

  const token = bearerToken.replace('Bearer ', '');

  try{

    const userId = await cacheExternal.getProp(token);

    if(userId) return { userId };

  } catch (err) {
    
    logger.warn(`auth.cacheExternal.addToken: ${err}`)

  }
  
  return new Promise(function(resolve, reject) {

    jwt.verify(token, jwtHmacSecret, verifyOptions, (err: VerifyErrors | null, decoded: object | undefined) => {

      if(err === null && decoded !== undefined && (decoded as any).userId !== undefined){

        const d = decoded as { userId: string, exp: number };

        const expireAfter = d.exp - Math.round((new Date()).valueOf() / 1000);

        cacheExternal.setProp(token, d.userId, expireAfter)
          .then(() => {

            resolve({
              userId: d.userId
            });

          })
          .catch(err => {

            resolve({
              userId: d.userId
            });

            logger.warn(`auth.cacheExternal.addToken: ${err}`);

          });

      } else {

        resolve({
          error: {
            type: 'unauthorized',
            message: 'Authentication failed'
          }
        });

      }

    });

  });

}

function createUser(email: string, password: string, name: string): Promise<CreateUserResponse> {

  return new Promise(function(resolve, reject){

    const user = new User({
      email,
      password,
      name
    });

    user.save()
      .then(u => {

        resolve({
          userId: u._id.toString()
        });

      })
      .catch(err => {

        if(err.code === 11000){

          resolve({
            error: {
              type: 'account_already_exists',
              message: `${email} already exists`
            }
          });

        } else {

          logger.error(`createUser: ${err}`);

          reject(err);

        }
      });

  });
}

export default { auth, createUser, login, createAuthToken }