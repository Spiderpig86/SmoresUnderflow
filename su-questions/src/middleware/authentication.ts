import { Context } from 'koa';
import { IMiddleware } from 'koa-router';
import { Auth } from '../utils/lib/auth';
import { sendError } from '../utils/response';
import { ERROR_CODE } from '../utils/const';

/**
 * Authentication middleware for verifying user requests given a token.
 *
 * @param authenticator - authenticator instance used to verify token and obtain user data
 */
/**
 * Middleware for protecting routes
 *
 * @export
 * @param {Auth} auth
 * @returns
 */
export function authentication(auth: Auth, allowPublic: boolean = false): IMiddleware {
    return async (ctx: Context, next: (err?: any) => void) => {
        try {
            let token = ctx.cookies.get('access_token');
            if (!token) {
                token = ctx.request.headers['authorization'];
            }
            if (!token) {
                console.log('question: No token given');
                
                if (!allowPublic) {
                    ctx.status = ERROR_CODE;
                    ctx.body = sendError('Invalid token');
                    return;
                }
                
                const ip = ctx.request.headers['x-real-ip'];
                ctx.state.user = {
                    _id: ip,
                    username: ip
                };
            } else {
                console.log('question: Validating');
                console.time('auth: validating');
                ctx.state.user = await auth.validate(token);
                console.timeEnd('auth: validating');
            }
            await next();
        } catch (err) {
            console.log('Invalid token', err);
            ctx.status = ERROR_CODE;
            ctx.body = sendError('Invalid token', err.message);
        }
    };
}
