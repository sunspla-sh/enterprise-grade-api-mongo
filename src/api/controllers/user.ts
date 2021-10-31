import * as express from 'express';

import UserService from '@exmpl/api/services/user';
import { writeJsonResponse } from '@exmpl/utils/express';

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
      // console.log(err)
      writeJsonResponse(res, 500, {
        error: {
          type: 'internal_server_error',
          message: 'Internal server error'
        }
      })
    })
}