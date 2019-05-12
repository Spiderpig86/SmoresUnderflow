import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import logger from 'koa-logger';
import Redis, { Cluster } from 'ioredis';
import amqp, { Connection, Channel } from 'amqplib/callback_api';

import { connect } from './db';
import { QuestionDb, Elastic } from './database';
import { Routes } from './routes';
import { MongoClient } from 'mongodb';
import { REDIS_PORT, REDIS_HOST, MEDIA_REDIS_HOST } from './utils/const';
import { MediaDb } from './database/mediadb';
import { EXCHANGE } from './utils/const';

connect()
    .then(async (client: MongoClient) => {
        console.log('[su-questions]: Starting...');
        amqp.connect(`amqp://localhost`, (err: any, conn: Connection) => {
            console.log('[su-questions]: Connecting to amqp...');
            conn.createChannel((err: any, ch: Channel) => {
                console.log('[su-questions]: Created channel...');
                ch.assertExchange(EXCHANGE, 'direct', {
                    durable: false
                });

                const cache: Redis.Redis = new Redis(REDIS_PORT, REDIS_HOST, {
                    dropBufferSupport: true
                }); // Default location
                const imageCache: Redis.Redis = new Redis(REDIS_PORT, MEDIA_REDIS_HOST);

                // Connect to the redis client
                cache.on('connect', () => {
                    console.log('Connected to Redis!');
                });
                cache.on('error', (err: any) => {
                    console.log(`CACHE ERROR: SL1 - ` + err);
                });
                imageCache.on('connect', () => {
                    console.log('Connected to Redis image cache!');
                });
                imageCache.on('error', (err: any) => {
                    console.log(`CACHE ERROR Image: ${err}`);
                });

                const app = new Koa();
                const elastic = new Elastic();
                const questionDb = new QuestionDb(client, cache, imageCache, elastic);
                const mediaDb = new MediaDb(client);
                const routes = new Routes(questionDb, mediaDb, ch);

                app.use(
                    cors({
                        credentials: true
                    })
                );
                app.use(logger());
                app.use(bodyParser());
                app.use(routes.router.routes());
                app.listen(3003);
            });
        });
    })
    .catch(err => console.info(err));
