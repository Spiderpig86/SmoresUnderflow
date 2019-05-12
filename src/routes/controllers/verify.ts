import { Context } from 'koa';
import { IMiddleware } from 'koa-router';

import { sendError, sendSuccess } from '../../utils/response';
import { UserDb } from '../../database';
import { KEY } from '../../utils/verification-utils';
import { ERROR_CODE } from '../../utils/const';

export function postVerify(userDb: UserDb): IMiddleware {
    return async (ctx: Context) => {
        const body = ctx.request.body;
        const queries = ctx.query;
        let details;

        // Get data from GET/POST req
        if (
            !body || !queries ||
            (Object.entries(body).length === 0 &&
            Object.entries(queries).length === 0)
        ) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError('Malformed request');
            return;
        } else if (Object.entries(body).length !== 0) {
            details = { ...body };
        } else {
            details = { ...queries };
        }
        console.info('/verify', JSON.stringify(details));
        //console.time('verify');

        try {
            //console.time('verify: Find user by email');
            const user = await userDb.findByEmail(details.email);
            //console.timeEnd('verify: Find user by email');
            if (!user) {
                // IUser not found
                console.log('user not found');
                ctx.status = ERROR_CODE;
                ctx.body = sendError('Email is not registered');
                return;
            }

            if (user.verified) {
                console.log('user already verified');
                ctx.status = ERROR_CODE;
                ctx.body = sendError('Email is already registered');
                return;
            }

            // Check if the correct token was used
            if (details.key !== user.token && details.key !== KEY) {
                console.log('uwrong key');
                ctx.status = ERROR_CODE;
                ctx.body = sendError('Incorrect key given.');
                return;
            }

            user.verified = true; // Set to verified
            
            //console.time('verify: Update user');
            await userDb.update(user);
            //console.timeEnd('verify: Update user');

            
            //console.timeEnd('verify');

            ctx.status = 200;
            ctx.body = sendSuccess('Verified user!');
        } catch (ex) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError('Verification failed for user');
        }
    }
}
