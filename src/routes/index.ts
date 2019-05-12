import Router from 'koa-router';

import { UserDb } from '../database';
import { Auth } from '../utils/lib/auth';
import { postLogin, postLogout, postAddUser, postVerify } from './controllers';
import { authentication } from '../middleware';
import { Context } from 'koa';
import { sendSuccess } from '../utils/response';
import { MongoClient } from 'mongodb';
import { Channel } from 'amqplib/callback_api';
import { Elastic } from '../database/elastic';

export class Routes {
    public router: Router;
    private auth: Auth;

    constructor(userDb: UserDb, client: MongoClient, ch: Channel, elastic: Elastic) {
        this.router = new Router();
        this.auth = new Auth(userDb);

        this.router.get('/', async (ctx) => {
            ctx.redirect('/app');
        });

        this.router.post('/test', authentication(this.auth), async (ctx: Context) => ctx.body = sendSuccess('Verified!'));

        this.router.post('/login', postLogin(userDb));
        this.router.post('/logout', authentication(this.auth), postLogout);
        this.router.post('/adduser', postAddUser(userDb, ch));
        this.router.post('/verify', postVerify(userDb));
        this.router.get('/verify', postVerify(userDb));
        this.router.get('/reset', async (ctx: Context) => {
            const db = client.db('underflow');
            const questionsDb = db.collection(`questions`);
            const mediaDb = db.collection('media');
            const answerDb = db.collection('answers');
            const userDb = db.collection('users');
            questionsDb.remove({});
            mediaDb.remove({});
            answerDb.remove({});
            userDb.remove({});
            elastic.deleteAll();
            ctx.status = 200;
            ctx.body = sendSuccess('Database reset!');
        });
    }
}
