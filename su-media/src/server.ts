import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import logger from 'koa-logger';
import Redis from 'ioredis';
import * as crypto from 'crypto';

import { Routes } from './routes';
import { connect } from './db';
import { UserDb } from './database';
import { MongoClient } from 'mongodb';
import multer, { diskStorage } from 'koa-multer';
import {
  PREFIX,
  getMime,
  VID_LIMIT,
  IMG_LIMIT,
  REDIS_HOST,
  REDIS_PORT,
  HASH_KEY
} from './utils/const';
import { MediaDb } from './database/mediadb';

connect()
  .then(async (client: MongoClient) => {
    const cache: Redis.Redis = new Redis(REDIS_PORT, REDIS_HOST, {
      dropBufferSupport: true
  }); // Default location

    // Connect to the redis client
    cache.on('connect', () => {
      console.log('Connected to Redis!');
    });
    cache.on('error', (err: any) => {
      console.log(`CACHE ERROR: SL1 - ` + err);
    });

    const userDb = new UserDb(client);
    const mediaDb = new MediaDb(client, cache);

    const storage = diskStorage({
      destination: (req, file, cb) => {
        cb(null, PREFIX);
      },
      filename: (req, file, cb) => {
        const filename =
          HASH_KEY +
          crypto
            .createHash('sha256')
            .update(`${file.originalname}:${Date.now()}`, 'utf8')
            .digest()
            .toString('hex') +
          '.' +
          getMime(file.mimetype);
        cb(null, filename);
      }
    });

    const upload = multer({
      storage,
      limits: {
        fieldSize: 100 * 1024 * 1024 //100MB
      }
      // fileFilter: (req, file, cb) => {
      //   const ret =
      //     (file.mimetype.indexOf('image') >= 0 && file.size <= IMG_LIMIT) ||
      //     (file.mimetype.indexOf('video') >= 0 && file.size <= VID_LIMIT);
      //   cb(null, ret);
      // }
    });

    const app = new Koa();
    const routes = new Routes(userDb, mediaDb, upload);

    app
      .use(
        cors({
          credentials: true
        })
      )
      .use(logger())
      .use(bodyParser())
      .use(routes.router.routes());
    app.listen(3006);
  })
  .catch(err => console.info(err));
