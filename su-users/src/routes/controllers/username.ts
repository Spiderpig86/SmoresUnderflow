import { IMiddleware } from 'koa-router';

import { Context } from 'koa';
import { UserDb } from '../../database';
import { sendError, sendSuccess } from '../../utils/response';
import { ERROR_CODE } from '../../utils/const';

export function getUsername(userDb: UserDb): IMiddleware {
    return async (ctx: Context, next: (err?: any) => void) => {
        const username = ctx.params.username;
        console.time('getusername');

        if (!username) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError('Malformed request');
            return;
        }

        // Check for existing user for username and email
        try {
            console.time('getusername: Find user by username');
            const user = await userDb.findByUsername(username);
            console.timeEnd('getusername: Find user by username');

            if (!user) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError(
                    `No user exists with username ${username}`
                );
                return;
            }

            ctx.status = 200;
            const res = {
                email: user.email,
                reputation: user.reputation,
            }
            ctx.body = sendSuccess('User found', res, 'user');
            console.timeEnd('getusername');

        } catch (e) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError(e.message);
        }
    };
}