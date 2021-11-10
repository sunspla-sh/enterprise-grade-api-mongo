import * as express from 'express';

import UserService, { ErrorResponse } from '@exmpl/api/services/user';
import { writeJsonResponse } from '@exmpl/utils/express';
import logger from '@exmpl/utils/logger';

export function auth(req: express.Request, res: express.Response, next: express.NextFunction): void {

  //parse our token from headers - guaranteed to be non-null
  const token = req.headers.authorization!

  UserService.auth(token)
    .then(authResponse => {

      if(!(authResponse as any).error){

        res.locals.auth = {
          userId: (authResponse as { userId: string }).userId
        }

        next()

      } else{

        writeJsonResponse(res, 401, authResponse)

      }

    })
    .catch((err: any) => {
      
      writeJsonResponse(res, 500, {
        error: {
          type: 'internal_server_error',
          message: 'Internal server error'
        }
      });

    });
}

export function createUser(req: express.Request, res: express.Response): void {

  const { email, password, name } = req.body;

  UserService.createUser(email, password, name)
    .then(createUserResponse => {

      if((createUserResponse as any).error){

        if((createUserResponse as ErrorResponse).error.type === 'account_already_exists') {

          writeJsonResponse(res, 409, createUserResponse);

        } else {

          throw new Error(`unsupported ${createUserResponse}`);

        }

      } else {

        writeJsonResponse(res, 201, createUserResponse);

      }

    })
    .catch((err: any) => {

      logger.error(`createUser: ${err}`);

      writeJsonResponse(res, 500, {
        error: {
          type: 'internal_server_error',
          message: 'Internal server error'
        }
      });

    });

}