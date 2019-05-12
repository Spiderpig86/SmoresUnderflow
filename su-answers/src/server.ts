import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import logger from 'koa-logger';
import helmet from 'koa-helmet';
import Redis, { Cluster } from 'ioredis';

import { Routes } from './routes';
import { connect } from './db';
import { AnswerDb, UserDb, QuestionDb } from './database';
import { MongoClient } from '../node_modules/@types/mongodb';
import { REDIS_PORT, REDIS_HOST } from './utils/const';

// Init database connection and server
connect()
    .then(async (client: MongoClient) => {

        const cache: Redis.Redis = new Redis(REDIS_PORT, REDIS_HOST, {
            dropBufferSupport: true
        });
        cache.on('connect', () => {
            console.log('Connected to Redis!');
        });
        cache.on('error', (err: any) => {
            console.log(`CACHE ERROR: SL1 - ` + err);
        });

        // Initialize db classes
        const userDb = new UserDb(client, cache);
        const answerDb = new AnswerDb(client, cache);
        const questionDb = new QuestionDb(client, cache);

        const app = new Koa();
        const routes = new Routes(userDb, answerDb, questionDb);

        app.use(cors({
            credentials: true
        }));
        app.use(helmet());
        app.use(logger());
        app.use(bodyParser());
        app.use(routes.router.routes());
        app.listen(3004);
    })
    .catch(err => console.info(err));
