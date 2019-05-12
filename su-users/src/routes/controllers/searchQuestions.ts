import { IMiddleware } from 'koa-router';

import { Context } from 'koa';
import { UserDb } from '../../database';
import { sendError, sendSuccess } from '../../utils/response';
import { ERROR_CODE } from '../../utils/const';

export function getQuestions(userDb: UserDb): IMiddleware {
    return async (ctx: Context, next: (err?: any) => void) => {
        const username = ctx.params.username;
        console.time('getquestion');

        if (!username) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError('Malformed request');
            return;
        }

        // Check for existing user for username and email
        try {
            console.time('getquestion: Find user by username');
            const user = await userDb.findByUsername(username);
            console.timeEnd('getquestion: Find user by username');

            if (!user) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError(
                    `No user exists with username ${username}`
                );
                return;
            }
            const questionIds = user.questions;

            ctx.status = 200;
            ctx.body = sendSuccess('Fetched question IDs', questionIds, 'questions');
            console.timeEnd('getquestion');


        } catch (e) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError(e.message);
        }
    };
}