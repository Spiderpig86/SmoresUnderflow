import { Context } from 'koa';
import { IMiddleware } from 'koa-router';
import { AnswerDb } from '../../database';
import { sendError, sendSuccess } from '../../utils/response';
import { ERROR_CODE } from '../../utils/const';

export function getAnswer(answerDb: AnswerDb): IMiddleware {
    return async (ctx: Context, next: (err?: any) => void) => {
        const id = ctx.params.id;

        // Insert answer
        try {
            const answer = await answerDb.get(id);
            if (!answer) {
                ctx.status = ERROR_CODE;
                ctx.body = sendError(`Answer not found with id: ${id}`);
                return;
            }

            // console.log(answer.length);

            ctx.status = 200;
            ctx.body = sendSuccess('Successfully found answer', answer);
        } catch (e) {
            ctx.status = ERROR_CODE;
            ctx.body = sendError(e.message);
        }
    };
}
