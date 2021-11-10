/* istanbul ignore file */

/**
 * to-do:
 * separate the inmemory db code so that we can add
 * mongodb-memory-server as a dev dependency and follow
 * proper test environment practices
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import config from '@exmpl/config';
import logger from '@exmpl/utils/logger';

mongoose.Promise = global.Promise;
mongoose.set('debug', process.env.DEBUG !== undefined);

const opts = {
  keepAlive: true,
  keepAliveInitialDelay: 300000, //delay initial keepAlive for 300 seconds (5 minutes)
  autoIndex: config.mongo.autoIndex,
  serverSelectionTimeoutMS: 5000, //keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, //close sockets after 45 seconds of inactivity
};

class MongoConnection {

  private static _instance: MongoConnection;

  private _mongoServer?: MongoMemoryServer;

  static getInstance(): MongoConnection {

    if(!MongoConnection._instance){

      MongoConnection._instance = new MongoConnection();

    }

    return MongoConnection._instance;

  }

  public async open(): Promise<void> {

    try {

      /**
       * if testing with in-memory mongodb, first instantiate
       * the mongodb server, then get URI and connect
       * with mongoose, else connect to our pre-existing
       * database specified in the config files
       */
      if(config.mongo.url === 'inmemory'){ 
        
        logger.debug('connecting to inmemory mongo db');

        this._mongoServer = await MongoMemoryServer.create();

        const mongoUrl = await this._mongoServer.getUri();

        await mongoose.connect(mongoUrl, opts);

      } else {

        logger.debug(`connecting to mongo db: ${config.mongo.url}`);

        mongoose.connect(config.mongo.url, opts);

      }

      mongoose.connection.on('connected', () => {

        logger.info('Mongo: connected');

      });

      mongoose.connection.on('disconnected', () => {

        logger.error('Mongo: disconnected');

      });

      mongoose.connection.on('error', err => {

        logger.error(`Mongo: ${String(err)}`);

        /**
         * if MongoNetworkError, attempt to reconnect
         * after waiting 5 seconds
         */
        if(err.name === 'MongoNetworkError'){

          setTimeout(function() {

            mongoose.connect(config.mongo.url, opts)
              .catch(() => {});

          }, 5000);

        }

      });

    } catch (err) {

      logger.error(`db.open ${err}`);

      throw err;

    }

  }

  public async close(): Promise<void> {
    
    try {
      
      await mongoose.disconnect();

      if(config.mongo.url === 'inmemory') {

        await this._mongoServer!.stop();

      }

    } catch (err) {

      logger.error(`db.open: ${err}`);

      throw err;

    }

  }

}

export default MongoConnection.getInstance();