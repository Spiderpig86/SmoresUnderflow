import { Context } from 'koa';

import { Auth, Hash } from '../../utils/lib';
import { sendSuccess, sendError } from '../../utils/response';
import { UserDb } from '../../database';
import { IMiddleware } from 'koa-router';
import { ERROR_CODE } from '../../utils/const';

export function postLogin(userDb: UserDb): IMiddleware {
    return async (ctx: Context) => {
        try {
            const username = ctx.request.body.username;
            const pass = ctx.request.body.password;
            console.log('/login', ctx.request.body);
            //console.time('login');

            // const hash = new Hash();
            const auth = new Auth(userDb);

            //console.time('login: Find user');
            const user = await userDb.findByUsername(username);
            //console.timeEnd('login: Find user');

            if (!user) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError('User does not exist.');
                return;
            }

            if (!user.verified) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError('User is not registered.');
                return;
            }

            //console.time('login: Verify password');
            if (pass === user.password) {
                const token = await auth.authenticate(user);

                // Generate expiration date to be 3 days from now
                const date = new Date(Date.now());
                date.setDate(date.getDate() + 3);

                // Set cookie
                ctx.cookies.set(
                    'access_token',
                    `${token}; Expires=${date.toUTCString()}; Path=/; Max-Age=86400;`, 
                    { httpOnly: false }
                ); // Must exclude httpOnly to allow local access to cookie

                //console.timeEnd('login: Verify password');
                //console.timeEnd('login');
                ctx.status = 200;
                ctx.body = sendSuccess('Logged in!', { token });
                return;
            }

            ctx.status = ERROR_CODE;
            ctx.body = sendError('Invalid credentials.');
        } catch (e) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError(e.message);
        }
    };
}

export async function postLogout(ctx: Context) {
    //console.time('logout');
    ctx.status = 200;
    ctx.body = sendSuccess(`Successfully logged out!`);
    //console.timeEnd('logout');
    // ctx.set('location', '/login'); // Redirect to login?
}
