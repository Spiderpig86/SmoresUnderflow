import Router from 'koa-router';

import { UserDb, AnswerDb, QuestionDb } from '../database';
import { Auth } from '../utils/lib/auth';
import { postAdd, getAnswer, postUpvote, postAccept } from './controller';
import { authentication } from '../middleware';


export class Routes {
    public router: Router;
    private auth: Auth;

    constructor(userDb: UserDb, answerDb: AnswerDb, questionDb: QuestionDb) {
        this.router = new Router();
        this.auth = new Auth(userDb);

        this.router.post('/answers/add', authentication(this.auth), postAdd(answerDb));
        this.router.get('/answers/:id', authentication(this.auth), getAnswer(answerDb));
        this.router.post('/answers/:id/upvote', authentication(this.auth), postUpvote(answerDb, userDb));
        this.router.post('/answers/:id/accept', authentication(this.auth), postAccept(answerDb, questionDb));
        this.router.post('/addmedia', authentication(this.auth), async (ctx: any) => {} );
    }

}