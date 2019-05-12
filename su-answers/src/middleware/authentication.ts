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
export function authentication(auth: Auth): IMiddleware {
    return async (ctx: Context, next: (err?: any) => void) => {
        try {
            let token = ctx.cookies.get('access_token');
            if (!token) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError('Invalid token')
                return;
            }

            const user = await auth.validate(token);
            ctx.state.user = user; // Pass user to subsequent middleware
            await next();
        } catch (e) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError('Invalid token', e.message)
        }
    };
}
