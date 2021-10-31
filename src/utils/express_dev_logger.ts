/* istanbul ignore file */

import express from 'express';
import logger from '@exmpl/utils/logger';

export const expressDevLogger = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  
  //in nanoseconds
  const startHrTime = process.hrtime.bigint();

  logger.http(`Request: ${req.method} ${req.url} at ${new Date().toUTCString()}, User-Agent: ${req.get('User-Agent')}`);

  logger.http(`Request Body: ${JSON.stringify(req.body)}`);

  const [ oldWrite, oldEnd ] = [ res.write, res.end ];

  const chunks: Buffer[] = [];

  (res.write as unknown) = function(chunk: any): void {

    chunks.push(Buffer.from(chunk));

    (oldWrite as Function).apply(res, arguments);

  }

  res.end = function(chunk: any): void {
    
    if(chunk){
      chunks.push(Buffer.from(chunk))
    }

    //in nanoseconds
    const endHrTime = process.hrtime.bigint();
    
    //calculate difference and convert to milliseconds
    const elapsedTimeInMs = Number(endHrTime - startHrTime) / 1e6;

    logger.http(`Response ${res.statusCode} ${elapsedTimeInMs.toFixed(3)} ms`);

    const body = Buffer.concat(chunks).toString('utf-8');

    logger.http(`Response Body: ${body}`);

    (oldEnd as Function).apply(res, arguments);

  }

  next();

}