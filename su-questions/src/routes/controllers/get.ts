import * as crypto from 'crypto';

import { Context } from 'koa';
import { IMiddleware } from 'koa-router';
import { QuestionDb } from '../../database';
import { sendError, sendSuccess } from '../../utils/response';
import { Question, User } from '../../models';
import { toFrontend } from '../../utils/lib/toFrontend';
import { ERROR_CODE } from '../../utils/const';

export function getQuestion(questionDb: QuestionDb): IMiddleware {
    return async (ctx: Context, next: (err?: any) => void) => {
        const params = ctx.params;
        const id = params.id;
  
        console.info('/getquestion', JSON.stringify(id));
        console.time('getquestion');

        if (!id) {
            ctx.status = 200;
            ctx.body = sendError('Malformed request');
            return;
        }

        try {
            console.time('getquestion: Get question');
            const question = (await questionDb.get(id)) as Question;
            console.timeEnd('getquestion: Get question');
            if (!question) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError(`Question does not exist with id ${id}`);
                return;
            }

            console.time('getquestion: Get user by username');
            const user = (await questionDb.getUser(question.user.username)) as User;
            console.timeEnd('getquestion: Get user by username');

            const viewingUser = ctx.state.user;

            console.time('getquestion: Increment view count');
            if (!question.viewedIds.includes(viewingUser._id)) {
                await questionDb.incrementViewCount(id, question, viewingUser._id);
                question.viewCount++;
            }
            console.timeEnd('getquestion: Increment view count');

            ctx.status = 200;
            ctx.body = sendSuccess(
                'Successfully queried question',
                toFrontend(question, user),
                'question'
            );
            console.timeEnd('getquestion');
        } catch (e) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError(e.message);
        }
    };
}
