import * as express from 'express';
import { writeJsonResponse } from '@exmpl/utils/express';
import GreetingService from '@exmpl/api/services/greeting';
import logger from '@exmpl/utils/logger';

export function hello(req: express.Request, res: express.Response): void {

  const name = req.query.name || 'stranger';
  
  writeJsonResponse(res, 200, {
    message: `Hello, ${name}!`
  });
  
}

export async function goodbye(req: express.Request, res: express.Response): Promise<void> {

  try{

    const userId = res.locals.auth.userId;

    const message = await GreetingService.goodbye(userId);

    writeJsonResponse(res, 200, message);

  } catch (err) {

    logger.error(`goodbye: ${err}`);

    writeJsonResponse(res, 500, {
      error: {
        type: 'internal_server_error',
        message: 'Internal server error'
      }
    });

  }

}