
import db from '@exmpl/utils/db';
import { createServer } from './utils/server';
import logger from '@exmpl/utils/logger';

db.open()
  .then(() => createServer())
  .then(server => {
    server.listen(3000, () => {
      logger.info(`Listening on http://localhost:3000`)
    });
  })
  .catch(err => {
    logger.error(`Error: ${err}`);
  });

