import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import logger from 'koa-logger';
import helmet from 'koa-helmet';

import { Routes } from './routes';
import { connect } from './db';
import { UserDb } from './database';
import { MongoClient } from 'mongodb';
import amqp, { Connection, Channel } from 'amqplib/callback_api';
import { Elastic } from './database/elastic';

// Init database connection and server
connect()
    .then(async (client: MongoClient) => {
        const elastic = new Elastic();
        amqp.connect('amqp://localhost', (err: any, conn: Connection) => {
            conn.createChannel((err: any, ch: Channel) => {

                // Initialize db classes
                const userDb = new UserDb(client);

                const app = new Koa();
                const routes = new Routes(userDb, client, ch, elastic);

                app.use(
                    cors({
                        credentials: true
                    })
                );
                app.use(helmet());
                app.use(logger());
                app.use(bodyParser());
                app.use(routes.router.routes());
                app.listen(3001);
            });
        });

    })
    .catch(err => console.info(err));
