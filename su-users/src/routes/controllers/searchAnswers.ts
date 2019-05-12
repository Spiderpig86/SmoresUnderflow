import { IMiddleware } from 'koa-router';

import { Context } from 'koa';
import { UserDb } from '../../database';
import { sendError, sendSuccess } from '../../utils/response';
import { ERROR_CODE } from '../../utils/const';

export function getAnswers(userDb: UserDb): IMiddleware {
    return async (ctx: Context, next: (err?: any) => void) => {
        const username = ctx.params.username;

        console.time('getanswer');

        if (!username) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError('Malformed request');
            return;
        }

        // Check for existing user for username and email
        try {
            console.time('getanswer: Get User');
            const user = await userDb.get(username);
            console.timeEnd('getanswer: Get User');

            if (!user) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError(
                    `No user exists with username ${username}`
                );
                return;
            }

            const answerIds = user.answers;

            ctx.status = 200;
            ctx.body = sendSuccess('Fetched answer IDs', answerIds, 'answers');
            console.timeEnd('getanswer');

        } catch (e) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError(e.message);
        }
    };
}