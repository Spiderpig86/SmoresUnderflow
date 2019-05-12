import Router from 'koa-router';
import { addQuestion, getQuestion, deleteQuestion, addAnswer, getAnswers, postUpvote } from './controllers';
import { Auth } from '../utils/lib';
import { QuestionDb } from '../database';
import { authentication } from '../middleware';
import { MediaDb } from '../database/mediadb';
import { Channel } from 'amqplib/callback_api';

export class Routes {
    public router: Router;
    public auth: Auth;

    constructor(questionDb: QuestionDb, mediaDb: MediaDb, channel: Channel) {

        this.router = new Router();
        this.auth = new Auth(questionDb);
        
        this.router.post(`/questions/add`, authentication(this.auth), addQuestion(questionDb, mediaDb, channel));
        this.router.get(`/questions/:id`, authentication(this.auth, true), getQuestion(questionDb));
        this.router.delete(`/questions/:id`, authentication(this.auth), deleteQuestion(questionDb, channel));
        this.router.post(`/questions/:id/answers/add`, authentication(this.auth), addAnswer(questionDb, channel));
        this.router.get(`/questions/:id/answers`, authentication(this.auth, true), getAnswers(questionDb));
        this.router.post('/questions/:id/upvote', authentication(this.auth), postUpvote(questionDb));
    }
}
