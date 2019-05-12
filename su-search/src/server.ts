import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import logger from 'koa-logger';

import { connect } from './db';
import { SearchDb, Elastic } from './database';
import { Routes } from './routes';
import { MongoClient } from '../node_modules/@types/mongodb';
import Redis from 'ioredis';
import { REDIS_PORT, REDIS_HOST } from './utils/const';

connect()
  .then(async (client: MongoClient) => {
    const cache: Redis.Redis = new Redis(REDIS_PORT, REDIS_HOST, {
      dropBufferSupport: true
  });
    // Connect to the redis client
    cache.on('connect', () => {
      console.log('Connected to Redis!');
    });
    cache.on('error', (err: any) => {
      console.log(`CACHE ERROR: SL1 - ` + err);
    });

    const app = new Koa();
    const searchDb = new SearchDb(client, cache);
    const elastic = new Elastic();

    const routes = new Routes(searchDb, elastic);

    app.use(
      cors({
        credentials: true,
      }),
    );
    app.use(logger());
    app.use(bodyParser());
    app.use(routes.router.routes());
    app.listen(3005);
  })
  .catch(err => console.info(err));
