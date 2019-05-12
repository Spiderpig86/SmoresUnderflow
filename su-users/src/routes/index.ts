import Router from 'koa-router';

import { UserDb } from '../database';
import { Auth } from '../utils/lib/auth';
import { getAnswers, getQuestions, postUsername } from './controllers';
import { authentication } from '../middleware';
import { getUsername } from './controllers/username';

export class Routes {
    public router: Router;
    private auth: Auth;

    constructor(userDb: UserDb) {
        this.router = new Router();
        this.auth = new Auth(userDb);

        this.router.get('/user/:username', getUsername(userDb));
        this.router.post('/user/detailed/:username', authentication(this.auth), postUsername(userDb)); // EXTRA
        this.router.get('/user/:username/questions', getQuestions(userDb));
        this.router.get('/user/:username/answers', getAnswers(userDb));
    }
}
