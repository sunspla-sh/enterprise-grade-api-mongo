import config from '@exmpl/config';
import express from 'express';
import { Express } from 'express';
import morgan from 'morgan';
import morganBody from 'morgan-body';
import * as OpenApiValidator from 'express-openapi-validator';
import { connector, summarise as summarize } from 'swagger-routes-express';
import YAML from 'yamljs';

import * as api from '@exmpl/api/controllers';
import { expressDevLogger } from "@exmpl/utils/express_dev_logger";
import logger from '@exmpl/utils/logger';

export async function createServer(): Promise<Express> {

  //define our path to openapi yaml file from project root
  const yamlSpecFile = './config/openapi.yml';

  //load our openapi yaml file
  const apiDefinition = YAML.load(yamlSpecFile);

  //summarize our api using our loaded openapi yaml file
  const apiSummary = summarize(apiDefinition);
  logger.info(apiSummary);

  //create our express app
  const server = express();

  //use built-in express middlewares to parse body into json
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json());

  //use morgan logger middleware
  /* istanbul ignore next */
  if(config.morganLogger){
    server.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
  }
  
  //use morganBody logger middleware
  /* istanbul ignore next */
  if(config.morganBodyLogger){
    morganBody(server);
  }
  
  //use our custom dev logger middleware
  /* istanbul ignore next */
  if(config.exmplDevLogger){
    server.use(expressDevLogger);
  }

  //setup openapi validator options
  const validatorOptions = {
    apiSpec: yamlSpecFile,
    validateRequests: true,
    validateResponses: true
  };

  //instantiate openapi request handler to be passed to server as middleware
  const openApiRequestHandler = OpenApiValidator.middleware(validatorOptions);

  //use openapi request handler middleware
  server.use(openApiRequestHandler);

  //error customization middleware
  server.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(err.status).json({
      error: {
        type: 'request_validation',
        message: err.message,
        errors: err.errors
      }
    });
  });

  /**
   * instantiate connector - connects all of our controllers to
   * our openapi routes defined in openapi.yaml and handled
   * by the openApiRequestHandler middleware
   */
  const connect = connector(api, apiDefinition, {
    onCreateRoute: (method: string, descriptor: any[]) => {
      logger.verbose(`${method}: ${descriptor[0]} : ${(descriptor[1] as any).name}`);
    },
    security: {
      bearerAuth: api.auth
    }
  });

  connect(server)


  return server;
}
